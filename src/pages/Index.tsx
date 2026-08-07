import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Container } from "@/components/ui/container";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      <main className="relative z-10">
        <section className="relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:min-h-[88vh] lg:pb-32 lg:pt-36">
          <div className="pointer-events-none absolute inset-0 bg-radial-gradient opacity-60" />
          <div className="pointer-events-none absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[140px]" />
          <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />

          <Container wide>
            <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex items-baseline gap-3 font-serif text-sm italic text-muted-foreground"
                >
                  <span className="text-foreground/85">Fusion</span>
                  <span aria-hidden="true" className="block h-px w-10 bg-rule" />
                  <span className="font-mono text-[11px] not-italic uppercase tracking-[0.22em] text-muted-foreground/70">
                    00 · 2026
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
                  className="mt-10 max-w-[16ch] font-serif text-[clamp(3rem,7.5vw,6.25rem)] font-light leading-[0.98] tracking-[-0.03em] text-foreground"
                >
                  A trust layer,{" "}
                  <span className="font-serif italic text-foreground/90">written</span>
                  <br />
                  <span className="font-serif italic text-foreground/90">into</span> the audio.
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
                  className="mt-12 max-w-measure-64"
                >
                  <p className="text-prose text-foreground/85">
                    Fusion signs audio so anyone can verify where it came from. The engine is
                    called APC. Both are in private testing.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.32 }}
                  className="mt-14 flex items-end gap-6"
                >
                  <Link
                    to="/waitlist"
                    className="group inline-flex items-baseline gap-2 font-serif text-lg italic text-foreground"
                  >
                    <span className="link-underline">Join the waitlist</span>
                    <span
                      aria-hidden="true"
                      className="inline-block translate-y-px transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-px"
                    >
                      →
                    </span>
                  </Link>
                  <span className="hidden font-serif text-xs italic text-muted-foreground/70 sm:inline">
                    one email when it's ready
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
                className="hidden lg:block"
                aria-hidden="true"
              >
                <div className="relative flex flex-col items-end text-right">
                  <span className="font-serif text-[10rem] font-light italic leading-none text-foreground/85">
                    01
                  </span>
                  <div className="mt-4 flex items-center gap-3 font-serif text-xs italic text-muted-foreground/70">
                    <span className="block h-px w-10 bg-rule" />
                    <span>first proof of concept</span>
                  </div>
                  <p className="mt-6 max-w-[24ch] font-serif text-[11px] italic leading-relaxed text-muted-foreground/70">
                    We will let you know the moment there is something worth trying.
                  </p>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        <div className="hairline mx-auto max-w-[1240px]" />

        <section className="relative py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_14rem] md:items-start">
              <div className="max-w-measure-64">
                <p className="font-serif text-xs italic uppercase tracking-[0.22em] text-muted-foreground/80">
                  Status
                </p>
                <p className="mt-3 font-serif text-xl italic leading-snug text-foreground">
                  We are not shipping yet.
                </p>
                <p className="mt-3 text-prose text-muted-foreground">
                  We are a small team, working in private. No demo calls, no SDR funnel. One
                  quiet email when the engine is ready.
                </p>
              </div>
              <div className="md:text-right">
                <Link
                  to="/apc"
                  className="group inline-flex items-baseline gap-2 font-serif text-sm italic text-foreground"
                >
                  <span className="link-underline">Read about APC</span>
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <div className="hairline mx-auto max-w-[1240px]" />

        <section className="relative py-16 sm:py-24 lg:py-32">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="flex flex-col"
              >
                <p className="font-serif text-sm italic text-muted-foreground">
                  04 <span className="mx-3 inline-block h-px w-6 align-middle bg-rule" />
                  About
                </p>
                <h2 className="mt-6 max-w-[14ch] font-serif text-[clamp(2rem,4.4vw,3.25rem)] font-light leading-[1.04] tracking-[-0.025em] text-foreground">
                  A small studio{" "}
                  <span className="font-serif italic text-foreground/90">building trust</span>{" "}
                  for the AI era.
                </h2>
                <div className="mt-10 flex items-center gap-4">
                  <span className="font-serif text-base italic text-foreground">Paperfrogs</span>
                  <span aria-hidden="true" className="block h-px w-10 bg-rule" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Lab · est. 2024
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
                className="max-w-measure-64"
              >
                <p className="text-prose text-foreground/90">
                  Paperfrogs is a small product studio. We work on the parts of AI infrastructure
                  that nobody else wants to pick up: provenance, watermarking, audit, and the
                  quiet plumbing that decides whether a piece of media can be trusted.
                </p>
                <p className="mt-5 text-prose text-muted-foreground">
                  Fusion is the first product to come out of that work. APC is the engine inside
                  it. Everything we ship is signed, auditable, and reversible when it has to be.
                </p>
                <p className="mt-5 text-prose text-muted-foreground">
                  We answer our own email.
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/paperfrogs-hq"
                    className="group inline-flex items-baseline gap-2 font-serif text-base italic text-foreground"
                  >
                    <span className="link-underline">Visit Paperfrogs HQ</span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                  <a
                    href="https://paperfrogs.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-2 font-serif text-sm italic text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="link-underline">paperfrogs.dev</span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;