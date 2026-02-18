import { AnimatePresence, motion } from "framer-motion";
import { Bot, Building2, ChevronDown, ChevronUp, Mic2, Shield } from "lucide-react";
import { useState } from "react";
import SectionBadge from "./SectionBadge";
import { Section } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";

const solutions = [
  {
    icon: Building2,
    title: "For Platforms",
    subtitle: "Spotify, TikTok, YouTube, Discord",
    description:
      "Scale moderation, reduce deepfake exposure, and enforce provenance policy with auditable verification outputs.",
    highlight: "Reduce deepfakes by 90%",
    details: [
      "Real-time trust scoring in moderation pipelines",
      "Policy controls for provenance-based enforcement",
      "Evidence trails for incidents and compliance",
    ],
  },
  {
    icon: Mic2,
    title: "For Creators",
    subtitle: "Musicians, Podcasters, Voice Actors",
    description:
      "Prove authorship, protect your voice identity, and preserve trusted distribution metadata across channels.",
    highlight: "Own your authenticity",
    details: [
      "Persistent ownership proof attached to each file",
      "Source-verifiable distribution metadata",
      "Protection against impersonation and cloning",
    ],
  },
  {
    icon: Bot,
    title: "For AI Companies",
    subtitle: "ElevenLabs, Suno, OpenAI",
    description:
      "Embed provenance directly into generated outputs and provide verifiable trust guarantees to downstream platforms.",
    highlight: "Build responsibly",
    details: [
      "Generated audio carries cryptographic provenance",
      "Verification APIs for partner platforms",
      "Confidence and lineage outputs for governance teams",
    ],
  },
  {
    icon: Shield,
    title: "For Compliance",
    subtitle: "Trust & Safety, Legal, Regulators",
    description:
      "Automated verification and evidence-ready logs for governance teams operating across global content systems.",
    highlight: "Scalable and auditable",
    details: [
      "Case-ready exports for legal and policy reviews",
      "Operational transparency for trust & safety teams",
      "Long-lived provenance records for audit cycles",
    ],
  },
];

const SolutionsSection = () => {
  const [expandedSolution, setExpandedSolution] = useState<string | null>(solutions[0].title);

  return (
    <Section id="solutions">
      <div className="pointer-events-none absolute inset-0 bg-radial-bottom" />

      <motion.div
        className="mx-auto mb-14 max-w-3xl text-center"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <SectionBadge>Solutions</SectionBadge>
        <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Infrastructure for Every Audio Stakeholder
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A single verification engine adaptable across creator tools, enterprise systems, and platform-scale operations.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        {solutions.map((solution, index) => (
          <Reveal key={solution.title} delay={index * 0.06} y={20}>
            <Panel className="group p-0">
              <button
                type="button"
                onClick={() =>
                  setExpandedSolution((current) => (current === solution.title ? null : solution.title))
                }
                className="w-full p-7 text-left sm:p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary">
                    <solution.icon className="h-5 w-5 text-primary" />
                  </div>
                  {expandedSolution === solution.title ? (
                    <ChevronUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  )}
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-foreground">{solution.title}</h3>
                <p className="mt-2 text-sm uppercase tracking-[0.14em] text-muted-foreground">{solution.subtitle}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{solution.description}</p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {solution.highlight}
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expandedSolution === solution.title && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mx-7 mb-7 mt-1 rounded-xl border border-border bg-secondary/65 p-4 sm:mx-8 sm:mb-8">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">View Section</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {solution.details.map((detail) => (
                          <li key={detail}>• {detail}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default SolutionsSection;
