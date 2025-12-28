import SectionBadge from "./SectionBadge";
import { Lock, Zap, Globe2, Layers, Code, Eye } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Lock,
    title: "Protocol-First",
    description: "Not a SaaS you upload to—an open protocol others build on. Infrastructure-grade, designed for scale.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Verify anywhere, anytime. No need to contact the original platform. Proof is portable.",
  },
  {
    icon: Globe2,
    title: "Platform-Scale",
    description: "Designed for billions of daily uploads. Lightweight, efficient embedding with minimal latency.",
  },
  {
    icon: Layers,
    title: "Decentralized",
    description: "Not dependent on Fusion's servers. Cryptographic proof lives with the audio file itself.",
  },
  {
    icon: Code,
    title: "Research-Driven",
    description: "Built on cryptographic primitives, not heuristics. Peer-reviewable standards and proofs.",
  },
  {
    icon: Eye,
    title: "Confidence Scores",
    description: "Audit logs for compliance. Moderation-ready ratings. Platform-agnostic verification standards.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionBadge>Differentiators</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-6 mb-6">
            <span className="text-foreground/60">Why</span>{" "}
            <span className="gradient-text">Fusion</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Built with cryptographic provenance primitives for platform-scale verification
          </p>
        </motion.div>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative"
            >
              <div className="relative h-full p-7 rounded-2xl glass hover:bg-card/80 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-card" />
                
                <motion.div 
                  className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:border-primary/40 transition-colors"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </motion.div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;