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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#040705_0%,#030504_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(234,234,234,0.035),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_22%,transparent_78%,rgba(0,0,0,0.28))]" />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[520px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, rgba(182,255,0,0.26) 0%, rgba(182,255,0,0.12) 34%, rgba(234,234,234,0.08) 60%, transparent 78%)",
          }}
          animate={{
            x: [-12, 10, -6],
            y: [-10, 12, -8],
            scale: [0.98, 1.04, 1],
            opacity: [0.42, 0.7, 0.5],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[46%] top-[38%] h-[280px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[120px]"
          animate={{
            x: [10, -8, 6],
            y: [-8, 10, -5],
            scale: [0.96, 1.05, 0.98],
            opacity: [0.18, 0.34, 0.22],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[58%] top-[62%] h-[220px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[110px]"
          animate={{
            x: [-8, 10, -6],
            y: [8, -10, 6],
            scale: [1, 0.95, 1.02],
            opacity: [0.12, 0.24, 0.15],
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
