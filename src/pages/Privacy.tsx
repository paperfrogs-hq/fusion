import { motion } from "framer-motion";
import { ArrowLeft, Database, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SectionBadge from "@/components/SectionBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

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
                Privacy Policy
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                This policy explains what information Fusion collects, why we collect it, and the controls available to
                you.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge>Effective: January 1, 2025</Badge>
                <Badge variant="secondary">Paperfrogs HQ + Paperfrogs Labs</Badge>
              </div>
            </motion.section>

            <Panel id="overview" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">1. Overview</h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Paperfrogs HQ and Paperfrogs Labs (collectively, "we," "us," "our," or "Company") are committed to
                protecting your privacy. This Privacy Policy applies to the Fusion website, products, and related
                services that link to this policy.
              </p>
            </Panel>

            <Panel id="collect" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">2. Information We Collect</h2>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "Personal data: contact details such as your email when you join waitlists, request support, or submit forms.",
                  "Usage and analytics data: product and page interactions used to improve performance and reliability.",
                  "Device and technical data: IP address, browser type, operating environment, and basic request metadata.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="use" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">3. How We Use Information</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Provide and operate Fusion services, including onboarding and support.",
                  "Send service updates, platform notices, and product communications.",
                  "Improve reliability, security posture, and user experience.",
                  "Detect abuse, fraud, unauthorized access, and operational risk.",
                ].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground sm:text-base">
                    {item}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="storage" className="p-7 sm:p-8">
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">4. Data Storage and Security</h2>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                We store data using managed infrastructure providers and apply technical and organizational safeguards
                designed to protect confidentiality and integrity. No internet transmission or storage system is
                guaranteed to be fully secure, but we continuously improve our controls.
              </p>
            </Panel>

            <Panel id="providers" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">5. Third-Party Services</h2>
              <p className="mt-4 text-muted-foreground">
                Fusion uses trusted service providers to operate key systems:
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Supabase</p>
                  <p className="mt-2 text-sm text-muted-foreground">Database and storage infrastructure.</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Resend</p>
                  <p className="mt-2 text-sm text-muted-foreground">Transactional email delivery.</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Umami</p>
                  <p className="mt-2 text-sm text-muted-foreground">Privacy-focused analytics and insights.</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                These providers are expected to process data only for service delivery and operational purposes.
              </p>
            </Panel>

            <Panel id="rights" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">6. Your Rights and Choices</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Request access to personal information we hold about you.",
                  "Request correction or deletion of personal information, where applicable.",
                  "Opt out of marketing communications at any time.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel id="retention" className="p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">7. Data Retention and Changes</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                We retain personal information only as long as needed for legitimate business, legal, and security
                purposes. We may update this policy from time to time and will publish updated versions on this page.
              </p>
            </Panel>

            <Panel id="contact" className="p-7 text-center sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Privacy Contact
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">Questions About Privacy?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                For privacy requests or policy questions, contact our team directly.
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

export default Privacy;
