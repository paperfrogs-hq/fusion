import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Activity, ArrowRight, CheckCircle2, Database, FileBadge2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionBadge from "./SectionBadge";
import { Section } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";

const HeroSection = () => {
  const navigate = useNavigate();

  const badges = [
    { icon: ShieldCheck, label: "Cryptographic Integrity" },
    { icon: Activity, label: "Tamper Detection" },
    { icon: Database, label: "Audit-Ready Logs" },
  ];

  return (
    <Section className="overflow-hidden pb-20 pt-36 sm:pb-24 md:pt-40" containerClassName="relative z-10">
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient" />
      <div className="pointer-events-none absolute inset-0 bg-animated-grid opacity-40" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-primary/20 blur-[110px] animate-drift" />
      <div className="pointer-events-none absolute -right-14 bottom-20 h-72 w-72 rounded-full bg-accent/15 blur-[120px] animate-drift" />

      <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-4xl"
        >
          <SectionBadge>Cryptographic Audio Provenance</SectionBadge>

          <div className="mt-6 space-y-4">
            <h1 className="text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground sm:text-6xl md:text-7xl xl:text-8xl">
              Fusion.
              <span className="block gradient-text">The Trust Layer for Audio in the AI Era</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cryptographic audio provenance by Fusion. Embed immutable source proof, detect
              tampering instantly, and run verification workflows at infrastructure scale.
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
              Secure • Fast • Verifiable
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button variant="hero" size="lg" onClick={() => navigate("/user/signup")}>
              Get Started as Creator
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="hero-outline" size="lg" onClick={() => navigate("/client/signup")}>
              For Enterprise
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.34, duration: 0.4 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            {badges.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-4 py-2 text-xs text-muted-foreground sm:text-sm"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>

        </motion.div>

        <Reveal className="relative" delay={0.08} y={24}>
          <Panel className="noise p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/Logo-01-transparent.png" alt="Fusion logo" className="fusion-logo-lockup h-auto w-[150px]" />
              </div>
              <div className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-primary">
                Verification Snapshot
              </div>
            </div>

            <div className="rounded-xl border border-primary/35 bg-primary/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">Result</p>
                  <p className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Verified Authentic
                  </p>
                </div>
                <span className="rounded-full border border-primary/40 bg-background/50 px-3 py-1 text-xs font-semibold text-primary">
                  98.7%
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary/65 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Processing Time</p>
                <p className="mt-1 text-sm font-semibold text-foreground">&lt; 300ms</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/65 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Source Trust</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Attested</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { label: "Fingerprint", value: "a7d9...4f31" },
                { label: "Provenance ID", value: "fsn-2c91...aa2f" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-secondary/65 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileBadge2 className="h-3.5 w-3.5 text-primary" />
                    {item.label}
                  </div>
                  <span className="font-mono text-xs text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
};

export default HeroSection;
