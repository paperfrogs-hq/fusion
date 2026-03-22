import { useEffect } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

const dotPattern = {
  backgroundImage: "radial-gradient(currentColor 1.2px, transparent 1.2px)",
  backgroundSize: "13px 13px",
};

const floatTransition = {
  duration: 16,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const slowTransition = {
  duration: 22,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const streakTransition = {
  duration: 18,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
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
        <motion.div
          className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[170px]"
          animate={{
            x: [0, 18, -10],
            y: [0, 16, -12],
            scale: [1, 1.07, 0.96],
            opacity: [0.6, 0.95, 0.7],
          }}
          transition={floatTransition}
        />
        <motion.div
          className="absolute left-[8%] top-[18%] h-[280px] w-[280px] rounded-full bg-accent/8 blur-[130px]"
          animate={{
            x: [-18, 22, -10],
            y: [-12, 18, -8],
            scale: [0.9, 1.06, 0.94],
            opacity: [0.26, 0.44, 0.3],
          }}
          transition={slowTransition}
        />
        <motion.div
          className="absolute right-[10%] top-[54%] h-[320px] w-[320px] rounded-full bg-foreground/6 blur-[150px]"
          animate={{
            x: [16, -20, 10],
            y: [10, -22, 8],
            scale: [1, 0.94, 1.08],
            opacity: [0.2, 0.36, 0.24],
          }}
          transition={floatTransition}
        />
        <motion.div
          className="absolute left-[12%] top-[30%] h-[120px] w-[360px] -rotate-12 rounded-full bg-[linear-gradient(90deg,transparent,rgba(234,234,234,0.18),transparent)] blur-3xl"
          animate={{
            x: [-20, 30, -10],
            y: [-8, 14, -4],
            rotate: [-14, -10, -12],
            scaleX: [0.92, 1.06, 0.98],
            opacity: [0.18, 0.34, 0.22],
          }}
          transition={streakTransition}
        />
        <motion.div
          className="absolute right-[10%] top-[58%] h-[140px] w-[380px] rotate-12 rounded-full bg-[linear-gradient(90deg,transparent,rgba(182,255,0,0.18),transparent)] blur-3xl"
          animate={{
            x: [18, -28, 12],
            y: [12, -10, 6],
            rotate: [12, 8, 11],
            scaleX: [1, 0.94, 1.04],
            opacity: [0.18, 0.3, 0.2],
          }}
          transition={streakTransition}
        />
        <motion.div
          className="absolute left-[-2%] top-[12%] h-[280px] w-[420px] -rotate-[14deg] text-foreground/15"
          style={{
            ...dotPattern,
            maskImage: "linear-gradient(90deg, transparent, black 12%, black 82%, transparent)",
          }}
          animate={{
            x: [-10, 16, -6],
            y: [-6, 14, -8],
            rotate: [-15, -11, -13],
            opacity: [0.08, 0.18, 0.1],
          }}
          transition={slowTransition}
        />
        <motion.div
          className="absolute right-[-4%] top-[46%] h-[280px] w-[440px] rotate-[14deg] text-foreground/15"
          style={{
            ...dotPattern,
            maskImage: "linear-gradient(90deg, transparent, black 18%, black 88%, transparent)",
          }}
          animate={{
            x: [12, -18, 8],
            y: [10, -14, 6],
            rotate: [13, 9, 12],
            opacity: [0.08, 0.16, 0.1],
          }}
          transition={slowTransition}
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
