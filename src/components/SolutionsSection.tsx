import SectionBadge from "./SectionBadge";
import { Building2, Mic2, Bot, Shield, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const solutions = [
  {
    icon: Building2,
    title: "For Platforms",
    subtitle: "Spotify, TikTok, YouTube, Discord",
    description: "Scale audio moderation, reduce deepfakes, and build user trust. Meet compliance requirements with auditable verification.",
    highlight: "Reduce deepfakes by 90%",
    gradient: "from-primary via-primary/50 to-transparent",
  },
  {
    icon: Mic2,
    title: "For Creators",
    subtitle: "Musicians, Podcasters, Voice Actors",
    description: "Prove you created it. Fight deepfakes of your voice. Protect your IP and monetize your authenticity.",
    highlight: "Own your authenticity",
    gradient: "from-accent via-accent/50 to-transparent",
  },
  {
    icon: Bot,
    title: "For AI Companies",
    subtitle: "ElevenLabs, Suno, OpenAI",
    description: "Embed provenance in your outputs. Build responsibly, prove authenticity, and gain platform trust.",
    highlight: "Build responsibly",
    gradient: "from-glow-tertiary via-glow-tertiary/50 to-transparent",
  },
  {
    icon: Shield,
    title: "For Compliance",
    subtitle: "Trust & Safety, Legal, Regulators",
    description: "Automated verification with audit trails. Scalable, platform-agnostic compliance documentation.",
    highlight: "Scalable & auditable",
    gradient: "from-primary via-accent/50 to-transparent",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const SolutionsSection = () => {
  return (
    <section id="solutions" className="py-32 relative">
      <div className="absolute inset-0 bg-radial-bottom" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionBadge>Solutions</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-6 mb-6">
            <span className="text-foreground/60">Built for</span>{" "}
            <span className="gradient-text">Everyone</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Whether you're a platform, creator, AI company, or compliance team—Fusion has you covered.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative h-full p-8 lg:p-10 rounded-3xl glass hover:bg-card/80 transition-all duration-500 overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${solution.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="flex items-start gap-6">
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <solution.icon className="w-6 h-6 text-primary" />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-xl lg:text-2xl font-bold text-foreground">
                          {solution.title}
                        </h3>
                        <p className="text-sm text-primary/80 mt-1">
                          {solution.subtitle}
                        </p>
                      </div>
                      <motion.div 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.2 }}
                      >
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      </motion.div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                      {solution.description}
                    </p>
                    
                    <motion.div 
                      className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-sm font-medium gradient-text">
                        {solution.highlight}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionsSection;