import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Gavel, Mail, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SectionBadge from "@/components/SectionBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const contents = [
  { id: "agreement", label: "Agreement to Terms" },
  { id: "license", label: "Use License" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "limitations", label: "Limitations of Liability" },
  { id: "accuracy", label: "Accuracy of Materials" },
  { id: "links", label: "External Links" },
  { id: "updates", label: "Policy Updates" },
  { id: "law", label: "Governing Law" },
  { id: "contact", label: "Contact Information" },
];

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -left-24 top-24 h-[340px] w-[340px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute -right-20 bottom-20 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[130px]" />
      </div>

      <Header />

      <main className="relative z-10 px-4 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8">
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
              transition={{ duration: 0.36 }}
              className="surface-panel p-7 sm:p-9"
            >
              <button
                onClick={() => navigate("/")}
                className="mb-4 flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </button>
              <SectionBadge>Legal</SectionBadge>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Terms of Service
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                These terms govern access to and use of Fusion websites, applications, and related services.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge>Effective: January 1, 2025</Badge>
                <Badge variant="secondary">Paperfrogs HQ + Paperfrogs Labs</Badge>
              </div>
            </motion.section>

            <Panel id="agreement" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">1. Agreement to Terms</h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                By accessing or using Fusion, you agree to these Terms of Service. If you do not agree with these
                terms, do not use the service.
              </p>
            </Panel>

            <Panel id="license" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">2. Use License</h2>
              <p className="mt-4 text-muted-foreground">
                Subject to these terms, we grant a limited, non-exclusive, non-transferable license to use Fusion for
                lawful purposes. You may not:
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "Copy, modify, or reproduce materials except as expressly permitted.",
                  "Use materials for unauthorized commercial redistribution.",
                  "Reverse engineer or attempt to extract source logic from protected components.",
                  "Remove proprietary notices, attributions, or legal markings.",
                  "Mirror or republish service materials on external systems without authorization.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="disclaimer" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">3. Disclaimer</h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Fusion materials and services are provided "as is" and "as available" without warranties of any kind,
                whether express or implied, including merchantability, fitness for a particular purpose, or
                non-infringement.
              </p>
            </Panel>

            <Panel id="limitations" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">4. Limitations of Liability</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                To the maximum extent permitted by law, the Company and its suppliers are not liable for indirect,
                incidental, special, consequential, or punitive damages, or for loss of data, revenue, profits, or
                business interruption arising from use of or inability to use Fusion.
              </p>
            </Panel>

            <Panel id="accuracy" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">5. Accuracy of Materials</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Fusion content may contain technical or typographical errors. We may update, modify, or remove content
                at any time without prior notice, and do not guarantee that all materials are always complete, current,
                or error-free.
              </p>
            </Panel>

            <Panel id="links" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">6. External Links</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Fusion may link to third-party sites or services. We are not responsible for their content, security,
                or policies. Accessing third-party resources is at your own risk.
              </p>
            </Panel>

            <Panel id="updates" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">7. Modifications to Terms</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                We may revise these Terms of Service from time to time. Continued use of Fusion after updates are
                posted constitutes acceptance of the revised terms.
              </p>
            </Panel>

            <Panel id="law" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">8. Governing Law</h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                These terms are governed by the laws of the jurisdiction in which Paperfrogs HQ operates, without
                regard to conflict-of-law principles. You agree to submit to the courts of that jurisdiction.
              </p>
            </Panel>

            <Panel id="contact" className="p-7 text-center sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Legal Contact
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">Questions About These Terms?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Contact our team for legal or policy clarifications.
              </p>
              <a
                href="mailto:fusion@paperfrogs.dev"
                className="mt-5 inline-block text-xl font-semibold text-primary transition-colors hover:text-[#C8FF2F] sm:text-2xl"
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

export default Terms;
