import { motion } from "framer-motion";
import { CheckCircle, FileKey, Search } from "lucide-react";
import SectionBadge from "./SectionBadge";
import { Section } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    number: "01",
    icon: FileKey,
    title: "Embed",
    description:
      "Cryptographic proof is embedded at creation time: origin, timestamp, and creator identity sealed into the audio payload.",
  },
  {
    number: "02",
    icon: Search,
    title: "Verify",
    description:
      "Any platform can verify authenticity anywhere, anytime. No central authority handshake is required for basic trust checks.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Trust",
    description:
      "Confidence scoring and audit logs support moderation workflows, compliance evidence, and long-lived provenance records.",
  },
];

const HowItWorksSection = () => {
  return (
    <Section id="how-it-works">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />

      <motion.div
        className="mx-auto mb-14 max-w-3xl text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <SectionBadge>Process</SectionBadge>
        <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          How <span className="gradient-text">Fusion</span> Works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          A three-stage verification path designed for low-latency pipelines and provable audio integrity.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.number} delay={index * 0.08} y={24} className="group h-full">
            <Panel className="h-full p-7 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {step.number}
                </span>
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default HowItWorksSection;
