import { ArrowRight, Building2, CheckCircle2, ShieldCheck, User } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Index = () => {
  const valueCards = [
    {
      title: "Authentic Proof",
      description: "Generate tamper-evident verification records for every submitted audio file.",
    },
    {
      title: "Fast Workflow",
      description: "From upload to verification report in minutes with a clean operational flow.",
    },
    {
      title: "Operational Control",
      description: "Role-based access and clear governance for teams handling sensitive media.",
    },
  ];

  const steps = [
    "Upload audio and metadata",
    "Run verification and policy checks",
    "Share reports and provenance records",
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute -left-20 top-16 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] sm:-left-24 sm:top-20 sm:h-[420px] sm:w-[420px] sm:blur-[140px]" />
        <div className="absolute -right-16 bottom-16 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[110px] sm:-right-24 sm:bottom-24 sm:h-[380px] sm:w-[380px] sm:blur-[130px]" />
      </div>

      <Header />

      <main className="relative z-10 px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-6xl space-y-14">
          <section className="grid items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <Badge>Audio Trust Platform</Badge>
              <div>
                <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  Protect audio credibility
                  <span className="gradient-text block">without added complexity</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Fusion helps individuals and organizations verify audio authenticity, maintain clear provenance records,
                  and move faster with confidence.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/pricing">
                    View Pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/user/signup">Get Started</Link>
                </Button>
              </div>
            </div>

            <div className="surface-panel relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-2xl border-b border-l border-primary/25" />
              <img src="/shortIcon.png" alt="Fusion Icon" className="fusion-logo-lockup h-11 w-11 rounded-xl" />
              <h2 className="mt-5 text-2xl font-semibold text-foreground">Verification Snapshot</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Minimal setup, strong trust signals, and reliable records for audit-ready workflows.
              </p>

              <div className="mt-6 space-y-3">
                {["Hash integrity confirmation", "Metadata consistency checks", "Downloadable verification report"].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/55 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="solutions" className="space-y-5">
            <div>
              <Badge className="mb-3">Solutions</Badge>
              <h2 className="text-3xl font-semibold text-foreground">Built for practical verification work</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
            {valueCards.map((card) => (
              <div key={card.title} className="surface-panel p-6">
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
              </div>
            ))}
            </div>
          </section>

          <section id="how-it-works" className="surface-panel p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">How It Works</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-border/80 bg-secondary/55 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Step {index + 1}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="features" className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge className="mb-3">Features</Badge>
                <h2 className="text-3xl font-semibold text-foreground">Core capabilities at a glance</h2>
                <p className="mt-2 text-sm text-muted-foreground">A focused stack for trust, verification, and operations.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel p-6">
                <h3 className="text-xl font-semibold text-foreground">Verification Engine</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Metadata checks, integrity confirmation, and consistent report generation.
                </p>
              </div>
              <div className="surface-panel p-6">
                <h3 className="text-xl font-semibold text-foreground">Role-Based Access</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Separate user and enterprise workflows with governed access controls.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge className="mb-3">Pricing</Badge>
                <h2 className="text-3xl font-semibold text-foreground">Simple plan paths</h2>
                <p className="mt-2 text-sm text-muted-foreground">Choose the track that matches your usage model.</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/pricing">Compare All Pricing</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">Individual</h3>
                <p className="mt-1 text-sm text-muted-foreground">For creators and independent professionals.</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">$9<span className="text-base text-muted-foreground"> / month start</span></p>
                <Button asChild variant="hero" className="mt-5 w-full">
                  <Link to="/user/pricing">View Individual Plans</Link>
                </Button>
              </div>

              <div className="surface-panel p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">Enterprise</h3>
                <p className="mt-1 text-sm text-muted-foreground">For teams and platform-scale operations.</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">$99<span className="text-base text-muted-foreground"> / month start</span></p>
                <Button asChild variant="hero" className="mt-5 w-full">
                  <Link to="/business/pricing">View Enterprise Plans</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="surface-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Ready to start?</h2>
                <p className="mt-2 text-sm text-muted-foreground">Set up your workflow and begin verification in a few minutes.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero">
                  <Link to="/user/signup">
                    Get Started
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact">Talk to Team</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
