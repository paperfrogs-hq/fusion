import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/SectionBadge";
import { useNavigate } from "react-router-dom";

const Whitepaper = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </span>
          </button>
          <h1 className="text-xl font-bold text-foreground">Whitepaper</h1>
          <div className="w-20" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            {/* Title Section */}
            <div className="space-y-6">
              <SectionBadge>Early Development</SectionBadge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="gradient-text">Fusion</span>
                <br />
                Cryptographic Infrastructure for Audio Provenance and Verification
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The rise of generative AI has eliminated audio's implicit trust model. Fusion embeds cryptographically 
                verifiable proof of origin directly into audio at creation time, enabling portable and independent 
                verification across platforms, ecosystems, and regulatory environments.
              </p>
            </div>

            {/* Abstract */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">Core Thesis</h2>
              <div className="space-y-3 text-lg text-muted-foreground">
                <p>• Trust must be embedded at creation, not inferred after distribution.</p>
                <p>• Fusion treats audio provenance as infrastructure, not a detection problem.</p>
              </div>
            </div>

            {/* The Problem */}
            <div className="space-y-6 bg-card/50 p-8 rounded-lg border border-border/50">
              <h2 className="text-3xl font-bold text-foreground">The Problem</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In the post-AI internet, audio authenticity is broken.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">→</span>
                  <span>AI voice models can generate indistinguishable synthetic speech.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">→</span>
                  <span>Deepfakes and impersonation scale faster than detection systems.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">→</span>
                  <span>Creators lack reliable ways to prove authorship of original audio.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">→</span>
                  <span>Platforms face increasing regulatory pressure to disclose AI-generated media.</span>
                </li>
              </ul>
              <p className="text-lg text-primary font-semibold">
                Detection alone is insufficient. Trust must exist at creation, not after distribution.
              </p>
            </div>

            {/* What Fusion Does */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">What Fusion Does</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fusion creates trust in audio at the infrastructure level.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                It embeds cryptographic provenance directly into audio at creation time and enables independent 
                verification anywhere downstream—without reliance on a central authority.
              </p>
              <p className="text-xl text-primary font-semibold">
                Trust is written into the audio itself and travels with it.
              </p>
            </div>

            {/* How It Works */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Embed", desc: "At the moment audio is created, Fusion embeds cryptographically verifiable provenance directly into the audio." },
                  { title: "Verify", desc: "Any downstream party can verify the audio without access to the original creator or platform." },
                  { title: "Trust", desc: "Verification returns origin classification, confidence score, creation timestamp, and an audit-ready record." },
                ].map((item) => (
                  <div key={item.title} className="bg-card/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Systems */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Core Systems</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Audio Processing Engine</h3>
                  <p className="text-muted-foreground">
                    Handles audio ingestion, normalization, and preparation for provenance embedding while preserving 
                    perceptual quality and format compatibility.
                  </p>
                </div>
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Watermark Verification System</h3>
                  <p className="text-muted-foreground">
                    Cryptographically embeds and verifies provenance markers that survive common transformations 
                    such as compression and re-encoding.
                  </p>
                </div>
              </div>
            </div>

            {/* Developer Experience */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Developer Experience</h2>
              <p className="text-lg text-muted-foreground">
                Fusion is built as developer infrastructure, not a consumer product.
              </p>
              <div className="bg-card/80 border border-border/50 rounded-lg p-6 overflow-auto">
                <pre className="text-sm text-foreground/80 font-mono whitespace-pre-wrap break-words">
{`from fusion import FusionVerifier

verifier = FusionVerifier(api_key="your_api_key")
result = verifier.verify("audio_file.mp3")

print(result.origin)
print(result.confidence_score)
print(result.timestamp)`}
                </pre>
              </div>
            </div>

            {/* Who Fusion Is For */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Who Fusion Is For</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Platforms", desc: "Deepfake mitigation, scalable moderation signals, regulatory compliance." },
                  { title: "AI Companies", desc: "Transparent labeling of AI-generated audio and responsible model deployment." },
                  { title: "Creators and Artists", desc: "Cryptographically provable authorship and protection of voice identity." },
                  { title: "Compliance Teams", desc: "Deterministic verification and audit-ready provenance records." },
                ].map((item) => (
                  <div key={item.title} className="bg-card/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust and Security Model */}
            <div className="space-y-6 bg-primary/5 border border-primary/20 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-foreground">Trust and Security Model</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fusion operates under a zero-trust verification model.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Verification does not require trusting Fusion as an authority.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Provenance claims are cryptographically verifiable and auditable.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Failures degrade safely to "unverifiable" rather than false certainty.</span>
                                </li>
              </ul>
            </div>

            {/* Project Timeline */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Project Timeline</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                  <div>December 2023 — Project initiated</div>
                  <div>July 2024 — Beta site launched</div>
                  <div>January 2025 — Original direction paused</div>
                  <div>November 2025 — Project redefined</div>
                  <div>December 2025 — Fusion v2 development begins</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-primary mt-8 mb-4">Planned Milestones</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span><strong>Q1 2026</strong> — Public beta launch</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span><strong>Q2 2026</strong> — Platform integrations and pilots</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span><strong>Q3 2026</strong> — Infrastructure scaling</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold">→</span>
                  <span><strong>Q4 2026</strong> — Ecosystem expansion</span>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-6 bg-card/50 p-8 rounded-lg border border-border/50 text-center">
              <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For platform integrations, enterprise pilots, research collaboration, or early access:
              </p>
              <a 
                href="mailto:hello@paperfrogs.dev"
                className="inline-block text-2xl font-bold text-primary hover:text-accent transition-colors"
              >
                hello@paperfrogs.dev
              </a>
              <p className="text-sm text-muted-foreground/70">
                Fusion is in early development. Responses may be limited prior to public beta.
              </p>
            </div>

            {/* Back to Home */}
            <motion.div
              className="pt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button variant="hero-outline" size="lg" onClick={() => navigate("/")}>
                ← Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Whitepaper;
