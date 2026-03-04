import { ArrowRight, Building2, CheckCircle2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const navigate = useNavigate();

  const tracks = [
    {
      id: "individual",
      icon: User,
      label: "Individual",
      title: "For creators and independent professionals",
      startPrice: "$9",
      period: "/month start",
      bullets: [
        "Creator and professional plan tiers",
        "Verification workflow and downloadable reports",
        "Checkout and onboarding in minutes",
      ],
      action: "View Individual Plans",
      onClick: () => navigate("/user/pricing"),
    },
    {
      id: "enterprise",
      icon: Building2,
      label: "Enterprise",
      title: "For teams, platforms, and organizations",
      startPrice: "$99",
      period: "/month start",
      bullets: [
        "Team access with organization management",
        "High-volume verification usage",
        "Governance-friendly operational structure",
      ],
      action: "View Enterprise Plans",
      onClick: () => navigate("/business/pricing"),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute -left-20 top-24 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] sm:h-[380px] sm:w-[380px]" />
        <div className="absolute -right-20 bottom-20 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px] sm:h-[340px] sm:w-[340px]" />
      </div>

      <Header />

      <main className="relative z-10 px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">Pricing</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Choose the right pricing track
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pick individual or enterprise based on how you operate. Then open full plan details and continue to checkout.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <section key={track.id} className="surface-panel relative overflow-hidden p-6 sm:p-8">
                  <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-2xl border-b border-l border-primary/20" />
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{track.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{track.title}</h2>
                  <p className="mt-4 text-3xl font-semibold text-foreground">
                    {track.startPrice}
                    <span className="text-base font-normal text-muted-foreground"> {track.period}</span>
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {track.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">{bullet}</p>
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6 w-full" variant="hero" onClick={track.onClick}>
                    {track.action}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </section>
              );
            })}
          </div>

          <section className="surface-panel mt-7 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-foreground">Need detailed plan matrix?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Open dedicated pricing pages for full feature-by-feature breakdown, billing options, and direct checkout paths.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/user/pricing")}>
                Individual Matrix
              </Button>
              <Button variant="outline" onClick={() => navigate("/business/pricing")}>
                Enterprise Matrix
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
