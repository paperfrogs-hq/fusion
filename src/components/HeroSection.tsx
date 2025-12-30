import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import AudioWaveform from "./AudioWaveform";
import { ArrowRight, Shield, Zap, Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleJoinWaitlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const waitlistSection = document.getElementById("waitlist-section");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleReadWhitepaper = () => {
    navigate("/whitepaper");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 md:w-96 lg:w-[500px] h-48 sm:h-64 md:h-96 lg:h-[500px] bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-40 sm:w-56 md:w-80 lg:w-[400px] h-40 sm:h-56 md:h-80 lg:h-[400px] bg-accent/20 rounded-full blur-[80px] sm:blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-44 sm:w-64 md:w-96 lg:w-[450px] h-44 sm:h-64 md:h-96 lg:h-[450px] bg-glow-tertiary/15 rounded-full blur-[80px] sm:blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: 'clamp(40px, 10vw, 60px) clamp(40px, 10vw, 60px)',
        }}
      />
      
      <div className="container mx-auto px-3 sm:px-6 relative z-10 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionBadge>
              <Sparkles className="w-3.5 h-3.5" />
              Cryptographic Audio Provenance
            </SectionBadge>
          </motion.div>

          <motion.div 
            className="my-6 sm:my-10 w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AudioWaveform />
          </motion.div>

          <motion.h1 
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6 sm:mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-foreground/60">The Trust Layer for</span>
            <br />
            <span className="gradient-text">Audio</span>
            <span className="text-foreground/60"> in the AI Era</span>
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Embed immutable proof of audio origin at creation time. 
            Verify authenticity anywhere, instantly.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-20 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button variant="hero" size="lg" className="group w-full sm:w-auto" onClick={handleJoinWaitlist}>
              Join the Waitlist
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="lg" className="w-full sm:w-auto" onClick={handleReadWhitepaper} type="button">
              Read the Whitepaper
            </Button>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 sm:gap-6 lg:gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {[
              { icon: Shield, label: "Cryptographically Secure" },
              { icon: Zap, label: "Instant Verification" },
              { icon: Globe, label: "Platform-Scale Ready" },
            ].map((item, index) => (
              <motion.div 
                key={item.label}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass text-xs sm:text-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-foreground/80 hidden sm:inline">{item.label}</span>
                <span className="text-foreground/80 sm:hidden">{item.label.split(' ')[0]}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
};

export default HeroSection;