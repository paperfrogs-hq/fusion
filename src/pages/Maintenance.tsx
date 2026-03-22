import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CircleDot,
  Clock3,
  Mail,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";

const maintenanceHighlights = [
  {
    title: "Verification workflows paused",
    description: "API access, dashboards, and uploads are temporarily unavailable while updates are applied.",
    icon: Wrench,
  },
  {
    title: "Records remain protected",
    description: "Existing provenance data and account information stay intact throughout the maintenance window.",
    icon: ShieldCheck,
  },
  {
    title: "Service returns automatically",
    description: "No action is required from users once the platform checks are complete.",
    icon: Clock3,
  },
];

const maintenanceTasks = [
  "Platform infrastructure refresh",
  "Security and stability checks",
  "Post-update validation across core flows",
];

const Maintenance = () => {
  useEffect(() => {
    document.title = "Fusion | Scheduled Maintenance";

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        "Fusion is temporarily offline for scheduled maintenance while we apply platform, security, and reliability updates.",
      );
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute left-[12%] top-16 h-72 w-72 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute bottom-8 right-[8%] h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center py-10 sm:py-14">
        <Container wide className="grid items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center">
                <img
                  src="/Logo.png"
                  alt="Fusion"
                  className="fusion-logo-lockup h-auto w-[170px] shrink-0 sm:w-[210px]"
                />
              </div>

              <Badge className="w-fit">Scheduled Maintenance Window</Badge>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Fusion is receiving a
                  <span className="gradient-text block">secure platform refresh</span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  We are applying infrastructure, security, and reliability updates across the Fusion platform.
                  Access is temporarily paused while we complete validation and bring services back online.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="mailto:info@fusion.paperfrogs.dev">
                    Contact Support
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {maintenanceHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="surface-panel p-4 sm:p-5"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary/70 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.42 }}
          >
            <Panel className="noise relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-2xl border-b border-l border-primary/25" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">System Status</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Maintenance Mode Active</h2>
                </div>
                <div className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-primary">
                  Temporary
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <CircleDot className="mt-0.5 h-4 w-4 text-primary animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Maintenance work is currently in progress.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We are keeping the downtime as short as possible and will restore public access once checks pass.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {maintenanceTasks.map((task, index) => (
                  <div
                    key={task}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-background/60 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">{task}</span>
                    </div>
                    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">In Progress</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-secondary/60 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Availability</p>
                  <p className="mt-2 text-base font-semibold text-foreground">Platform access paused</p>
                  <p className="mt-1 text-sm text-muted-foreground">Public pages, sign-in, and dashboard actions will resume after validation.</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/60 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Data Integrity</p>
                  <p className="mt-2 text-base font-semibold text-foreground">Records remain safe</p>
                  <p className="mt-1 text-sm text-muted-foreground">Stored verification history and provenance records are preserved during maintenance.</p>
                </div>
              </div>

              <div className="mt-6 border-t border-border/80 pt-5 text-sm text-muted-foreground">
                <p>If you need immediate help, contact <a href="mailto:info@fusion.paperfrogs.dev" className="text-primary transition-colors hover:text-[#C8FF2F]">info@fusion.paperfrogs.dev</a>.</p>
              </div>
            </Panel>
          </motion.section>
        </Container>
      </main>

      <div className="relative z-10 border-t border-border/80 py-6">
        <Container wide className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Fusion will return as soon as maintenance checks are complete.</p>
          <p>© 2026 Fusion. Built by Paperfrogs HQ.</p>
        </Container>
      </div>
    </div>
  );
};

export default Maintenance;
