import { motion } from "framer-motion";
import { ArrowUpRight, Check, Mail } from "lucide-react";
import { useState } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { addEmailToWaitlist } from "@/lib/supabase-client";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<"created" | "queued" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const result = await addEmailToWaitlist({
        email: email.trim().toLowerCase(),
        source: "waitlist_page",
      });
      // "created" / "duplicate" mean the user is on the list.
      // "queued" means the primary insert failed but we captured the lead into
      // a fallback table the team replays from the admin panel — still a win.
      if (
        result.status === "created" ||
        result.status === "duplicate" ||
        result.status === "queued"
      ) {
        setSubmitted(result.status === "queued" ? "queued" : "created");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save your email just now.";
      console.error("[waitlist-form] submit failed", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      <main className="relative z-10 pb-24 pt-36 sm:pt-44 lg:pt-52">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mx-auto max-w-measure-64"
          >
            <p className="font-serif text-sm italic text-muted-foreground">
              03 <span className="mx-3 inline-block h-px w-6 align-middle bg-rule" /> Waitlist
            </p>

            <h1 className="mt-6 font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.025em] text-foreground">
              We will email you{" "}
              <span className="font-serif italic text-foreground/95">when it is ready.</span>
            </h1>

            <p className="mt-6 text-prose text-muted-foreground">
              Fusion is in private testing. Drop your email and we will let you know the moment
              there is something worth trying. No demo calls, no SDR funnel, no marketing list.
            </p>

            <div className="mt-12 hairline" />

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-12 flex items-center gap-3"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-serif text-lg italic text-foreground">
                    {submitted === "queued"
                      ? "We got it. Replaying into the queue."
                      : "You are on the list."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {submitted === "queued"
                      ? "Our system caught your signup in a fallback queue. The team will replay it into the main waitlist shortly."
                      : "We saved your email. One email when the engine is ready. That is the whole deal."}
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-12" noValidate>
                <label
                  htmlFor="email"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80"
                >
                  Your email
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="you@studio.com"
                      aria-invalid={error ? "true" : undefined}
                      aria-describedby={error ? "waitlist-error" : undefined}
                      className="h-12 w-full rounded-xl border border-rule bg-card/60 pl-11 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={loading} className="sm:w-auto">
                    {loading ? "Adding…" : "Join the waitlist"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                {error && (
                  <div
                    id="waitlist-error"
                    role="alert"
                    className="mt-4 space-y-1 font-serif text-xs italic text-ember"
                  >
                    <p>{error}</p>
                    <p className="not-italic text-muted-foreground">
                      Try once more. If it still fails we keep your address in a fallback queue and replay it by hand. You can also email{" "}
                      <a
                        href="mailto:hello@paperfrogs.dev"
                        className="link-underline"
                      >
                        hello@paperfrogs.dev
                      </a>
                      .
                    </p>
                  </div>
                )}
                <p className="mt-4 font-serif text-xs italic text-muted-foreground/85">
                  One email, when the engine is ready. Nothing else.
                </p>
              </form>
            )}

            <div className="mt-16 hairline" />

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  What we will send
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  One short email. A link to try the engine. That is the whole list.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  What we will not send
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  Newsletters. Updates. Re-engagement campaigns. Discount offers. Anything else.
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Waitlist;