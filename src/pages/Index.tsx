import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SolutionsSection from "@/components/SolutionsSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import WaitlistSection from "@/components/WaitlistSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -left-24 top-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute -right-24 bottom-24 h-[380px] w-[380px] rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <SolutionsSection />
        <FeaturesSection />
        <PricingSection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
