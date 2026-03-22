import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const ambientTransition = {
  duration: 22,
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#12031d_0%,#100218_48%,#09010f_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_42%_at_50%_-6%,rgba(255,122,143,0.95)_0%,rgba(255,176,173,0.84)_18%,rgba(246,236,223,0.82)_29%,rgba(210,173,255,0.68)_43%,rgba(133,48,255,0.42)_56%,rgba(34,5,52,0)_74%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%,transparent_76%,rgba(0,0,0,0.2))]" />

        <motion.div
          className="absolute left-1/2 top-[6%] h-[340px] w-[1100px] -translate-x-1/2 rounded-full blur-[95px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,124,141,0.92) 0%, rgba(255,171,164,0.78) 22%, rgba(247,238,225,0.62) 42%, rgba(194,143,255,0.34) 60%, transparent 76%)",
          }}
          animate={{
            x: [-18, 14, -10],
            y: [-10, 12, -6],
            scaleX: [0.98, 1.03, 1],
            scaleY: [1, 1.06, 0.98],
            opacity: [0.66, 0.92, 0.74],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-1/2 top-[20%] h-[240px] w-[960px] -translate-x-1/2 rounded-full blur-[85px]"
          style={{
            background:
              "radial-gradient(circle, rgba(248,240,229,0.72) 0%, rgba(236,218,248,0.46) 38%, rgba(180,110,255,0.22) 58%, transparent 78%)",
          }}
          animate={{
            x: [14, -12, 8],
            y: [6, -8, 4],
            scaleX: [1, 0.96, 1.02],
            scaleY: [0.98, 1.04, 1],
            opacity: [0.34, 0.54, 0.4],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-1/2 top-[28%] h-[320px] w-[1280px] -translate-x-1/2 rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(173,88,255,0.58) 0%, rgba(129,40,255,0.44) 34%, rgba(72,16,120,0.22) 56%, transparent 76%)",
          }}
          animate={{
            x: [-12, 16, -8],
            y: [10, -12, 6],
            scaleX: [1.02, 0.98, 1],
            scaleY: [1, 1.06, 0.98],
            opacity: [0.34, 0.56, 0.42],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-0 top-0 h-[46%] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_72%)] mix-blend-screen"
          animate={{
            opacity: [0.24, 0.34, 0.26],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute inset-x-[-10%] bottom-[-8%] h-[55%] bg-[radial-gradient(ellipse_at_top,rgba(84,20,130,0.32),transparent_62%)] blur-[70px]"
          animate={{
            x: [-8, 12, -6],
            y: [8, -6, 4],
            opacity: [0.5, 0.72, 0.56],
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
