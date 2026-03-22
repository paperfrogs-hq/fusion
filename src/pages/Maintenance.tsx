import { useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/ui/container";

const ambientTransition = {
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#040705_0%,#050806_48%,#030504_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_46%,rgba(234,234,234,0.08),transparent_24%),radial-gradient(circle_at_24%_62%,rgba(182,255,0,0.18),transparent_30%),radial-gradient(circle_at_72%_22%,rgba(200,255,47,0.06),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,4,0.2),transparent_24%,transparent_72%,rgba(3,5,4,0.45))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_24%,transparent_72%,rgba(0,0,0,0.22))]" />

        <motion.div
          className="absolute left-[18%] top-[54%] h-[620px] w-[430px] -translate-y-1/2 rounded-full blur-[125px]"
          style={{
            background:
              "radial-gradient(circle, rgba(182,255,0,0.34) 0%, rgba(182,255,0,0.16) 30%, rgba(234,234,234,0.08) 56%, transparent 76%)",
          }}
          animate={{
            x: [-14, 12, -8],
            y: [-10, 14, -6],
            scale: [0.98, 1.05, 0.99],
            opacity: [0.48, 0.86, 0.58],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[31%] top-[40%] h-[420px] w-[280px] -translate-y-1/2 rounded-full bg-white/14 blur-[135px]"
          animate={{
            x: [10, -10, 6],
            y: [-8, 10, -5],
            scale: [0.96, 1.06, 0.99],
            opacity: [0.22, 0.42, 0.28],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[23%] top-[70%] h-[300px] w-[230px] -translate-y-1/2 rounded-full bg-accent/12 blur-[120px]"
          animate={{
            x: [-8, 12, -6],
            y: [8, -10, 6],
            scale: [1, 0.94, 1.03],
            opacity: [0.16, 0.32, 0.2],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[40%] top-[52%] h-[540px] w-[540px] -translate-y-1/2 rounded-full bg-primary/6 blur-[180px]"
          animate={{
            x: [-8, 10, -5],
            y: [-6, 8, -4],
            scale: [0.98, 1.04, 1],
            opacity: [0.14, 0.24, 0.16],
          }}
          transition={ambientTransition}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center">
        <Container wide className="px-6 sm:px-10 md:px-14">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-5xl"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
              <img
                src="/Logo.png"
                alt="Fusion"
                className="fusion-logo-lockup h-auto w-[240px] sm:w-[320px] md:w-[390px] lg:w-[460px]"
              />
              <div className="max-w-[240px] pb-2 text-sm leading-snug text-foreground/78 sm:text-base">
                <p>Launching soon</p>
                <p>Audio trust platform</p>
              </div>
            </div>

            <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              We&apos;re making the final tweaks behind the scenes.
              <br />
              For any queries, contact{" "}
              <a
                href="mailto:hello@paperfrogs.dev"
                className="text-foreground transition-colors hover:text-primary"
              >
                hello@paperfrogs.dev
              </a>
              .
            </p>

            <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Built by Paperfrogs
            </p>
          </motion.section>
        </Container>
      </main>
    </div>
  );
};

export default Maintenance;
