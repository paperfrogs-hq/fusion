import type { ComponentType, ReactNode } from "react";
import { ArrowLeft, Database, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
  { id: "overview", label: "Overview" },
  { id: "collect", label: "Information We Collect" },
  { id: "use", label: "How We Use Information" },
  { id: "storage", label: "Storage and Security" },
  { id: "providers", label: "Third-Party Services" },
  { id: "rights", label: "Your Rights" },
  { id: "retention", label: "Data Retention" },
  { id: "contact", label: "Contact" },
];

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute -left-20 top-24 h-[340px] w-[340px] rounded-full bg-primary/10 blur-[130px]" />
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

                <SectionBadge className="mt-5">Legal</SectionBadge>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Privacy Policy
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  This policy explains what information Fusion collects, why we collect it, and the controls available
                  to you.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge>Effective: January 1, 2025</Badge>
                  <Badge variant="secondary">Paperfrogs HQ + Paperfrogs Labs</Badge>
                </div>
              </section>

              <SectionBlock id="overview" title="1. Overview" icon={ShieldCheck}>
                <p className="leading-relaxed">
                  Paperfrogs HQ and Paperfrogs Labs (collectively, "we," "us," "our," or "Company") are committed to
                  protecting your privacy. This policy applies to Fusion websites, products, and related services that
                  link to this page.
                </p>
              </SectionBlock>

              <SectionBlock id="collect" title="2. Information We Collect" icon={Database}>
                <div className="space-y-3">
                  {[
                    "Personal data: contact details such as your email when you request support or submit forms.",
                    "Usage data: product and page interactions used to improve performance and reliability.",
                    "Technical data: IP address, browser type, device environment, and request metadata.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="use" title="3. How We Use Information">
                <div className="space-y-3">
                  {[
                    "Provide and operate Fusion services, including onboarding and support.",
                    "Send service notices and essential account communications.",
                    "Improve reliability, security, and overall user experience.",
                    "Detect abuse, fraud, and unauthorized access attempts.",
                  ].map((item) => (
                    <div key={item} className="rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm sm:text-base">
                      {item}
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="storage" title="4. Data Storage and Security" icon={LockKeyhole}>
                <p className="leading-relaxed">
                  We store data using managed infrastructure providers and apply technical and organizational safeguards
                  designed to protect confidentiality and integrity. No internet transmission or storage system is fully
                  secure, but we continuously improve our controls.
                </p>
              </SectionBlock>

              <SectionBlock id="providers" title="5. Third-Party Services">
                <p>Fusion uses trusted providers to operate key systems:</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-secondary/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Supabase</p>
                    <p className="mt-2 text-sm">Database and storage infrastructure.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Resend</p>
                    <p className="mt-2 text-sm">Transactional email delivery.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Umami</p>
                    <p className="mt-2 text-sm">Privacy-focused analytics.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm">These providers are expected to process data only for service delivery.</p>
              </SectionBlock>

              <SectionBlock id="rights" title="6. Your Rights and Choices">
                <div className="space-y-3">
                  {[
                    "Request access to personal information we hold about you.",
                    "Request correction or deletion where applicable by law.",
                    "Opt out of non-essential communications at any time.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id="retention" title="7. Data Retention and Policy Updates">
                <p className="leading-relaxed">
                  We retain personal information only as long as needed for legitimate business, legal, and security
                  purposes. We may update this policy periodically and publish revisions on this page.
                </p>
              </SectionBlock>

              <SectionBlock id="contact" title="Privacy Contact" icon={Mail}>
                <p>For privacy requests or policy questions, contact our team directly.</p>
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

export default Privacy;
