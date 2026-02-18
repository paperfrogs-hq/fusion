import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, CheckCircle2, Code2, Network, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SectionBadge from "@/components/SectionBadge";
import { Panel } from "@/components/ui/panel";
import Footer from "@/components/Footer";

const contents = [
  { id: "summary", label: "Executive Summary" },
  { id: "problem", label: "Problem Statement" },
  { id: "architecture", label: "Architecture" },
  { id: "lifecycle", label: "Verification Lifecycle" },
  { id: "security", label: "Security Model" },
  { id: "api", label: "Developer Experience" },
  { id: "roadmap", label: "Roadmap" },
  { id: "contact", label: "Contact" },
];

const architecture = [
  {
    title: "Signal Preparation Layer",
    body: "Normalizes source audio, preserves perceptual quality, and prepares payloads for deterministic provenance embedding.",
  },
  {
    title: "Provenance Embed Layer",
    body: "Attaches cryptographic origin claims and trust metadata at creation, before downstream redistribution.",
  },
  {
    title: "Verification Runtime",
    body: "Runs independent checks and returns structured outcomes: origin class, confidence range, timestamp lineage, and status.",
  },
  {
    title: "Audit and Evidence Layer",
    body: "Produces policy-ready records for trust and safety, legal review, incident response, and compliance evidence retention.",
  },
];

const lifecycle = [
  "Create: source audio enters Fusion-enabled creation or ingestion flow.",
  "Attach: cryptographic provenance claims are embedded at creation time.",
  "Distribute: audio moves across platforms, APIs, and content systems.",
  "Verify: any downstream party runs independent trust checks.",
  "Report: verification output is returned with confidence and evidence metadata.",
];

const roadmap = [
  { phase: "Q1 2026", item: "Public beta and verification API hardening" },
  { phase: "Q2 2026", item: "Platform pilot integrations and moderation workflows" },
  { phase: "Q3 2026", item: "Scalable runtime improvements and reporting expansion" },
  { phase: "Q4 2026", item: "Broader ecosystem launch and partner deployments" },
];

const Whitepaper = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -left-24 top-20 h-[360px] w-[360px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute -right-20 bottom-24 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[130px]" />
      </div>

      <motion.header
        className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/78 backdrop-blur-xl"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <p className="text-sm font-semibold text-foreground">Fusion Whitepaper</p>
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">v2 Draft</span>
        </div>
      </motion.header>

      <main className="relative z-10 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1320px] gap-8 xl:grid-cols-[250px_1fr]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Contents</p>
              <nav className="mt-3 space-y-1.5">
                {contents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
              className="surface-panel p-7 sm:p-9"
            >
              <SectionBadge>Research Draft</SectionBadge>
              <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                <span className="gradient-text">Fusion</span>
                <span className="block">Cryptographic Infrastructure for Audio Provenance</span>
              </h1>
              <p className="mt-5 max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Fusion is a provenance-first verification engine for the AI era. Instead of post-distribution heuristics,
                Fusion embeds trust at creation and enables independent verification across any downstream environment.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Audio Provenance
                </span>
                <span className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Verification Runtime
                </span>
                <span className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Audit-Ready Evidence
                </span>
              </div>
            </motion.section>

            <Panel id="summary" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Executive Summary</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Generative audio has removed implicit trust from speech and media workflows. Fusion restores trust by treating
                provenance as core infrastructure. Proof is attached at creation, verification remains portable, and downstream
                decisions can be backed by deterministic, auditable outcomes.
              </p>
            </Panel>

            <Panel id="problem" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Problem Statement</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Synthetic voice can now mimic humans at production scale.",
                  "Deepfake detection tools alone do not provide durable trust.",
                  "Creators and platforms need authorship proof that travels with media.",
                  "Regulatory pressure is increasing for AI disclosure and provenance records.",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p className="text-muted-foreground">{line}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <section id="architecture" className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Architecture</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {architecture.map((block) => (
                  <Panel key={block.title} className="p-6">
                    <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{block.body}</p>
                  </Panel>
                ))}
              </div>
            </section>

            <Panel id="lifecycle" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Verification Lifecycle</h2>
              </div>
              <div className="mt-5 space-y-3">
                {lifecycle.map((step) => (
                  <div key={step} className="rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground sm:text-base">
                    {step}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="security" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Security and Trust Model</h2>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "Zero-trust verification assumptions with deterministic outputs.",
                  "Cryptographic claims are auditable independent of central trust.",
                  "Failures resolve to 'unverifiable' states rather than false certainty.",
                  "Operational logs are structured for legal and compliance review.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="api" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Developer Experience</h2>
              </div>
              <p className="mt-4 text-muted-foreground">
                Fusion is API-first infrastructure. Engineering teams can integrate provenance checks directly into ingestion,
                moderation, or publishing pipelines.
              </p>
              <div className="mt-5 overflow-auto rounded-xl border border-border bg-secondary/70 p-4">
                <pre className="text-sm leading-relaxed text-foreground/85">
{`from fusion import FusionVerifier

verifier = FusionVerifier(api_key="your_api_key")
result = verifier.verify("audio_file.mp3")

print(result.origin)
print(result.confidence_score)
print(result.provenance_id)
print(result.timestamp)`}
                </pre>
              </div>
            </Panel>

            <Panel id="roadmap" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Roadmap</h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {roadmap.map((milestone) => (
                  <div key={milestone.phase} className="rounded-xl border border-border bg-secondary/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{milestone.phase}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{milestone.item}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="contact" className="p-7 text-center sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Contact and Collaboration</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                For platform integrations, enterprise pilots, or research collaboration, contact the Fusion team.
              </p>
              <a
                href="mailto:fusion@paperfrogs.dev"
                className="mt-5 inline-block text-2xl font-semibold text-primary transition-colors hover:text-[#C8FF2F]"
              >
                fusion@paperfrogs.dev
              </a>
              <div className="mt-7">
                <Button variant="hero-outline" size="lg" onClick={() => navigate("/")}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Whitepaper;
