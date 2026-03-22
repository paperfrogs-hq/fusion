import { useEffect } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

const dotPattern = {
  backgroundImage: "radial-gradient(currentColor 1.2px, transparent 1.2px)",
  backgroundSize: "13px 13px",
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute left-[10%] top-[18%] h-[260px] w-[420px] -rotate-12 text-foreground/15 blur-[0.2px]" style={dotPattern} />
        <div className="absolute right-[8%] top-[42%] h-[260px] w-[420px] rotate-12 text-foreground/15 blur-[0.2px]" style={dotPattern} />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center py-10">
        <Container className="max-w-4xl">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="surface-panel mx-auto max-w-3xl border-white/10 bg-card/55 px-6 py-12 text-center backdrop-blur-2xl sm:px-10 sm:py-16"
          >
            <img
              src="/Logo.png"
              alt="Fusion"
              className="fusion-logo-lockup mx-auto h-auto w-[160px] sm:w-[190px]"
            />

            <Badge className="mx-auto mt-6 w-fit">Site Maintenance</Badge>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl md:text-6xl">
              Fusion is getting ready to
              <span className="gradient-text block">launch soon</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We are making final updates behind the scenes.
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
