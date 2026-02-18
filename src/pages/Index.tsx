import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SolutionsSection from "@/components/SolutionsSection";
import FeaturesSection from "@/components/FeaturesSection";
import DeploymentSection from "@/components/DeploymentSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -left-20 top-16 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] sm:-left-24 sm:top-20 sm:h-[420px] sm:w-[420px] sm:blur-[140px]" />
        <div className="absolute -right-16 bottom-16 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[110px] sm:-right-24 sm:bottom-24 sm:h-[380px] sm:w-[380px] sm:blur-[130px]" />
      </div>
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <SolutionsSection />
        <FeaturesSection />
        <DeploymentSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
