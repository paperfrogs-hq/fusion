// Analytics Dashboard Overview Module
// Editorial admin dashboard. Live Supabase counts only. No fake stats.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";
import { safeErrorMessage } from "@/lib/safe-error";

interface Snapshot {
  waitlist: number;
  waitlistConfirmed: number;
  waitlistLast24h: number;
  individualCreators: number;
  businessClients: number;
  audioFiles: number;
  verifiedFiles: number;
  pendingFiles: number;
  tamperDetections: number;
  recentAuditEvents: number;
  lastSignupAt: string | null;
}

const EMPTY_SNAPSHOT: Snapshot = {
  waitlist: 0,
  waitlistConfirmed: 0,
  waitlistLast24h: 0,
  individualCreators: 0,
  businessClients: 0,
  audioFiles: 0,
  verifiedFiles: 0,
  pendingFiles: 0,
  tamperDetections: 0,
  recentAuditEvents: 0,
  lastSignupAt: null,
};

const formatRelative = (iso: string | null): string => {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "unknown";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
};

const formatJoined = (iso: string | null): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const pad = (n: number): string => String(n).padStart(2, "0");

const AnalyticsDashboard = () => {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        waitlistRes,
        waitlistConfirmedRes,
        waitlistLast24hRes,
        individualRes,
        clientRes,
        audioRes,
        verifiedRes,
        pendingRes,
        tamperRes,
        auditRes,
        lastSignupRes,
      ] = await Promise.all([
        supabase.from("early_access_signups").select("*", { count: "exact", head: true }),
        supabase
          .from("early_access_signups")
          .select("*", { count: "exact", head: true })
          .eq("confirmed", true),
        supabase
          .from("early_access_signups")
          .select("*", { count: "exact", head: true })
          .gt(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .neq("user_type", "client"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "client"),
        supabase.from("user_audio_files").select("*", { count: "exact", head: true }),
        supabase
          .from("user_audio_files")
          .select("*", { count: "exact", head: true })
          .eq("provenance_status", "verified"),
        supabase
          .from("user_audio_files")
          .select("*", { count: "exact", head: true })
          .eq("provenance_status", "pending"),
        supabase
          .from("audio_registry")
          .select("*", { count: "exact", head: true })
          .eq("tamper_detected", true),
        supabase
          .from("admin_audit_log")
          .select("*", { count: "exact", head: true })
          .gt(
            "timestamp",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase
          .from("early_access_signups")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      // Treat network/RLS failures as zero rather than crashing the page.
      const safe = (res: { count: number | null } | null) => res?.count ?? 0;

      setSnapshot({
        waitlist: safe(waitlistRes),
        waitlistConfirmed: safe(waitlistConfirmedRes),
        waitlistLast24h: safe(waitlistLast24hRes),
        individualCreators: safe(individualRes),
        businessClients: safe(clientRes),
        audioFiles: safe(audioRes),
        verifiedFiles: safe(verifiedRes),
        pendingFiles: safe(pendingRes),
        tamperDetections: safe(tamperRes),
        recentAuditEvents: safe(auditRes),
        lastSignupAt: lastSignupRes?.created_at ?? null,
      });
      setLastFetchedAt(new Date().toISOString());
    } catch (err) {
      setError(safeErrorMessage(err, { logTag: "analytics-dashboard", fallback: "Could not load the live snapshot. The team has been notified." }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const successRate =
    snapshot.audioFiles > 0
      ? Math.round((snapshot.verifiedFiles / snapshot.audioFiles) * 100)
      : null;

  const TILES = [
    {
      label: "Waitlist",
      value: snapshot.waitlist,
      hint: `${snapshot.waitlistLast24h} in the last 24h · ${snapshot.waitlistConfirmed} confirmed`,
    },
    {
      label: "Individual creators",
      value: snapshot.individualCreators,
      hint: "User portal accounts (non-client)",
    },
    {
      label: "Business clients",
      value: snapshot.businessClients,
      hint: "Client portal organizations / accounts",
    },
    {
      label: "Audio files",
      value: snapshot.audioFiles,
      hint: `${snapshot.verifiedFiles} verified · ${snapshot.pendingFiles} pending`,
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
            Overview · Live snapshot
          </p>
          <h2 className="mt-2 font-serif text-2xl font-light italic tracking-tight text-foreground">
            Welcome back.
          </h2>
          <p className="mt-2 max-w-measure-64 font-serif text-sm italic text-muted-foreground">
            Counts are pulled directly from Supabase. Refresh any time to re-query.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastFetchedAt && (
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Updated {formatRelative(lastFetchedAt)}
            </p>
          )}
          <button
            onClick={fetchSnapshot}
            disabled={isLoading}
            className="link-underline font-serif text-xs italic text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-ember/40 bg-ember/5 px-4 py-3 font-serif text-xs italic text-ember">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule lg:grid-cols-4">
        {TILES.map((tile, index) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="bg-card/40 px-5 py-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              {tile.label}
            </p>
            <p className="mt-3 font-serif text-4xl font-light italic tabular-nums text-foreground">
              {pad(tile.value)}
            </p>
            <p className="mt-3 font-serif text-xs italic leading-snug text-muted-foreground">
              {tile.hint}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Pipeline · Audio provenance
            </p>
            {successRate !== null && (
              <p className="font-mono text-[10px] tabular-nums tracking-[0.22em] text-muted-foreground/80">
                {successRate}% verified
              </p>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-rule bg-card/40">
            <table className="w-full border-collapse text-left">
              <tbody>
                <Row label="Audio files" value={snapshot.audioFiles} />
                <Row label="Verified" value={snapshot.verifiedFiles} accent="primary" />
                <Row label="Pending verification" value={snapshot.pendingFiles} />
                <Row label="Tamper detections" value={snapshot.tamperDetections} accent="ember" last />
              </tbody>
            </table>
          </div>

          {successRate !== null && snapshot.audioFiles > 0 && (
            <div className="mt-5">
              <div className="h-px w-full overflow-hidden bg-rule">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${successRate}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-px bg-primary"
                />
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Verified rate
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
            Activity · Audit log
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-rule bg-card/40">
            <table className="w-full border-collapse text-left">
              <tbody>
                <Row label="Events in the last 7 days" value={snapshot.recentAuditEvents} />
                <Row
                  label="Last waitlist signup"
                  value={formatJoined(snapshot.lastSignupAt)}
                  valueIsString
                />
                <Row label="Last sync" value={formatRelative(lastFetchedAt)} valueIsString last />
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-rule pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Quick actions
            </p>
            <ul className="mt-3 space-y-2 font-serif text-sm italic text-foreground/90">
              <li>
                <button
                  onClick={() => {
                    void logAdminAction("dashboard_refresh", "admin_dashboard");
                    fetchSnapshot();
                  }}
                  className="link-underline"
                >
                  Refresh the snapshot
                </button>
              </li>
              <li>
                Use the sidebar to drill into Waitlist, Audit log, or Key management for the full picture.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

interface RowProps {
  label: string;
  value: number | string;
  accent?: "primary" | "ember";
  valueIsString?: boolean;
  last?: boolean;
}

const Row = ({ label, value, accent, valueIsString, last }: RowProps) => {
  const accentClass =
    accent === "primary"
      ? "text-primary"
      : accent === "ember"
        ? "text-ember"
        : "text-foreground";

  return (
    <tr
      className={`group transition-colors hover:bg-card/60 ${
        last ? "" : "border-b border-rule/70"
      }`}
    >
      <td className="px-4 py-3 font-serif text-sm italic text-foreground/90">
        {label}
      </td>
      <td
        className={`px-4 py-3 text-right font-mono text-sm tabular-nums ${accentClass}`}
      >
        {valueIsString ? value : pad(typeof value === "number" ? value : 0)}
      </td>
    </tr>
  );
};

export default AnalyticsDashboard;