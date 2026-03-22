import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const dotPattern = {
  backgroundImage: "radial-gradient(currentColor 1.4px, transparent 1.4px)",
  backgroundSize: "14px 14px",
};

const fluidTransition = {
  duration: 18,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const slowTransition = {
  duration: 24,
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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#020403_0%,#020403_45%,#030605_100%)]" />
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(234,234,234,0.06),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(182,255,0,0.08),transparent_30%),radial-gradient(circle_at_52%_82%,rgba(182,255,0,0.06),transparent_28%)]" />

        <motion.div
          className="absolute left-[4%] top-[16%] h-[320px] w-[420px] text-foreground/12"
          style={{
            ...dotPattern,
            maskImage: "radial-gradient(circle at 42% 48%, black 0%, black 42%, transparent 74%)",
          }}
          animate={{
            x: [-18, 16, -8],
            y: [-8, 14, -10],
            rotate: [-18, -12, -15],
            opacity: [0.08, 0.2, 0.12],
          }}
          transition={slowTransition}
        />

        <motion.div
          className="absolute right-[-2%] top-[42%] h-[320px] w-[460px] text-foreground/12"
          style={{
            ...dotPattern,
            maskImage: "radial-gradient(circle at 58% 50%, black 0%, black 44%, transparent 76%)",
          }}
          animate={{
            x: [16, -22, 10],
            y: [8, -14, 12],
            rotate: [14, 9, 12],
            opacity: [0.08, 0.18, 0.11],
          }}
          transition={slowTransition}
        />

        <motion.div
          className="absolute left-[10%] top-[30%] h-[140px] w-[420px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(234,234,234,0.22),transparent)] blur-3xl"
          animate={{
            x: [-26, 30, -12],
            y: [-10, 16, -6],
            rotate: [-14, -8, -11],
            scaleX: [0.9, 1.08, 0.96],
            opacity: [0.16, 0.34, 0.18],
          }}
          transition={fluidTransition}
        />

        <motion.div
          className="absolute right-[8%] top-[56%] h-[160px] w-[440px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(182,255,0,0.24),transparent)] blur-3xl"
          animate={{
            x: [18, -26, 10],
            y: [10, -14, 6],
            rotate: [12, 7, 10],
            scaleX: [1, 0.92, 1.04],
            opacity: [0.14, 0.3, 0.16],
          }}
          transition={fluidTransition}
        />

        <motion.div
          className="absolute left-[50%] top-[46%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[180px]"
          animate={{
            x: [0, 20, -16],
            y: [0, 16, -10],
            scale: [1, 1.08, 0.95],
            opacity: [0.5, 0.92, 0.62],
          }}
          transition={fluidTransition}
        />

        <motion.div
          className="absolute left-[62%] top-[26%] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[140px]"
          animate={{
            x: [14, -18, 8],
            y: [-12, 18, -6],
            scale: [0.92, 1.04, 0.96],
            opacity: [0.18, 0.32, 0.2],
          }}
          transition={slowTransition}
        />

        <motion.div
          className="absolute left-[24%] top-[68%] h-[260px] w-[260px] rounded-full bg-foreground/5 blur-[130px]"
          animate={{
            x: [-10, 18, -8],
            y: [10, -16, 6],
            scale: [1.02, 0.94, 1.08],
            opacity: [0.12, 0.2, 0.14],
          }}
          transition={slowTransition}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-6 pb-4 pt-6 sm:px-10 md:px-14 md:pt-8">
          <img
            src="/Logo.png"
            alt="Fusion"
            className="fusion-logo-lockup h-auto w-[150px] sm:w-[175px]"
          />
        </header>

        <main className="flex flex-1 items-center">
          <Container wide className="grid items-center gap-12 px-6 pb-12 pt-6 sm:px-10 md:px-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Site Maintenance
              </p>

              <h1 className="mt-6 text-balance text-[3.4rem] font-semibold leading-[0.92] tracking-[-0.04em] text-foreground sm:text-[4.6rem] lg:text-[6.2rem]">
                We&apos;re getting
                <span className="gradient-text block">launched soon</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                We&apos;re making the final tweaks behind the scenes. For any queries, contact{" "}
                <a
                  href="mailto:hello@paperfrogs.dev"
                  className="text-foreground underline decoration-primary/35 underline-offset-4 transition-colors hover:text-primary"
                >
                  hello@paperfrogs.dev
                </a>
                .
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Fusion
                </span>
                <span>Paperfrogs Labs</span>
                <span>Audio Trust Platform</span>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="relative hidden min-h-[520px] lg:block"
            >
              <div className="absolute inset-0">
                <motion.div
                  className="absolute left-[10%] top-[12%] h-[240px] w-[240px] rounded-full border border-white/10"
                  animate={{
                    x: [-8, 10, -6],
                    y: [-10, 14, -8],
                    scale: [1, 1.05, 0.97],
                    rotate: [0, 8, -4],
                  }}
                  transition={slowTransition}
                />

                <motion.div
                  className="absolute left-[26%] top-[24%] h-[320px] w-[320px] rounded-full border border-primary/20"
                  animate={{
                    x: [10, -12, 8],
                    y: [8, -10, 12],
                    scale: [0.96, 1.04, 0.98],
                    rotate: [0, -6, 4],
                  }}
                  transition={fluidTransition}
                />

                <motion.div
                  className="absolute left-[8%] top-[52%] h-[120px] w-[280px] rounded-full border border-white/8 bg-white/[0.015] backdrop-blur-sm"
                  animate={{
                    x: [-12, 18, -6],
                    y: [10, -8, 12],
                    rotate: [-8, -3, -6],
                  }}
                  transition={fluidTransition}
                />

                <motion.div
                  className="absolute right-[2%] top-[18%] h-[150px] w-[320px] rounded-full border border-primary/15 bg-primary/[0.04] backdrop-blur-sm"
                  animate={{
                    x: [16, -18, 8],
                    y: [-8, 12, -4],
                    rotate: [12, 6, 9],
                  }}
                  transition={slowTransition}
                />

                <motion.div
                  className="absolute right-[6%] bottom-[12%] h-[220px] w-[220px] rounded-full border border-white/10"
                  animate={{
                    x: [8, -10, 6],
                    y: [12, -14, 8],
                    scale: [0.98, 1.06, 0.94],
                  }}
                  transition={slowTransition}
                />

                <div className="absolute left-[16%] top-[18%] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Private
                </div>
                <div className="absolute left-[56%] top-[38%] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Verifiable
                </div>
                <div className="absolute left-[20%] bottom-[18%] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Launching Soon
                </div>
              </div>
            </motion.section>
          </Container>
        </main>

        <footer className="px-6 pb-8 sm:px-10 md:px-14">
          <div className="flex flex-col gap-2 border-t border-white/8 pt-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Fusion by Paperfrogs Labs</span>
            <span>hello@paperfrogs.dev</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Maintenance;
