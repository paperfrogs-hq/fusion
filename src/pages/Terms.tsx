import { ArrowLeft, Mail, Scale, Gavel, ScrollText, AlertTriangle, Link2, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Container } from "@/components/ui/container";

type Item = {
  id: string;
  label: string;
};

const contents: Item[] = [
  { id: "agreement", label: "Agreement to terms" },
  { id: "license", label: "Use license" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "limitations", label: "Limitations of liability" },
  { id: "accuracy", label: "Accuracy of materials" },
  { id: "links", label: "External links" },
  { id: "updates", label: "Modifications" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

const Terms = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      <main className="relative pb-24 pt-12 sm:pt-16">
        <Container>
          {/* Header band */}
          <header className="grid gap-10 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                Legal · Document 01 of 02
              </p>
              <h1 className="mt-4 max-w-measure-70 font-serif text-4xl font-light italic leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                Terms of Service.
              </h1>
              <p className="mt-5 max-w-measure-64 text-prose text-muted-foreground">
                The rules for using Fusion. Read them once, then keep building. We tried to keep this short and free
                of clauses that exist only to confuse you.
              </p>
            </div>
            <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 lg:text-right">
              <span>Effective · January 1, 2025</span>
              <span>Last reviewed · August 7, 2026</span>
              <span>Maintained by · Paperfrogs Labs</span>
            </div>
          </header>

          <div className="hairline" />

          {/* On this page rail + body */}
          <div className="grid gap-12 pt-12 xl:grid-cols-[220px_1fr]">
            <aside className="hidden xl:block">
              <div className="sticky top-28">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  On this page
                </p>
                <nav className="mt-5 flex flex-col gap-3">
                  {contents.map((c) => (
                    <a
                      key={c.id}
                      href={`#${c.id}`}
                      className="group font-serif text-sm italic text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="link-underline">{c.label}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <article className="max-w-measure-70 space-y-16">
              {/* 01 */}
              <section id="agreement" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Agreement to terms" icon={Scale} />
                <p className="text-prose text-muted-foreground">
                  By using Fusion, you agree to these terms. If you do not agree, do not use the service. If you are
                  agreeing on behalf of a company or team, you confirm that you have authority to do so.
                </p>
              </section>

              {/* 02 */}
              <section id="license" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Use license" icon={FileText} />
                <p className="text-prose text-muted-foreground">
                  We grant you a limited, non-exclusive, non-transferable license to use Fusion for lawful purposes
                  inside your team. You may not:
                </p>
                <ul className="space-y-2">
                  {[
                    "Resell, sublicense, or white-label Fusion without written permission.",
                    "Reverse engineer the client, the API, or the watermark layer.",
                    "Upload content that is illegal, infringing, or intended to deceive.",
                    "Bypass rate limits, quota, or account-status checks.",
                    "Remove proprietary notices or attribution from generated artifacts.",
                  ].map((line) => (
                    <li key={line} className="flex items-baseline gap-3 text-prose text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">
                        ·
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 03 */}
              <section id="disclaimer" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Disclaimer" icon={AlertTriangle} />
                <p className="text-prose text-muted-foreground">
                  Fusion is provided as is and as available. We disclaim warranties of merchantability, fitness for a
                  particular purpose, and non-infringement to the extent the law allows.
                </p>
                <p className="text-prose text-muted-foreground">
                  We test the watermark detector against the audio models we know about. New models appear regularly.
                  No provenance system is a guarantee against every possible adversary.
                </p>
              </section>

              {/* 04 */}
              <section id="limitations" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Limitations of liability" icon={ScrollText} />
                <p className="text-prose text-muted-foreground">
                  To the maximum extent permitted by law, Paperfrogs HQ, Paperfrogs Labs, and our suppliers are not
                  liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data,
                  revenue, profits, or business arising from use of, or inability to use, Fusion.
                </p>
                <p className="text-prose text-muted-foreground">
                  Our total liability for any claim related to the service is capped at the amount you paid us in the
                  twelve months before the claim.
                </p>
              </section>

              {/* 05 */}
              <section id="accuracy" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Accuracy of materials" icon={ScrollText} />
                <p className="text-prose text-muted-foreground">
                  Documentation, dashboards, and reference outputs may contain errors. We update them as the product
                  changes but do not promise completeness at every moment. If you spot something wrong, tell us and
                  we will fix it.
                </p>
              </section>

              {/* 06 */}
              <section id="links" className="scroll-mt-32 space-y-5">
                <SectionHeader label="External links" icon={Link2} />
                <p className="text-prose text-muted-foreground">
                  We link to third-party sites from time to time. We do not control them and we are not responsible
                  for their content, security, or policies. Following an external link is at your own risk.
                </p>
              </section>

              {/* 07 */}
              <section id="updates" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Modifications" icon={Clock} />
                <p className="text-prose text-muted-foreground">
                  We may revise these terms as the product evolves. When the change is material we email the address
                  on file and post a notice on the dashboard. Continued use after the effective date counts as
                  acceptance.
                </p>
                <p className="text-prose text-muted-foreground">
                  Previous versions are kept on request. Tell us if you want to see one.
                </p>
              </section>

              {/* 08 */}
              <section id="law" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Governing law" icon={Gavel} />
                <p className="text-prose text-muted-foreground">
                  These terms are governed by the laws of the jurisdiction in which Paperfrogs HQ operates, without
                  regard to conflict-of-law principles. Disputes are resolved in the courts of that jurisdiction unless
                  a separate agreement says otherwise.
                </p>
              </section>

              {/* 09 */}
              <section id="contact" className="scroll-mt-32 space-y-6 border-t border-rule pt-10">
                <SectionHeader label="Contact" icon={Mail} />
                <p className="text-prose text-muted-foreground">
                  Legal notices, contract questions, and term clarifications go to this address.
                </p>
                <a
                  href="mailto:fusion@paperfrogs.dev"
                  className="link-underline inline-block font-serif text-2xl italic text-foreground sm:text-3xl"
                >
                  fusion@paperfrogs.dev
                </a>
                <div>
                  <Link
                    to="/"
                    className="link-underline inline-flex items-center gap-2 font-serif text-base italic text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Fusion
                  </Link>
                </div>
              </section>
            </article>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

const SectionHeader = ({
  label,
  icon: Icon,
}: {
  label: string;
  icon: import("react").ComponentType<{ className?: string }>;
}) => (
  <header className="flex items-baseline gap-4">
    <span aria-hidden="true" className="h-px flex-1 bg-rule" />
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  </header>
);

export default Terms;