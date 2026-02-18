import { motion } from "framer-motion";
import { Code, Eye, Globe2, Layers, Lock, Zap } from "lucide-react";
import SectionBadge from "./SectionBadge";
import { Section } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: Lock,
    title: "Protocol-First",
    description:
      "Not an upload-only SaaS. Fusion is a protocol-oriented foundation layer other systems can integrate deeply.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description:
      "Verification is portable and low-latency, allowing trust checks without recontacting the source platform.",
  },
  {
    icon: Globe2,
    title: "Platform-Scale",
    description:
      "Engineered for high-volume environments with efficient embedding and predictable verification throughput.",
  },
  {
    icon: Layers,
    title: "Decentralized Proof",
    description:
      "Proof artifacts travel with the media itself, reducing dependence on centralized Fusion infrastructure.",
  },
  {
    icon: Code,
    title: "Research-Driven",
    description:
      "Built from cryptographic primitives and standards-oriented design, not opaque heuristic-only scoring.",
  },
  {
    icon: Eye,
    title: "Confidence + Audit",
    description:
      "Moderation and compliance teams receive interpretable confidence outcomes and audit-ready event trails.",
  },
];

const FeaturesSection = () => {
  return (
    <Section id="features">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />

      <motion.div
        className="mx-auto mb-14 max-w-3xl text-center"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <SectionBadge>Differentiators</SectionBadge>
        <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Why <span className="gradient-text">Fusion</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Precision-focused verification architecture built for technical teams and infrastructure workflows.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.05} y={18}>
            <Panel className="group p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{feature.description}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default FeaturesSection;
