import type { ComponentType, ReactNode } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Code2, Network, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionBadge from "@/components/SectionBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type SectionBlockProps = {
  id: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
};

const SectionBlock = ({ id, title, icon: Icon, children }: SectionBlockProps) => (
  <section id={id} className="scroll-mt-32 surface-panel p-6 sm:p-8">
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
      <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
    </div>
    <div className="mt-4 text-muted-foreground">{children}</div>
  </section>
);

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
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute -left-20 top-20 h-[340px] w-[340px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute -right-20 bottom-20 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[130px]" />
      </div>

      <Header />

      <main className="relative z-10 pb-20 pt-32 sm:pt-36">
        <Container>
          <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
            <aside className="hidden xl:block">
              <div className="sticky top-24 surface-panel p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">On This Page</p>
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

            <article className="space-y-6">
              <section className="surface-panel p-7 sm:p-9">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </button>

                <SectionBadge className="mt-5">Research Draft</SectionBadge>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Fusion Whitepaper
                </h1>
                <p className="mt-4 max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Cryptographic infrastructure for audio provenance in the AI era. Fusion embeds trust at creation time
                  and enables portable verification across downstream platforms.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge>Audio Provenance</Badge>
                  <Badge variant="secondary">Verification Runtime</Badge>
                  <Badge variant="secondary">Audit-Ready Evidence</Badge>
                </div>
              </section>

              <SectionBlock id="summary" title="Executive Summary">
                <p className="leading-relaxed">
                  Generative audio has removed implicit trust from speech and media workflows. Fusion restores trust by
                  treating provenance as core infrastructure. Proof is attached at creation, verification remains
                  portable, and downstream decisions can be backed by deterministic, auditable outcomes.
                </p>
              </SectionBlock>

              <SectionBlock id="problem" title="Problem Statement">
                <div className="space-y-3">
                  {[
                    "Synthetic voice can now mimic humans at production scale.",
                    "Deepfake detection tools alone do not provide durable trust.",
                    "Creators and platforms need authorship proof that travels with media.",
                    "Regulatory pressure is increasing for AI disclosure and provenance records.",
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="architecture" title="Architecture" icon={Network}>
                <div className="grid gap-4 md:grid-cols-2">
                  {architecture.map((block) => (
                    <div key={block.title} className="rounded-xl border border-border bg-secondary/60 p-5">
                      <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{block.body}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="lifecycle" title="Verification Lifecycle" icon={CheckCircle2}>
                <div className="space-y-3">
                  {lifecycle.map((step) => (
                    <div key={step} className="rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm sm:text-base">
                      {step}
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="security" title="Security and Trust Model" icon={ShieldCheck}>
                <div className="space-y-3">
                  {[
                    "Zero-trust verification assumptions with deterministic outputs.",
                    "Cryptographic claims are auditable independent of central trust.",
                    "Failures resolve to 'unverifiable' states rather than false certainty.",
                    "Operational logs are structured for legal and compliance review.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="api" title="Developer Experience" icon={Code2}>
                <p>
                  Fusion is API-first infrastructure. Engineering teams can integrate provenance checks directly into
                  ingestion, moderation, or publishing pipelines.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-border bg-secondary/70 p-4">
                  <pre className="text-sm leading-relaxed text-foreground/85">{`from fusion import FusionVerifier

verifier = FusionVerifier(api_key="your_api_key")
result = verifier.verify("audio_file.mp3")

print(result.origin)
print(result.confidence_score)
print(result.provenance_id)
print(result.timestamp)`}</pre>
                </div>
              </SectionBlock>

              <SectionBlock id="roadmap" title="Roadmap" icon={CalendarClock}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roadmap.map((milestone) => (
                    <div key={milestone.phase} className="rounded-xl border border-border bg-secondary/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{milestone.phase}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{milestone.item}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="contact" title="Contact and Collaboration">
                <p className="max-w-2xl">
                  For platform integrations, enterprise pilots, or research collaboration, contact the Fusion team.
                </p>
                <a
                  href="mailto:fusion@paperfrogs.dev"
                  className="mt-4 inline-block text-xl font-semibold text-primary transition-colors hover:text-[#C8FF2F] sm:text-2xl"
                >
                  fusion@paperfrogs.dev
                </a>
                <div className="mt-6">
                  <Button variant="hero-outline" size="lg" onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </SectionBlock>
            </article>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Whitepaper;
