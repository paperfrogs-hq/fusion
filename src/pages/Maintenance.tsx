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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#050806_0%,#050806_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(234,234,234,0.04),transparent_30%)]" />

        <motion.div
          className="absolute left-[18%] top-[52%] h-[520px] w-[360px] -translate-y-1/2 rounded-full bg-primary/18 blur-[120px]"
          animate={{
            x: [-18, 16, -10],
            y: [-12, 18, -8],
            scale: [0.96, 1.06, 0.98],
            opacity: [0.45, 0.82, 0.54],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[30%] top-[42%] h-[360px] w-[260px] -translate-y-1/2 rounded-full bg-white/14 blur-[120px]"
          animate={{
            x: [14, -12, 8],
            y: [-10, 12, -6],
            scale: [0.94, 1.08, 0.97],
            opacity: [0.26, 0.46, 0.3],
          }}
          transition={ambientTransition}
        />

        <motion.div
          className="absolute left-[24%] top-[68%] h-[260px] w-[220px] -translate-y-1/2 rounded-full bg-accent/12 blur-[110px]"
          animate={{
            x: [-10, 14, -8],
            y: [10, -12, 8],
            scale: [1, 0.92, 1.04],
            opacity: [0.18, 0.34, 0.22],
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
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-5">
              <h1 className="text-[4.2rem] font-medium leading-[0.9] tracking-[-0.06em] text-foreground sm:text-[5.8rem] md:text-[7.8rem] lg:text-[9rem]">
                Fusion
              </h1>
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
          </motion.section>
        </Container>
      </main>
    </div>
  );
};

export default Maintenance;
