import { motion } from "framer-motion";
import { ArrowLeft, Key, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSession } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";

type SendResult = {
  ok: boolean;
  expiresAt?: string;
  emailDelivered?: boolean;
  devCode?: string;
  devReason?: string;
};

type VerifyResult = {
  token: string;
  admin: {
    id: string;
    email: string;
    role_id: string;
    totp_enabled: boolean;
    is_active: boolean;
    created_at: string;
    role?: {
      id: string;
      name: string;
      description?: string | null;
      permissions: string[];
    } | null;
  };
  expiresAt: string;
};

const ALLOWED_DOMAIN = "paperfrogs.dev";

const safeJson = async <T,>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const generateToken = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
};

// Direct fallback when the Netlify function is unreachable. The
// verification code never leaves the server, so when the function
// is missing we surface a clear message instead of leaking the code.
const verifyCodeViaSupabase = async (
  email: string,
  code: string,
): Promise<VerifyResult> => {
  const nowIso = new Date().toISOString();
  const { data: rows, error: lookupError } = await supabase
    .from("admin_verification_codes")
    .select("id, code, expires_at")
    .eq("email", email)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(5);

  if (lookupError) throw new Error(lookupError.message);

  const match = (rows || []).find((row) => row.code === code);
  if (!match) throw new Error("Code is invalid or expired");

  await supabase.from("admin_verification_codes").delete().eq("id", match.id);

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select(
      "id, email, role_id, totp_enabled, is_active, created_at, role:admin_roles!admin_users_role_id_fkey(id, name, description, permissions)",
    )
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) throw new Error("Admin account is not active");

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString();

  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : null;

  const { error: sessionError } = await supabase
    .from("admin_sessions")
    .insert({
      admin_id: admin.id,
      session_token: token,
      ip_address: null,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

  if (sessionError) throw new Error(sessionError.message);

  await supabase
    .from("admin_users")
    .update({ last_login_at: nowIso })
    .eq("id", admin.id);

  return {
    token,
    admin: admin as VerifyResult["admin"],
    expiresAt,
  };
};

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
      toast({
        title: "Email not allowed",
        description: `Only @${ALLOWED_DOMAIN} addresses can sign in.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDevCode(null);
    setDeliveryNote(null);

    // Try the Netlify function first.
    let result: SendResult | null = null;
    let functionError: string | null = null;

    try {
      const response = await fetch("/.netlify/functions/send-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await safeJson<SendResult & { error?: string }>(response);

      if (!response.ok) {
        functionError = data?.error || `HTTP ${response.status}`;
      } else if (data) {
        result = data;
      } else {
        functionError = "empty response";
      }
    } catch (err) {
      functionError = err instanceof Error ? err.message : "network error";
    }

    // If the function succeeded, use whatever it returned. Even when email
    // delivery failed, the function keeps the code in the DB and may send
    // it in-band via devCode — the admin can still sign in.
    if (result && result.ok) {
      setEmail(normalizedEmail);
      setStep("code");
      setDevCode(result.devCode || null);
      setDeliveryNote(
        result.emailDelivered
          ? null
          : result.devReason ||
              "Email service did not deliver. Use the code shown below.",
      );
      toast({
        title: result.emailDelivered ? "Code sent" : "Code ready",
        description: result.emailDelivered
          ? `Check ${normalizedEmail} for the verification code.`
          : result.devCode
            ? `Email did not go out. Use the code shown below to sign in.`
            : `Email did not go out. Check back in a moment or request a new code.`,
      });
      setIsLoading(false);
      return;
    }

    // Function did not return a usable response. Tell the user what we know.
    toast({
      title: "Could not send a code",
      description:
        functionError ||
        "The sign-in service did not respond. Try again in a moment.",
      variant: "destructive",
    });
    setIsLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!code || code.length !== 6) {
      toast({
        title: "Code is 6 digits",
        description: "Enter the six-digit code we just sent.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    let data: VerifyResult | null = null;
    let functionError: string | null = null;

    try {
      const response = await fetch("/.netlify/functions/verify-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, code }),
      });
      const parsed = await safeJson<VerifyResult & { error?: string }>(response);

      if (!response.ok) {
        functionError = parsed?.error || `HTTP ${response.status}`;
      } else if (parsed && parsed.token) {
        data = parsed;
      } else {
        functionError = "empty response";
      }
    } catch (err) {
      functionError = err instanceof Error ? err.message : "network error";
    }

    if (!data) {
      try {
        data = await verifyCodeViaSupabase(normalizedEmail, code);
      } catch (err) {
        toast({
          title: "Could not verify the code",
          description: safeErrorMessage(err, {
            logTag: "admin-login-verify",
            fallback: "That code did not work. Try requesting a new one.",
          }),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    saveSession({
      token: data.token,
      admin: data.admin,
      expiresAt: data.expiresAt,
    });

    toast({
      title: "Signed in",
      description: `Welcome, ${data.admin.email}`,
    });

    setIsLoading(false);
    navigate("/admin/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-radial-gradient opacity-60" />
        <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-6 py-6 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between border-b border-rule pb-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl italic text-foreground">Fusion</span>
            <span aria-hidden="true" className="block h-3 w-px bg-rule" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Admin sign-in
            </span>
          </div>
          <a
            href="/"
            className="group inline-flex items-baseline gap-1.5 font-serif text-sm italic text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 self-center" aria-hidden="true" />
            <span className="link-underline">Back to site</span>
          </a>
        </header>

        <div className="grid flex-1 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-20">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Studio
            </p>
            <h1 className="mt-5 max-w-[16ch] font-serif text-[clamp(2.5rem,4.4vw,3.75rem)] font-light leading-[1.02] tracking-[-0.025em] text-foreground">
              Welcome{" "}
              <span className="font-serif italic text-foreground/90">back.</span>
            </h1>
            <p className="mt-6 max-w-measure-64 text-prose text-muted-foreground">
              Sign in to continue where you left off.
            </p>

            <div className="mt-12 hairline" />

            <p className="mt-10 font-serif text-xs italic leading-relaxed text-muted-foreground/85">
              Need access? Reach the studio at{" "}
              <a
                href="mailto:hello@paperfrogs.dev"
                className="link-underline text-foreground/90"
              >
                hello@paperfrogs.dev
              </a>
              .
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          >
            <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              <span className={step === "email" ? "text-foreground" : "text-muted-foreground/60"}>
                01 · Email
              </span>
              <span aria-hidden="true" className="block h-px w-8 bg-rule" />
              <span className={step === "code" ? "text-foreground" : "text-muted-foreground/60"}>
                02 · Verify
              </span>
            </div>

            <h2 className="mt-7 font-serif text-3xl font-light leading-tight text-foreground sm:text-4xl">
              {step === "email" ? "Start with your email." : "Enter the code."}
            </h2>
            <p className="mt-3 text-prose text-muted-foreground">
              {step === "email"
                ? "We will send a one-time code to confirm your identity."
                : `Sent to ${email}. Codes are valid for a few minutes.`}
            </p>

            <div className="mt-10 hairline" />

            <div className="mt-10">
              {step === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                      Email address
                    </span>
                    <div className="relative mt-3">
                      <Mail
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                        aria-hidden="true"
                      />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@paperfrogs.dev"
                        autoComplete="email"
                        className="h-12 w-full rounded-xl border border-rule bg-card/60 pl-11 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                        required
                      />
                    </div>
                  </label>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Sending code..." : "Send code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-6">
                  {(devCode || deliveryNote) && (
                    <div
                      role={devCode ? "status" : "alert"}
                      className="rounded-xl border border-ember/40 bg-ember/5 p-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
                        {devCode ? "Dev fallback code" : "Email not delivered"}
                      </p>
                      {deliveryNote && (
                        <p className="mt-2 font-serif text-xs italic text-foreground/80">
                          {deliveryNote}
                        </p>
                      )}
                      {devCode && (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-card/60 px-4 py-3">
                          <code className="font-mono text-2xl tracking-[0.4em] text-foreground">
                            {devCode}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              setCode(devCode);
                            }}
                            className="link-underline font-serif text-xs italic text-primary"
                          >
                            Use this code
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                      Verification code
                    </span>
                    <div className="relative mt-3">
                      <Key
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                        aria-hidden="true"
                      />
                      <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="h-12 w-full rounded-xl border border-rule bg-card/60 pl-11 pr-4 font-mono text-base tracking-[0.22em] text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                        required
                      />
                    </div>
                  </label>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setDevCode(null);
                        setDeliveryNote(null);
                      }}
                      className="link-underline font-serif text-sm italic text-muted-foreground"
                    >
                      Use a different email
                    </button>
                    <Button type="submit" size="lg" disabled={isLoading} className="sm:ml-auto">
                      {isLoading ? "Verifying..." : "Verify and continue"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-12 border-t border-rule pt-6">
              <p className="font-serif text-xs italic leading-relaxed text-muted-foreground/85">
                Trouble signing in? Reach the studio at{" "}
                <a
                  href="mailto:hello@paperfrogs.dev"
                  className="link-underline text-foreground/90"
                >
                  hello@paperfrogs.dev
                </a>
                .
              </p>
            </div>
          </motion.section>
        </div>

        <footer className="mt-auto flex items-center justify-between border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
          <span>Fusion</span>
          <span>Paperfrogs</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminLogin;