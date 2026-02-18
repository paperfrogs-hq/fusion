import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionBadge from "./SectionBadge";
import { useToast } from "@/hooks/use-toast";
import { addEmailToWaitlist } from "@/lib/supabase-client";
import { Section } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";

const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      await addEmailToWaitlist(email);
      setIsSubmitted(true);
      setEmail("");

      toast({
        title: "You're on the list!",
        description: "Check your email for a confirmation message from Fusion.",
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (error: unknown) {
      console.error("Error subscribing to waitlist:", error);

      if (error instanceof Error && error.message?.includes("duplicate")) {
        toast({
          title: "Already on the list",
          description: "This email is already registered for early access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again or contact us.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section id="waitlist-section" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px] animate-pulse-glow" />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-5xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <Panel className="mx-auto max-w-4xl p-8 text-center sm:p-12">
          <SectionBadge>Early Access</SectionBadge>

          <h2 className="mt-7 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Join the Waitlist</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Be the first to access Fusion. Get launch updates and early onboarding to the Audio-Provenance Engine.
          </p>

          <motion.form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              disabled={isLoading || isSubmitted}
            />
            <Button
              type="submit"
              variant="hero"
              className="h-12 px-6"
              disabled={isLoading || isSubmitted}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : isSubmitted ? (
                <>
                  <Check className="h-4 w-4" />
                  Joined
                </>
              ) : (
                <>
                  Get Access
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>

          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">No spam. Privacy-respecting updates only.</p>
        </Panel>
      </motion.div>
    </Section>
  );
};

export default WaitlistSection;
