import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import AudioWaveform from "./AudioWaveform";
import { ArrowRight, Shield, Zap, Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const handleJoinWaitlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const waitlistSection = document.getElementById("waitlist-section");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-glow-tertiary/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
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
            className="my-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AudioWaveform />
          </motion.div>

          <motion.h1 
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-8 tracking-tight"
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
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Embed immutable proof of audio origin at creation time. 
            Verify authenticity anywhere, instantly.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button variant="hero" size="xl" className="group" onClick={handleJoinWaitlist}>
              Join the Waitlist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a href="/whitepaper">
              <Button variant="hero-outline" size="xl">
                Read the Whitepaper
              </Button>
            </a>
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
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
                className="flex items-center gap-2.5 px-4 py-2 rounded-full glass"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground/80">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
};

export default HeroSection;