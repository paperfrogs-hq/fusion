import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const ambientTransition = {
  duration: 18,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const horizonTransition = {
  duration: 16,
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07110d_0%,#020504_42%,#010201_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(163,255,84,0.1),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_24%,transparent_70%,rgba(0,0,0,0.36))]" />
        <div className="absolute inset-x-0 top-0 h-[54%] bg-[linear-gradient(180deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.24)_62%,transparent)]" />

        <motion.div
          className="absolute bottom-[-122vmax] left-1/2 h-[178vmax] w-[178vmax] -translate-x-1/2 rounded-full blur-[18px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 63.3%, rgba(244,247,232,0.96) 63.85%, rgba(223,255,156,0.92) 64.18%, rgba(178,255,70,0.88) 64.55%, rgba(138,255,26,0.78) 64.95%, rgba(138,255,26,0.1) 66.9%, transparent 70.2%)",
          }}
          animate={{
            y: [10, -8, 6],
            scaleX: [1, 1.014, 0.996],
            opacity: [0.9, 1, 0.94],
          }}
          transition={horizonTransition}
        />

        <motion.div
          className="absolute bottom-[-122vmax] left-1/2 h-[178vmax] w-[178vmax] -translate-x-1/2 rounded-full blur-[82px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 61.8%, rgba(212,255,126,0.22) 63.4%, rgba(166,255,64,0.34) 64.7%, rgba(91,255,0,0.18) 67.6%, transparent 73%)",
          }}
          animate={{
            y: [8, -10, 5],
            scaleX: [0.992, 1.02, 1],
            opacity: [0.28, 0.42, 0.34],
          }}
          transition={horizonTransition}
        />

        <motion.div
          className="absolute bottom-[-14%] left-1/2 h-[38vh] w-[92vw] max-w-[1480px] -translate-x-1/2 rounded-full blur-[104px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(221,255,170,0.18) 0%, rgba(163,255,84,0.14) 26%, rgba(92,255,0,0.08) 46%, transparent 74%)",
          }}
          animate={{
            y: [6, -8, 5],
            scaleX: [0.98, 1.03, 1],
            opacity: [0.22, 0.34, 0.28],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-[18%] bottom-[20%] h-[7rem] rounded-full blur-[48px] mix-blend-screen"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(244,247,232,0.06) 24%, rgba(163,255,84,0.18) 50%, rgba(121,255,182,0.08) 76%, transparent)",
          }}
          animate={{
            x: [-20, 22, -10],
            opacity: [0.08, 0.18, 0.1],
            scaleX: [0.94, 1.04, 0.98],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[36%] bg-[linear-gradient(0deg,rgba(0,0,0,0.68),rgba(0,0,0,0.12)_54%,transparent)]"
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(0deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] mix-blend-screen"
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
