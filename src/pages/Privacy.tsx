import { ArrowLeft, Mail, ShieldCheck, Database, LockKeyhole, Users, ScrollText, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Container } from "@/components/ui/container";

type Item = {
  id: string;
  label: string;
};

const contents: Item[] = [
  { id: "overview", label: "Overview" },
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use it" },
  { id: "storage", label: "Storage and security" },
  { id: "providers", label: "Third-party services" },
  { id: "rights", label: "Your rights" },
  { id: "retention", label: "Retention and updates" },
  { id: "contact", label: "Contact" },
];

const Privacy = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      <main className="relative pb-24 pt-12 sm:pt-16">
        <Container>
          {/* Header band */}
          <header className="grid gap-10 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                Legal · Document 02 of 02
              </p>
              <h1 className="mt-4 max-w-measure-70 font-serif text-4xl font-light italic leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
                Privacy Policy.
              </h1>
              <p className="mt-5 max-w-measure-64 text-prose text-muted-foreground">
                What we collect when you use Fusion, why we collect it, and what you can ask us to do with it.
                Written in plain language. No clauses designed to be unreadable.
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
              <section id="overview" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Overview" icon={ShieldCheck} />
                <p className="text-prose text-muted-foreground">
                  Paperfrogs HQ and Paperfrogs Labs operate Fusion, the Audio Provenance Chain, and the sites that link
                  to this page. We collect the minimum information needed to run the service and we tell you here what
                  that is.
                </p>
                <p className="text-prose text-muted-foreground">
                  This policy applies to fusion.paperfrogs.dev, the public marketing pages, the user and client portals,
                  and the APIs we ship.
                </p>
              </section>

              {/* 02 */}
              <section id="collect" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Information we collect" icon={Database} />
                <p className="text-prose text-muted-foreground">Three categories, nothing else:</p>
                <ul className="space-y-3">
                  {[
                    {
                      title: "Account data",
                      body: "Email, name, organization, and role. You give this when you sign up or accept an invite.",
                    },
                    {
                      title: "Usage data",
                      body: "Which pages and endpoints you hit, with timestamps. Used for reliability, not for ads.",
                    },
                    {
                      title: "Audio artifacts",
                      body: "Files you upload, their cryptographic hashes, and provenance metadata. Stored only if you choose to upload.",
                    },
                  ].map((item) => (
                    <li
                      key={item.title}
                      className="grid grid-cols-[140px_1fr] gap-6 border-t border-rule pt-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        {item.title}
                      </span>
                      <span className="text-prose text-muted-foreground">{item.body}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 03 */}
              <section id="use" className="scroll-mt-32 space-y-5">
                <SectionHeader label="How we use it" icon={Users} />
                <p className="text-prose text-muted-foreground">
                  We use the data above to operate Fusion, send the emails you ask for, keep the service reliable,
                  and meet legal obligations. We do not sell it. We do not use it to train models.
                </p>
                <p className="text-prose text-muted-foreground">
                  If a future feature needs a different use, we will ask you first and let you opt out without losing
                  access to the parts you already use.
                </p>
              </section>

              {/* 04 */}
              <section id="storage" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Storage and security" icon={LockKeyhole} />
                <p className="text-prose text-muted-foreground">
                  Data lives on managed infrastructure with access restricted to the people who need it. Audio files
                  are content-addressed by their SHA-256 hash, so the bytes themselves are tamper-evident. Service
                  accounts use short-lived tokens.
                </p>
                <p className="text-prose text-muted-foreground">
                  Nothing on the public internet is perfectly secure. We log access, rotate credentials, and disclose
                  incidents when they affect you.
                </p>
              </section>

              {/* 05 */}
              <section id="providers" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Third-party services" icon={ScrollText} />
                <p className="text-prose text-muted-foreground">
                  A short list of processors. Each has a data-processing agreement with us.
                </p>
                <div className="mt-2 divide-y divide-rule border-y border-rule">
                  {[
                    { name: "Supabase", role: "Database and object storage" },
                    { name: "Resend", role: "Transactional email delivery" },
                    { name: "Umami", role: "Privacy-focused analytics, no cookies" },
                    { name: "Netlify", role: "Edge functions and hosting" },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-4"
                    >
                      <span className="font-serif text-lg italic text-foreground">{p.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 06 */}
              <section id="rights" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Your rights" icon={Users} />
                <p className="text-prose text-muted-foreground">You can ask us to do any of the following at any time:</p>
                <ul className="space-y-2">
                  {[
                    "Send a copy of the personal data we hold about you.",
                    "Correct anything that is wrong.",
                    "Delete your account and the data tied to it, where the law allows.",
                    "Opt out of any non-essential email with one click.",
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

              {/* 07 */}
              <section id="retention" className="scroll-mt-32 space-y-5">
                <SectionHeader label="Retention and updates" icon={Clock} />
                <p className="text-prose text-muted-foreground">
                  We keep account data while your account is active and for up to 30 days after deletion for recovery.
                  Audio artifacts you upload stay until you remove them or close the account. Audit logs are kept for
                  12 months.
                </p>
                <p className="text-prose text-muted-foreground">
                  When we change this policy in a way that affects you, we email the address on file and post a notice
                  on the dashboard. The previous version stays available on request.
                </p>
              </section>

              {/* 08 */}
              <section id="contact" className="scroll-mt-32 space-y-6 border-t border-rule pt-10">
                <SectionHeader label="Contact" icon={Mail} />
                <p className="text-prose text-muted-foreground">
                  Write to the team directly. A human reads every message.
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
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <header className="flex items-baseline gap-4">
    <span aria-hidden="true" className="h-px flex-1 bg-rule" />
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  </header>
);

export default Privacy;