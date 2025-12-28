import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionBadge from "./SectionBadge";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
    setEmail("");
    
    toast({
      title: "You're on the list!",
      description: "We'll notify you when Fusion launches.",
    });
  };

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        className="container mx-auto px-6 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="relative p-10 md:p-14 rounded-3xl glass-strong text-center overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-accent/30 opacity-30" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <SectionBadge>
                  <Sparkles className="w-3.5 h-3.5" />
                  Early Access
                </SectionBadge>
              </motion.div>
              
              <motion.h2 
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-8 mb-6"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-foreground/60">Join the</span>{" "}
                <span className="gradient-text">Waitlist</span>
              </motion.h2>
              
              <motion.p 
                className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Be the first to know when Fusion launches. Get early access to the trust layer for audio in the AI era.
              </motion.p>

              <motion.form 
                onSubmit={handleSubmit} 
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 px-5 bg-background/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground rounded-xl"
                    disabled={isLoading || isSubmitted}
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="h-14 rounded-xl"
                  disabled={isLoading || isSubmitted}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <Check className="w-5 h-5" />
                      Joined!
                    </>
                  ) : (
                    <>
                      Get Access
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.form>

              <motion.p 
                className="text-xs text-muted-foreground mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                No spam, ever. We respect your privacy.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default WaitlistSection;