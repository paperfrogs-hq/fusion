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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_20%,transparent_74%,rgba(0,0,0,0.26))]" />

        <motion.div
          className="absolute bottom-[-18%] left-[-12%] h-[520px] w-[520px] rounded-full blur-[95px]"
          style={{
            background:
              "radial-gradient(circle, rgba(244,244,236,0.88) 0%, rgba(228,242,198,0.8) 18%, rgba(200,255,47,0.62) 34%, rgba(182,255,0,0.32) 52%, transparent 76%)",
            maskImage: "radial-gradient(circle at 62% 38%, black 0%, black 54%, transparent 80%)",
          }}
          animate={{
            x: [-14, 12, -8],
            y: [12, -14, 8],
            scale: [0.98, 1.05, 1],
            opacity: [0.52, 0.82, 0.64],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[-18%] right-[-12%] h-[520px] w-[520px] rounded-full blur-[95px]"
          style={{
            background:
              "radial-gradient(circle, rgba(244,244,236,0.86) 0%, rgba(228,242,198,0.78) 18%, rgba(200,255,47,0.58) 34%, rgba(182,255,0,0.3) 52%, transparent 76%)",
            maskImage: "radial-gradient(circle at 38% 38%, black 0%, black 54%, transparent 80%)",
          }}
          animate={{
            x: [14, -12, 8],
            y: [10, -12, 8],
            scale: [1, 1.05, 0.98],
            opacity: [0.5, 0.8, 0.62],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[-6%] left-[8%] h-[360px] w-[360px] rounded-full blur-[105px]"
          style={{
            background:
              "radial-gradient(circle, rgba(214,255,110,0.32) 0%, rgba(182,255,0,0.24) 34%, rgba(38,58,18,0.12) 56%, transparent 76%)",
          }}
          animate={{
            x: [-10, 10, -6],
            y: [10, -12, 6],
            scale: [1, 1.04, 0.98],
            opacity: [0.18, 0.3, 0.22],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[-6%] right-[8%] h-[360px] w-[360px] rounded-full blur-[105px]"
          style={{
            background:
              "radial-gradient(circle, rgba(214,255,110,0.3) 0%, rgba(182,255,0,0.22) 34%, rgba(38,58,18,0.12) 56%, transparent 76%)",
          }}
          animate={{
            x: [10, -10, 6],
            y: [10, -12, 6],
            scale: [1, 1.04, 0.98],
            opacity: [0.16, 0.28, 0.2],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(0deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_74%)] mix-blend-screen"
          animate={{
            opacity: [0.18, 0.3, 0.22],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-[-10%] bottom-[-20%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(34,58,18,0.32),transparent_64%)] blur-[70px]"
          animate={{
            x: [-8, 10, -6],
            y: [6, -6, 4],
            opacity: [0.38, 0.54, 0.42],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute bottom-[16%] left-1/2 h-[100px] w-[680px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(244,244,235,0.12),rgba(200,255,47,0.12),transparent)] blur-[65px] mix-blend-screen"
          animate={{
            x: [-10, 10, -8],
            y: [6, -8, 4],
            opacity: [0.1, 0.2, 0.14],
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
