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
              className="relative hidden min-h-[560px] lg:block"
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute left-[48%] top-[50%] h-[72%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[999px] blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(182,255,0,0.24) 0%, rgba(182,255,0,0.1) 26%, rgba(234,234,234,0.04) 54%, transparent 76%)",
                  }}
                  animate={{
                    x: [-8, 12, -6],
                    y: [8, -12, 10],
                    scale: [0.96, 1.06, 0.98],
                    opacity: [0.35, 0.7, 0.45],
                  }}
                  transition={fluidTransition}
                />

                <motion.div
                  className="absolute left-[52%] top-[12%] h-[74%] w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
                  animate={{
                    x: [-4, 5, -2],
                    y: [0, -8, 4],
                    opacity: [0.22, 0.5, 0.28],
                  }}
                  transition={fluidTransition}
                />

                <motion.div
                  className="absolute left-[14%] top-[10%] h-[80%] w-[74%]"
                  animate={{
                    x: [-8, 10, -5],
                    y: [6, -8, 10],
                  }}
                  transition={fluidTransition}
                >
                  <svg
                    viewBox="0 0 520 620"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="fusion-signal-primary" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(234,234,234,0)" />
                        <stop offset="38%" stopColor="rgba(234,234,234,0.68)" />
                        <stop offset="68%" stopColor="rgba(182,255,0,0.75)" />
                        <stop offset="100%" stopColor="rgba(182,255,0,0)" />
                      </linearGradient>
                      <linearGradient id="fusion-signal-secondary" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(234,234,234,0)" />
                        <stop offset="50%" stopColor="rgba(234,234,234,0.32)" />
                        <stop offset="100%" stopColor="rgba(234,234,234,0)" />
                      </linearGradient>
                    </defs>

                    <g fill="none" strokeLinecap="round">
                      <path
                        d="M18 132C96 88 160 74 224 98C292 124 332 202 398 216C438 224 472 212 506 188"
                        stroke="url(#fusion-signal-primary)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 188C84 154 152 148 220 176C288 204 342 284 410 300C452 310 482 298 514 270"
                        stroke="url(#fusion-signal-secondary)"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M2 248C78 222 148 226 216 262C286 298 346 382 420 398C458 406 486 394 516 372"
                        stroke="url(#fusion-signal-primary)"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M20 322C94 302 162 316 228 360C294 404 350 480 422 492C460 498 486 488 510 470"
                        stroke="url(#fusion-signal-secondary)"
                        strokeWidth="1.1"
                      />
                      <path
                        d="M58 82C124 62 182 80 242 128C302 176 340 262 396 296"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                      <path
                        d="M62 426C122 420 188 448 246 498C284 530 324 548 370 554"
                        stroke="rgba(182,255,0,0.12)"
                        strokeWidth="1"
                      />
                    </g>
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute left-[42%] top-[20%] h-3 w-3 rounded-full border border-white/20 bg-white/80 shadow-[0_0_24px_rgba(234,234,234,0.45)]"
                  animate={{
                    x: [-4, 8, -3],
                    y: [-8, 6, -4],
                    scale: [0.92, 1.1, 0.96],
                    opacity: [0.65, 1, 0.72],
                  }}
                  transition={fluidTransition}
                />

                <motion.div
                  className="absolute left-[56%] top-[46%] h-3 w-3 rounded-full border border-primary/25 bg-primary shadow-[0_0_26px_rgba(182,255,0,0.55)]"
                  animate={{
                    x: [6, -6, 5],
                    y: [8, -10, 6],
                    scale: [0.9, 1.14, 0.94],
                    opacity: [0.7, 1, 0.74],
                  }}
                  transition={slowTransition}
                />

                <motion.div
                  className="absolute left-[70%] top-[68%] h-2.5 w-2.5 rounded-full border border-white/20 bg-white/75 shadow-[0_0_18px_rgba(234,234,234,0.35)]"
                  animate={{
                    x: [-6, 8, -3],
                    y: [6, -8, 4],
                    scale: [0.94, 1.08, 0.98],
                    opacity: [0.55, 0.92, 0.6],
                  }}
                  transition={slowTransition}
                />

                <div className="absolute left-[36%] top-[14%] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Origin
                </div>
                <div className="absolute left-[60%] top-[40%] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Signal
                </div>
                <div className="absolute left-[68%] top-[62%] text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Proof
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
