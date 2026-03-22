import { useEffect } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

const dotPattern = {
  backgroundImage: "radial-gradient(currentColor 1.2px, transparent 1.2px)",
  backgroundSize: "13px 13px",
};

const Maintenance = () => {
  useEffect(() => {
    document.title = "Fusion | Launching Soon";

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        "Fusion is getting ready to launch soon. For any queries, contact hello@paperfrogs.dev.",
      );
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.08),transparent_34%),linear-gradient(180deg,rgba(2,4,3,0.2),rgba(2,4,3,0.88))]" />
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[170px]" />
        <div
          className="absolute left-[-2%] top-[12%] h-[280px] w-[420px] -rotate-[14deg] text-foreground/15"
          style={{
            ...dotPattern,
            maskImage: "linear-gradient(90deg, transparent, black 12%, black 82%, transparent)",
          }}
        />
        <div
          className="absolute right-[-4%] top-[46%] h-[280px] w-[440px] rotate-[14deg] text-foreground/15"
          style={{
            ...dotPattern,
            maskImage: "linear-gradient(90deg, transparent, black 18%, black 88%, transparent)",
          }}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center py-10">
        <Container className="max-w-5xl">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="surface-panel relative mx-auto max-w-4xl overflow-hidden border-white/10 bg-card/50 text-center backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(234,234,234,0.02),transparent_44%,rgba(182,255,0,0.05)_100%)]" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[28px] border-b border-l border-primary/20" />
            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-tr-[24px] border-r border-t border-primary/15" />

            <div className="relative px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-20">
              <img
                src="/Logo.png"
                alt="Fusion"
                className="fusion-logo-lockup mx-auto h-auto w-[160px] sm:w-[190px]"
              />

              <Badge className="mx-auto mt-6 w-fit">Site Maintenance</Badge>

              <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Paperfrogs Labs
              </p>

              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] text-foreground sm:text-5xl md:text-6xl">
                We&apos;re getting
                <span className="gradient-text block">launched soon</span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                We&apos;re making the final tweaks behind the scenes.
                <br />
                For any queries, contact{" "}
                <a
                  href="mailto:hello@paperfrogs.dev"
                  className="text-foreground transition-colors hover:text-primary"
                >
                  hello@paperfrogs.dev
                </a>
                .
              </p>
            </div>
          </motion.section>
        </Container>
      </main>
    </div>
  );
};

export default Maintenance;
