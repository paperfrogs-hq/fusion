import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const ambientTransition = {
  duration: 22,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
};

const sweepTransition = {
  duration: 14,
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#040705_0%,#030504_52%,#020403_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_42%_at_50%_112%,rgba(245,244,236,0.94)_0%,rgba(228,242,198,0.82)_14%,rgba(200,255,47,0.72)_28%,rgba(182,255,0,0.58)_40%,rgba(92,124,24,0.28)_54%,rgba(12,20,12,0)_74%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_24%,transparent_76%,rgba(0,0,0,0.24))]" />

        <motion.div
          className="absolute bottom-[-8%] left-1/2 h-[340px] w-[1100px] -translate-x-1/2 rounded-full blur-[95px]"
          style={{
            background:
              "radial-gradient(circle, rgba(242,242,232,0.86) 0%, rgba(224,240,192,0.76) 18%, rgba(200,255,47,0.64) 34%, rgba(182,255,0,0.44) 48%, transparent 76%)",
          }}
          animate={{
            x: [-22, 18, -12],
            y: [12, -14, 8],
            scaleX: [0.98, 1.04, 1],
            scaleY: [1, 1.08, 0.98],
            opacity: [0.6, 0.9, 0.72],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[10%] left-1/2 h-[240px] w-[960px] -translate-x-1/2 rounded-full blur-[85px]"
          style={{
            background:
              "radial-gradient(circle, rgba(238,238,228,0.64) 0%, rgba(226,244,196,0.42) 34%, rgba(182,255,0,0.18) 56%, transparent 78%)",
          }}
          animate={{
            x: [18, -16, 10],
            y: [10, -12, 8],
            scaleX: [1, 0.95, 1.03],
            scaleY: [0.98, 1.05, 1],
            opacity: [0.3, 0.5, 0.36],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[2%] left-1/2 h-[320px] w-[1280px] -translate-x-1/2 rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(168,224,56,0.42) 0%, rgba(130,182,28,0.32) 32%, rgba(48,76,18,0.22) 52%, transparent 76%)",
          }}
          animate={{
            x: [-16, 20, -10],
            y: [14, -16, 10],
            scaleX: [1.02, 0.98, 1],
            scaleY: [1, 1.06, 0.98],
            opacity: [0.28, 0.5, 0.34],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(0deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_72%)] mix-blend-screen"
          animate={{
            opacity: [0.24, 0.34, 0.26],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-[-10%] bottom-[-18%] h-[55%] bg-[radial-gradient(ellipse_at_top,rgba(34,58,18,0.38),transparent_62%)] blur-[70px]"
          animate={{
            x: [-10, 14, -8],
            y: [8, -6, 4],
            opacity: [0.46, 0.68, 0.52],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[18%] left-1/2 h-[120px] w-[1200px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(244,244,235,0.18),rgba(200,255,47,0.18),transparent)] blur-[70px] mix-blend-screen"
          animate={{
            x: [-24, 24, -16],
            y: [6, -8, 4],
            opacity: [0.18, 0.34, 0.22],
            scaleX: [0.98, 1.04, 1],
          }}
          transition={sweepTransition}
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
