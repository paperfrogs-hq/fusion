// Waitlist Module - Manage early access signups
// Editorial layout: hairline tables, mono-numbered rows, serif italic labels.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";
import { safeErrorMessage } from "@/lib/safe-error";

interface WaitlistUser {
  id: number;
  email: string;
  confirmed: boolean;
  created_at: string;
  source?: string | null;
}

interface WaitlistStats {
  total: number;
  confirmed: number;
  pending: number;
  last24h: number;
  source?: "netlify-function" | "direct-supabase";
  lastFetchedAt?: string;
}

interface FetchedWaitlist {
  entries: WaitlistUser[];
  stats: WaitlistStats;
}

interface FailedSignup {
  id: number;
  email: string;
  source: string | null;
  payload: {
    error_code?: string | null;
    error_message?: string | null;
    received_at?: string | null;
  } | null;
  recovered: boolean;
  recovered_at: string | null;
  created_at: string;
}

const readAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("fusion_admin_session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
};

const formatJoinedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelative = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
};

const WaitlistModule = () => {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [stats, setStats] = useState<WaitlistStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    last24h: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [failed, setFailed] = useState<FailedSignup[]>([]);
  const [failedLoading, setFailedLoading] = useState(false);
  const [replayingId, setReplayingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchFailed();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const adminToken = readAdminToken();

    // Primary path: Netlify function with the service role key.
    if (adminToken) {
      try {
        const response = await fetch(
          "/.netlify/functions/admin-list-waitlist",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
          },
        );

        const body = (await response.json().catch(() => null)) as FetchedWaitlist | null;

        if (response.ok && body) {
          setUsers(body.entries || []);
          if (body.stats) {
            setStats({
              ...body.stats,
              source: "netlify-function",
              lastFetchedAt: "just now",
            });
          } else {
            setStats((prev) => ({
              ...prev,
              source: "netlify-function",
              lastFetchedAt: "just now",
            }));
          }
          setIsLoading(false);
          return;
        }

        // Hard failure from the function — log it so the team can see why.
        console.error(
          "[admin-waitlist-fetch] function failed",
          response.status,
          body,
        );
      } catch (err) {
        console.error("[admin-waitlist-fetch] function unreachable", err);
      }
    }

    // Fallback path: direct Supabase read through the anon client. Works when
    // RLS permits the read, or when the Netlify function is unreachable
    // (e.g. running `npm run dev` without `netlify dev`). Surfaces the row
    // count even when the function returns 0.
    try {
      let query = supabase
        .from("early_access_signups")
        .select("id, email, confirmed, created_at, source", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(2000);

      // Probe with the new column shape first; fall back if it doesn't exist.
      let result = await query;
      if (result.error && /column .* does not exist/i.test(result.error.message || "")) {
        result = await supabase
          .from("early_access_signups")
          .select("id, email, confirmed, created_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(2000);
        result.data = (result.data || []).map((r: any) => ({ ...r, source: null }));
      }

      if (result.error) throw result.error;

      const rows = (result.data as WaitlistUser[]) || [];
      setUsers(rows);

      // Prefer the DB-reported count when available, fall back to row length.
      const total =
        typeof result.count === "number" ? result.count : rows.length;
      const now = Date.now();
      const confirmed = rows.filter((r) => r.confirmed).length;
      const last24h = rows.filter(
        (r) => now - new Date(r.created_at).getTime() < 24 * 60 * 60 * 1000,
      ).length;
      setStats({
        total,
        confirmed,
        pending: total - confirmed,
        last24h,
        source: "direct-supabase",
        lastFetchedAt: "just now",
      });
    } catch (error) {
      console.error("[admin-waitlist-fetch] direct fallback failed", error);
      toast({
        title: "Could not load waitlist",
        description: safeErrorMessage(error, {
          logTag: "admin-waitlist-fetch",
          fallback:
            "We could not reach the waitlist endpoint. Try again, or refresh the page.",
        }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, query]);

  const handleDelete = async (user: WaitlistUser) => {
    if (removingId === user.id) return;
    const adminToken = readAdminToken();

    setRemovingId(user.id);
    let removed = false;

    // Try the Netlify function first.
    if (adminToken) {
      try {
        const response = await fetch(
          "/.netlify/functions/admin-remove-waitlist",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, adminToken }),
          },
        );

        if (response.ok) {
          removed = true;
        } else {
          const body = await response.json().catch(() => null);
          console.error(
            "[admin-waitlist-remove] function failed",
            response.status,
            body,
          );
        }
      } catch (err) {
        console.warn("[admin-waitlist-remove] function unreachable", err);
      }
    }

    // Fallback: direct Supabase delete.
    if (!removed) {
      try {
        const { error } = await supabase
          .from("early_access_signups")
          .delete()
          .eq("id", user.id);
        if (error) throw error;
        removed = true;
      } catch (error) {
        toast({
          title: "Could not remove entry",
          description: safeErrorMessage(error, {
            logTag: "admin-waitlist-remove",
            fallback: "Try again in a moment.",
          }),
          variant: "destructive",
        });
        setRemovingId(null);
        return;
      }
    }

    // best-effort audit trail
    void logAdminAction("waitlist_remove", "early_access_signups", String(user.id), {
      email: user.email,
    });

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setStats((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
    }));
    toast({
      title: "Removed",
      description: `${user.email} is no longer on the list.`,
    });
    setRemovingId(null);
  };

  const exportCsv = () => {
    if (users.length === 0) return;
    const rows = [
      ["email", "confirmed", "created_at", "source"],
      ...users.map((u) => [
        u.email,
        u.confirmed ? "true" : "false",
        u.created_at,
        u.source ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchFailed = async () => {
    const adminToken = readAdminToken();
    if (!adminToken) return;
    setFailedLoading(true);
    try {
      const response = await fetch(
        "/.netlify/functions/admin-list-failed-waitlist?recovered=false",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || "Could not load failed captures.");
      }
      setFailed((body?.entries as FailedSignup[]) || []);
    } catch (err) {
      console.warn("WaitlistModule: failed captures not available yet", err);
      setFailed([]);
    } finally {
      setFailedLoading(false);
    }
  };

  const handleReplay = async (entry: FailedSignup) => {
    const adminToken = readAdminToken();
    if (!adminToken) {
      toast({
        title: "Session expired",
        description: "Sign in again to replay captures.",
        variant: "destructive",
      });
      return;
    }
    setReplayingId(entry.id);
    try {
      const response = await fetch(
        "/.netlify/functions/admin-replay-failed-waitlist",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: entry.id, adminToken }),
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error || "Replay failed.");
      }
      setFailed((prev) => prev.filter((f) => f.id !== entry.id));
      toast({
        title: "Replayed",
        description: `${entry.email} is now on the main waitlist.`,
      });
      fetchUsers();
    } catch (err) {
      toast({
        title: "Replay failed",
        description: safeErrorMessage(err, {
          logTag: "admin-waitlist-replay",
          fallback: "Try again in a moment.",
        }),
        variant: "destructive",
      });
    } finally {
      setReplayingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
            Inbox · Early access
          </p>
          <h2 className="mt-2 font-serif text-2xl font-light italic tracking-tight text-foreground">
            Waitlist
          </h2>
          <p className="mt-2 max-w-measure-64 font-serif text-sm italic text-muted-foreground">
            Every email someone drops into the public form lands here. Search, audit, remove.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportCsv}
            variant="outline"
            size="sm"
            disabled={users.length === 0}
            className="font-serif text-xs italic"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            onClick={fetchUsers}
            variant="ghost"
            size="sm"
            className="font-serif text-xs italic"
          >
            Refresh
          </Button>
        </div>
      </header>

      <div className="hairline" />

      {failed.length > 0 && (
        <section className="rounded-xl border border-ember/40 bg-ember/5 p-5">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-ember" aria-hidden="true" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
                  Failed captures · {failed.length} pending replay
                </p>
                <p className="mt-1 font-serif text-sm italic text-foreground/80">
                  The public signup could not place these. One click replays them into the main waitlist.
                </p>
              </div>
            </div>
            <Button
              onClick={fetchFailed}
              variant="ghost"
              size="sm"
              disabled={failedLoading}
              className="font-serif text-xs italic"
            >
              Refresh
            </Button>
          </header>

          <ul className="mt-4 divide-y divide-rule/70">
            {failed.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-foreground">{entry.email}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    {entry.source ?? "waitlist_page"} · captured {formatRelative(entry.created_at)}
                    {entry.payload?.error_code
                      ? ` · ${entry.payload.error_code}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleReplay(entry)}
                  disabled={replayingId === entry.id}
                  className="inline-flex items-baseline gap-1.5 font-serif text-xs italic text-primary transition-colors hover:text-[#C8FF2F] disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3 self-center" aria-hidden="true" />
                  <span>{replayingId === entry.id ? "Replaying…" : "Replay into waitlist"}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Last 24h", value: stats.last24h },
          { label: "Pending", value: stats.pending },
          { label: "Confirmed", value: stats.confirmed },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/40 px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-2xl font-light italic tabular-nums text-foreground">
              {String(stat.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </section>

      {stats.source && (
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
          Counts served via {stats.source}
          {stats.lastFetchedAt
            ? ` · refreshed ${
                stats.lastFetchedAt === "just now"
                  ? "just now"
                  : stats.lastFetchedAt
              }`
            : ""}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by email"
            className="h-9 rounded-lg border border-rule bg-card/40 pl-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          {filtered.length} of {users.length}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-rule bg-card/40">
          <p className="font-serif text-sm italic text-muted-foreground">Loading waitlist…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-rule bg-card/30 px-6 text-center">
          <p className="font-serif text-base italic text-foreground">Inbox empty.</p>
          <p className="mt-2 max-w-measure-64 font-serif text-xs italic text-muted-foreground">
            Once someone joins the public waitlist their email lands here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-rule bg-card/40">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-rule text-muted-foreground/80">
                  <th className="w-14 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                    #
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                    Email
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                    Status
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.015, 0.3) }}
                    className="group border-b border-rule/70 transition-colors last:border-b-0 hover:bg-card/60"
                  >
                    <td className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-foreground">{user.email}</p>
                      {user.source && (
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                          via {user.source}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.confirmed
                            ? "font-mono text-[10px] uppercase tracking-[0.22em] text-primary"
                            : "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80"
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={`mr-1.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full align-middle ${
                            user.confirmed ? "bg-primary" : "bg-muted-foreground/60"
                          }`}
                        />
                        {user.confirmed ? "Confirmed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-serif text-xs italic text-foreground/90">
                        {formatJoinedAt(user.created_at)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                        {formatRelative(user.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={removingId === user.id}
                        aria-label={`Remove ${user.email} from waitlist`}
                        className="inline-flex items-baseline gap-1.5 font-serif text-xs italic text-muted-foreground/80 transition-colors hover:text-ember disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3 self-center" aria-hidden="true" />
                        <span>{removingId === user.id ? "Removing…" : "Remove"}</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && query && (
            <div className="border-t border-rule/70 px-4 py-6 text-center font-serif text-xs italic text-muted-foreground">
              No entries match "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitlistModule;