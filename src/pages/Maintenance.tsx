import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const starField = [
  { left: "8%", top: "16%", size: 2, opacity: 0.48, duration: 3.4, delay: 0.2 },
  { left: "16%", top: "26%", size: 3, opacity: 0.3, duration: 4.2, delay: 1.1 },
  { left: "24%", top: "12%", size: 2, opacity: 0.42, duration: 3.8, delay: 0.7 },
  { left: "32%", top: "30%", size: 2, opacity: 0.36, duration: 4.6, delay: 1.8 },
  { left: "42%", top: "18%", size: 3, opacity: 0.3, duration: 4, delay: 0.3 },
  { left: "52%", top: "10%", size: 2, opacity: 0.44, duration: 3.6, delay: 1.4 },
  { left: "58%", top: "22%", size: 2, opacity: 0.34, duration: 4.4, delay: 0.9 },
  { left: "66%", top: "14%", size: 3, opacity: 0.28, duration: 4.8, delay: 2.1 },
  { left: "74%", top: "28%", size: 2, opacity: 0.4, duration: 3.9, delay: 1.2 },
  { left: "82%", top: "18%", size: 2, opacity: 0.34, duration: 4.3, delay: 0.6 },
  { left: "88%", top: "12%", size: 3, opacity: 0.26, duration: 4.7, delay: 1.7 },
  { left: "92%", top: "30%", size: 2, opacity: 0.38, duration: 3.7, delay: 0.4 },
];

const ambientTransition = {
  duration: 20,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const cometTransition = {
  duration: 8.5,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatDelay: 2.4,
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

        {starField.map((star) => (
          <motion.span
            key={`${star.left}-${star.top}`}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow: "0 0 10px rgba(208,255,153,0.6)",
            }}
            animate={{
              opacity: [star.opacity * 0.45, star.opacity, star.opacity * 0.55],
              scale: [0.9, 1.15, 0.95],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        ))}

        <motion.div
          className="absolute right-[2%] top-[-8%] h-[2px] w-[18rem] origin-center rounded-full mix-blend-screen sm:w-[24rem]"
          style={{
            background:
              "linear-gradient(90deg, rgba(236,247,230,0) 0%, rgba(236,247,230,0.4) 18%, rgba(228,255,176,0.92) 56%, rgba(255,255,255,1) 100%)",
            boxShadow:
              "0 0 14px rgba(230,255,182,0.5), 0 0 34px rgba(147,255,71,0.32)",
            transformOrigin: "center",
          }}
          animate={{
            x: ["0vw", "-8vw", "-16vw", "-22vw", "-28vw"],
            y: ["0vh", "10vh", "26vh", "48vh", "74vh"],
            rotate: [-58, -48, -34, -14, 8],
            opacity: [0, 0.26, 0.95, 0.54, 0.12],
            scaleX: [0.6, 0.88, 1.12, 1, 0.76],
          }}
          transition={cometTransition}
        />

        <motion.div
          className="absolute right-[2%] top-[-8%] h-[0.55rem] w-[0.55rem] rounded-full bg-[#f4f7e8] mix-blend-screen"
          style={{
            boxShadow:
              "0 0 16px rgba(244,247,232,0.95), 0 0 36px rgba(163,255,84,0.8), 0 0 60px rgba(163,255,84,0.4)",
          }}
          animate={{
            x: ["0vw", "-8vw", "-16vw", "-22vw", "-28vw"],
            y: ["0vh", "10vh", "26vh", "48vh", "74vh"],
            opacity: [0, 0.34, 1, 0.44, 0.08],
            scale: [0.45, 0.88, 1.52, 1.08, 0.72],
          }}
          transition={cometTransition}
        />

        <motion.div
          className="absolute bottom-[8%] right-[17%] h-[8rem] w-[8rem] rounded-full mix-blend-screen blur-[36px]"
          style={{
            background:
              "radial-gradient(circle, rgba(244,247,232,0.42) 0%, rgba(180,255,82,0.24) 28%, rgba(122,255,70,0.08) 52%, transparent 76%)",
          }}
          animate={{
            opacity: [0, 0, 0.08, 0.42, 0.14, 0],
            scale: [0.32, 0.4, 0.54, 1.3, 1.06, 0.72],
          }}
          transition={cometTransition}
        />

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
