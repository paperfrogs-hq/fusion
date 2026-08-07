import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Container } from "@/components/ui/container";

const HIGHLIGHTS = [
  {
    label: "When",
    value: "Since 2024",
    detail: "Founded as a small product studio.",
  },
  {
    label: "What",
    value: "Trust infrastructure",
    detail: "Provenance, watermarking, audit, the quiet plumbing.",
  },
  {
    label: "How",
    value: "Quietly",
    detail: "Small team. Long horizon. We pick up unglamorous work.",
  },
];

const NOTES = [
  {
    n: "01",
    title: "We pick up the unglamorous work.",
    body: "Most of the AI audio world is racing toward bigger models. We are working on the parts that decide whether a piece of audio can be trusted at all.",
  },
  {
    n: "02",
    title: "We sign everything we ship.",
    body: "Every artifact has a verifiable history. Every action we take is auditable. Every key we hand out is reversible when it has to be.",
  },
  {
    n: "03",
    title: "We answer our own email.",
    body: "If you write to us, we read it. If you call us, we pick up. If we cannot do something, we will tell you before we pretend.",
  },
];

const PaperfrogsHQ = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      <main className="relative z-10 pb-24 pt-36 sm:pt-44 lg:pt-52">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mx-auto max-w-measure-70"
          >
            <Link
              to="/"
              className="group inline-flex items-baseline gap-1.5 font-serif text-sm italic text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5 self-center" aria-hidden="true" />
              <span className="link-underline">Back to Fusion</span>
            </Link>

            <p className="mt-10 font-serif text-sm italic text-muted-foreground">
              01 <span className="mx-3 inline-block h-px w-6 align-middle bg-rule" /> Paperfrogs HQ
            </p>

            <h1 className="mt-6 font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.025em] text-foreground">
              The studio{" "}
              <span className="font-serif italic text-foreground/95">behind Fusion.</span>
            </h1>

            <p className="mt-6 text-prose text-muted-foreground">
              Paperfrogs is a small product studio. We work on the parts of AI infrastructure
              that nobody else wants to pick up: provenance, watermarking, audit, and the quiet
              plumbing that decides whether a piece of media can be trusted.
            </p>

            <div className="mt-12 hairline" />
          </motion.div>

          <section className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="bg-card/40 px-5 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  {item.label}
                </p>
                <p className="mt-3 font-serif text-xl italic text-foreground">{item.value}</p>
                <p className="mt-2 font-serif text-sm italic text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </section>

          <div className="mt-20 hairline" />

          <section className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <p className="font-serif text-sm italic text-muted-foreground">
                02 <span className="mx-3 inline-block h-px w-6 align-middle bg-rule" /> Notes
              </p>
              <h2 className="mt-6 max-w-[14ch] font-serif text-[clamp(1.875rem,3.4vw,2.5rem)] font-light leading-[1.04] tracking-[-0.025em] text-foreground">
                A few things we{" "}
                <span className="font-serif italic text-foreground/95">care about.</span>
              </h2>
            </motion.div>

            <motion.ol
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
              className="space-y-10"
            >
              {NOTES.map((note) => (
                <li key={note.n} className="grid grid-cols-[3rem_1fr] gap-4">
                  <span className="font-mono text-[11px] tabular-nums tracking-[0.22em] text-muted-foreground/70">
                    {note.n}
                  </span>
                  <div>
                    <p className="font-serif text-xl italic leading-snug text-foreground">
                      {note.title}
                    </p>
                    <p className="mt-2 text-prose text-muted-foreground">{note.body}</p>
                  </div>
                </li>
              ))}
            </motion.ol>
          </section>

          <div className="mt-24 hairline" />

          <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <p className="font-serif text-sm italic text-muted-foreground">
                03 <span className="mx-3 inline-block h-px w-6 align-middle bg-rule" /> Reach
              </p>
              <h2 className="mt-6 max-w-[14ch] font-serif text-[clamp(1.875rem,3.4vw,2.5rem)] font-light leading-[1.04] tracking-[-0.025em] text-foreground">
                Say hi{" "}
                <span className="font-serif italic text-foreground/95">if you want to.</span>
              </h2>
              <p className="mt-5 text-prose text-muted-foreground">
                We read every email. We reply when we have something useful to say.
              </p>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
              className="space-y-6"
            >
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  Email
                </p>
                <a
                  href="mailto:hello@paperfrogs.dev"
                  className="mt-2 inline-flex items-baseline gap-2 font-serif text-xl italic text-foreground"
                >
                  <span className="link-underline">hello@paperfrogs.dev</span>
                </a>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  Site
                </p>
                <a
                  href="https://paperfrogs.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-2 inline-flex items-baseline gap-2 font-serif text-xl italic text-foreground"
                >
                  <span className="link-underline">paperfrogs.dev</span>
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  Want to use Fusion?
                </p>
                <Link
                  to="/waitlist"
                  className="group mt-2 inline-flex items-baseline gap-2 font-serif text-xl italic text-foreground"
                >
                  <span className="link-underline">Join the waitlist</span>
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            </motion.ul>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default PaperfrogsHQ;