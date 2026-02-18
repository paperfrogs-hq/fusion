import { Building2, ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -left-20 top-24 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] sm:h-[380px] sm:w-[380px]" />
        <div className="absolute -right-20 bottom-20 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[120px] sm:h-[340px] sm:w-[340px]" />
      </div>

      <Header />

      <main className="relative z-10 px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">Pricing</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Choose Your Fusion Plan
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Select the path that matches your workflow, then view full plan details and start your trial.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="surface-panel p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                <User className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-foreground">Individual Pricing</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                For creators, artists, podcasters, and independent professionals protecting audio authenticity.
              </p>
              <Button className="mt-6 w-full sm:w-auto" variant="hero" onClick={() => navigate("/user/pricing")}>
                View Individual Plans
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>

            <Card className="surface-panel p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-foreground">Enterprise Pricing</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                For teams and platforms requiring API-first verification, role-based governance, and SLA-backed operations.
              </p>
              <Button className="mt-6 w-full sm:w-auto" variant="hero" onClick={() => navigate("/business/pricing")}>
                View Enterprise Plans
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
