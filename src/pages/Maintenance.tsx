import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const ambientTransition = {
  duration: 20,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const horizonTransition = {
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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07110d_0%,#030705_42%,#010201_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(163,255,84,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_24%,transparent_70%,rgba(0,0,0,0.36))]" />
        <div className="absolute inset-x-0 top-0 h-[48%] bg-[linear-gradient(180deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.22)_68%,transparent)]" />

        <motion.div
          className="absolute bottom-[-122vmax] left-1/2 h-[178vmax] w-[178vmax] -translate-x-1/2 rounded-full blur-[22px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 63.2%, rgba(244,247,232,0.96) 63.75%, rgba(212,255,133,0.92) 64.1%, rgba(179,255,64,0.88) 64.45%, rgba(137,255,26,0.78) 64.85%, rgba(137,255,26,0.12) 66.7%, transparent 69.8%)",
          }}
          animate={{
            y: [12, -8, 6],
            scaleX: [1, 1.015, 0.995],
            opacity: [0.9, 1, 0.94],
          }}
          transition={horizonTransition}
        />

        <motion.div
          className="absolute bottom-[-122vmax] left-1/2 h-[178vmax] w-[178vmax] -translate-x-1/2 rounded-full blur-[86px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 61.6%, rgba(223,255,148,0.3) 63.3%, rgba(173,255,56,0.44) 64.5%, rgba(90,255,0,0.22) 67.4%, transparent 72.6%)",
          }}
          animate={{
            y: [10, -12, 6],
            scaleX: [0.99, 1.02, 1],
            opacity: [0.34, 0.5, 0.4],
          }}
          transition={horizonTransition}
        />

        <motion.div
          className="absolute bottom-[-16%] left-1/2 h-[42vh] w-[88vw] max-w-[1400px] -translate-x-1/2 rounded-full blur-[96px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(214,255,142,0.22) 0%, rgba(164,255,56,0.16) 26%, rgba(92,255,0,0.08) 46%, transparent 74%)",
          }}
          animate={{
            y: [8, -10, 5],
            scaleX: [0.98, 1.03, 1],
            opacity: [0.26, 0.4, 0.32],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-[20%] bottom-[26%] h-[12rem] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(163,255,84,0.12) 0%, rgba(163,255,84,0.04) 44%, transparent 76%)",
          }}
          animate={{
            opacity: [0.12, 0.2, 0.14],
          }}
          transition={ambientTransition}
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
