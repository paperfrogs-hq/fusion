import SectionBadge from "./SectionBadge";
import { FileKey, Search, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
const steps = [{
  number: "01",
  icon: FileKey,
  title: "Embed",
  description: "Cryptographic proof is embedded at creation time—origin, timestamp, and creator identity sealed into the audio file.",
  gradient: "from-primary to-accent"
}, {
  number: "02",
  icon: Search,
  title: "Verify",
  description: "Any platform can verify anywhere, anytime. No central authority needed—proof is portable and decentralized.",
  gradient: "from-accent to-glow-tertiary"
}, {
  number: "03",
  icon: CheckCircle,
  title: "Trust",
  description: "Confidence scores and audit logs enable compliance, moderation, and platform-wide authenticity standards.",
  gradient: "from-glow-tertiary to-primary"
}];
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};
const HowItWorksSection = () => {
  return <section id="how-it-works" className="py-16 sm:py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-mesh" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div className="text-center mb-20" initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }}>
          <SectionBadge>Process</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-6 mb-6">
            <span className="text-foreground/60">How</span>{" "}
            <span className="gradient-text">Fusion</span>{" "}
            <span className="text-foreground/60">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to cryptographic audio provenance
          </p>
        </motion.div>

        <motion.div className="grid md:grid-cols-3 gap-6 lg:gap-8" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
        once: true,
        margin: "-100px"
      }}>
          {steps.map((step, index) => <motion.div key={step.number} variants={itemVariants} className="group relative">
              <div className="relative h-full p-8 lg:p-10 rounded-3xl glass hover:bg-card/80 transition-all duration-500 overflow-hidden">
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border mb-8" whileHover={{
              scale: 1.05
            }}>
                  <span className="text-sm font-mono font-semibold gradient-text">{step.number}</span>
                </motion.div>

                <motion.div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} p-[1px] mb-8`} whileHover={{
              scale: 1.1,
              rotate: 5
            }} transition={{
              type: "spring",
              stiffness: 300
            }}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                </motion.div>

                <h3 className="font-display text-2xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>


                {index < steps.length - 1 && <div className="hidden md:flex absolute top-1/2 -right-4 lg:-right-5 z-20">
                    
                  </div>}
              </div>
            </motion.div>)}
        </motion.div>
      </div>
    </section>;
};
export default HowItWorksSection;