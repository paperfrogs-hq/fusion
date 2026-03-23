import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const ambientTransition = {
  duration: 20,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const fieldTransition = {
  duration: 18,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const contourTransition = {
  duration: 15,
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#06110d_0%,#020504_44%,#010201_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(163,255,84,0.12),transparent_26%),radial-gradient(circle_at_76%_12%,rgba(133,255,196,0.08),transparent_24%),radial-gradient(circle_at_50%_52%,rgba(82,255,155,0.06),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_24%,transparent_70%,rgba(0,0,0,0.42))]" />
        <div className="absolute inset-x-0 top-0 h-[52%] bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.18)_72%,transparent)]" />

        <motion.div
          className="absolute left-[10%] top-[8%] h-[28rem] w-[34rem] rounded-full blur-[120px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(177,255,84,0.24) 0%, rgba(117,255,141,0.14) 28%, rgba(33,104,74,0.08) 46%, transparent 74%)",
          }}
          animate={{
            x: [-10, 12, -6],
            y: [8, -10, 6],
            scale: [0.98, 1.04, 1],
            opacity: [0.24, 0.34, 0.28],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute right-[8%] top-[20%] h-[22rem] w-[28rem] rounded-full blur-[120px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(178,255,106,0.16) 0%, rgba(128,255,218,0.1) 24%, rgba(28,76,57,0.06) 44%, transparent 74%)",
          }}
          animate={{
            x: [8, -10, 4],
            y: [10, -12, 7],
            scale: [1, 1.05, 0.98],
            opacity: [0.14, 0.24, 0.18],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-1/2 top-[42%] h-[20rem] w-[78rem] max-w-[120vw] -translate-x-1/2 rounded-full blur-[90px] mix-blend-screen"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(149,255,108,0.08)_18%,rgba(190,255,214,0.12)_50%,rgba(149,255,108,0.08)_82%,transparent)",
          }}
          animate={{
            rotate: [-7, -5, -6],
            opacity: [0.12, 0.2, 0.14],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[-10%] left-1/2 h-[30rem] w-[70rem] max-w-[110vw] -translate-x-1/2 rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 36%, rgba(122,255,70,0.14) 0%, rgba(122,255,70,0.08) 26%, rgba(122,255,70,0.03) 46%, transparent 74%)",
          }}
          animate={{
            scaleX: [0.96, 1.04, 1],
            opacity: [0.2, 0.3, 0.24],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[10%] top-[-12%] h-[92vh] w-[18rem] rounded-full blur-[86px] mix-blend-screen"
          style={{
            background:
              "linear-gradient(180deg, rgba(163,255,84,0.02) 0%, rgba(163,255,84,0.14) 28%, rgba(104,255,182,0.12) 52%, rgba(104,255,182,0.02) 76%, transparent 100%)",
          }}
          animate={{
            x: [-10, 12, -6],
            y: [12, -10, 8],
            rotate: [-7, -2, -5],
            opacity: [0.14, 0.22, 0.16],
            scaleY: [0.92, 1.04, 0.98],
          }}
          transition={fieldTransition}
        />

        <motion.div
          className="absolute left-1/2 top-[-10%] h-[88vh] w-[16rem] -translate-x-1/2 rounded-full blur-[84px] mix-blend-screen"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,247,232,0.02) 0%, rgba(206,255,132,0.1) 30%, rgba(163,255,84,0.16) 50%, rgba(78,255,192,0.08) 72%, transparent 100%)",
          }}
          animate={{
            x: [8, -10, 6],
            y: [10, -8, 6],
            rotate: [5, 1, 4],
            opacity: [0.12, 0.22, 0.16],
            scaleY: [0.9, 1.06, 0.96],
          }}
          transition={fieldTransition}
        />

        <motion.div
          className="absolute right-[12%] top-[-8%] h-[84vh] w-[18rem] rounded-full blur-[82px] mix-blend-screen"
          style={{
            background:
              "linear-gradient(180deg, rgba(128,255,218,0.02) 0%, rgba(128,255,218,0.1) 26%, rgba(163,255,84,0.14) 54%, rgba(163,255,84,0.02) 80%, transparent 100%)",
          }}
          animate={{
            x: [10, -12, 6],
            y: [14, -12, 8],
            rotate: [7, 2, 5],
            opacity: [0.1, 0.2, 0.14],
            scaleY: [0.9, 1.04, 0.98],
          }}
          transition={fieldTransition}
        />

        <motion.div
          className="absolute inset-x-[22%] bottom-[20%] h-[10rem] rounded-full blur-[96px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(244,247,232,0.08) 0%, rgba(163,255,84,0.12) 28%, rgba(122,255,70,0.06) 44%, transparent 74%)",
          }}
          animate={{
            x: [-12, 12, -8],
            y: [8, -10, 6],
            scaleX: [0.94, 1.06, 1],
            opacity: [0.12, 0.2, 0.14],
          }}
          transition={fieldTransition}
        />

        <motion.div
          className="absolute inset-0"
          animate={{
            scale: [1, 1.018, 0.994],
            rotate: [0, 0.7, -0.4],
          }}
          transition={fieldTransition}
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="resonance-stroke" x1="88" y1="172" x2="1268" y2="618" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgba(244,247,232,0)" />
                <stop offset="0.24" stopColor="rgba(174,255,96,0.16)" />
                <stop offset="0.54" stopColor="rgba(244,247,232,0.48)" />
                <stop offset="0.78" stopColor="rgba(121,255,182,0.22)" />
                <stop offset="1" stopColor="rgba(244,247,232,0)" />
              </linearGradient>
              <linearGradient id="resonance-stroke-soft" x1="164" y1="240" x2="1220" y2="688" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgba(244,247,232,0)" />
                <stop offset="0.32" stopColor="rgba(163,255,84,0.08)" />
                <stop offset="0.56" stopColor="rgba(244,247,232,0.22)" />
                <stop offset="0.82" stopColor="rgba(121,255,182,0.12)" />
                <stop offset="1" stopColor="rgba(244,247,232,0)" />
              </linearGradient>
            </defs>

            <motion.g
              animate={{
                x: [-10, 12, -6],
                y: [8, -10, 5],
              }}
              transition={fieldTransition}
            >
              <motion.path
                d="M-140 632C124 554 262 298 524 322C818 350 964 678 1580 458"
                stroke="url(#resonance-stroke)"
                strokeWidth="1.4"
                strokeLinecap="round"
                animate={{
                  opacity: [0.18, 0.42, 0.24],
                  pathLength: [0.94, 1, 0.96],
                }}
                transition={contourTransition}
              />
              <motion.path
                d="M-188 706C132 590 326 342 614 382C930 426 1124 736 1608 572"
                stroke="url(#resonance-stroke-soft)"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{
                  opacity: [0.14, 0.3, 0.2],
                  pathLength: [0.92, 1, 0.95],
                }}
                transition={{ ...contourTransition, duration: 17 }}
              />
              <motion.path
                d="M-98 548C156 474 274 214 500 232C804 256 978 548 1566 402"
                stroke="url(#resonance-stroke-soft)"
                strokeWidth="1.1"
                strokeLinecap="round"
                animate={{
                  opacity: [0.08, 0.22, 0.12],
                  pathLength: [0.9, 1, 0.94],
                }}
                transition={{ ...contourTransition, duration: 16 }}
              />
              <motion.path
                d="M-120 594C108 532 224 410 402 420C660 434 792 610 1040 620C1264 628 1392 530 1542 484"
                stroke="url(#resonance-stroke)"
                strokeWidth="1.05"
                strokeLinecap="round"
                animate={{
                  opacity: [0.1, 0.26, 0.16],
                  pathLength: [0.9, 1, 0.94],
                }}
                transition={{ ...contourTransition, duration: 14 }}
              />
            </motion.g>
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(0deg,rgba(0,0,0,0.66),rgba(0,0,0,0.08)_52%,transparent)]"
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(0deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] mix-blend-screen"
          style={{
            background:
              "linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))",
          }}
          animate={{
            opacity: [0.08, 0.14, 0.1],
          }}
          transition={ambientTransition}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <Container className="px-6 sm:px-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="flex flex-col items-center gap-6">
              <img
                src="/Logo.png"
                alt="Fusion"
                className="fusion-logo-lockup h-auto w-[180px] sm:w-[220px]"
              />

              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  Audio trust platform
                </p>

                <h1 className="text-balance text-[3rem] font-medium leading-[0.92] tracking-[-0.05em] text-foreground sm:text-[4.2rem] md:text-[5.2rem]">
                  Launching soon
                </h1>

                <p className="mx-auto max-w-[520px] text-base leading-relaxed text-foreground/78 sm:text-lg">
                  Fusion is almost here.
                </p>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              We&apos;re making the final tweaks behind the scenes.
              For any queries, contact{" "}
              <a
                href="mailto:hello@paperfrogs.dev"
                className="text-foreground transition-colors hover:text-primary"
              >
                hello@paperfrogs.dev
              </a>
              .
            </p>

            <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Built by Paperfrogs
            </p>
          </motion.section>
        </Container>
      </main>
    </div>
  );
};

export default Maintenance;
