import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck, FileCode2, Fingerprint, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionBadge from "./SectionBadge";
import { Section } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const outputArtifacts = [
  {
    icon: ClipboardCheck,
    title: "Decision Packet",
    description: "Structured decision payload for policy engines, moderation tooling, and downstream automation.",
    points: ["Result", "Confidence", "Reasoning", "Status"],
  },
  {
    icon: Fingerprint,
    title: "Evidence Identifiers",
    description: "Deterministic provenance IDs and fingerprints for traceability, dispute handling, and legal review.",
    points: ["Fingerprint", "Provenance ID", "Timestamp", "Signer"],
  },
  {
    icon: FileCode2,
    title: "Integration Surface",
    description: "API-friendly output compatible with webhooks, internal dashboards, and compliance export flows.",
    points: ["JSON", "Webhook", "Logs", "Export"],
  },
];

const DeploymentSection = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <div className="pointer-events-none absolute inset-0 bg-radial-bottom" />

      <motion.div
        className="mx-auto mb-14 max-w-3xl text-center"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <SectionBadge>Output Model</SectionBadge>
        <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Verification Output Pack
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Every verification returns machine-readable, audit-ready artifacts that can be consumed by product, policy,
          and legal workflows.
        </p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {outputArtifacts.map((artifact, index) => (
          <Reveal key={artifact.title} delay={index * 0.06} y={18}>
            <Panel className="h-full p-6 sm:p-7">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary">
                <artifact.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{artifact.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{artifact.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {artifact.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-border bg-secondary/80 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.14} y={18}>
        <Panel className="mt-7 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Next Step</p>
            <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
              Review implementation details or start a pilot.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="hero-outline" onClick={() => navigate("/whitepaper")}>
              <ShieldCheck className="h-4 w-4" />
              Open Whitepaper
            </Button>
            <Button variant="hero" onClick={() => navigate("/pricing")}>
              Start Planning
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
};

export default DeploymentSection;
