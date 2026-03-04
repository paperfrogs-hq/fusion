import { motion } from "framer-motion";
import { ArrowLeft, Clock3, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionBadge from "@/components/SectionBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Container } from "@/components/ui/container";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/.netlify/functions/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || "Message sent successfully.",
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applySubject = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute -left-16 top-24 h-[320px] w-[320px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-16 bottom-24 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 pb-20 pt-32 sm:pt-36">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <button
                onClick={() => navigate("/")}
                className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </button>

              <SectionBadge>Contact</SectionBadge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                Contact the Fusion team
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Send your question, support request, or integration inquiry. We reply with clear next steps.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-6">
                <Card className="surface-panel p-6">
                  <img src="/shortIcon.png" alt="Fusion Icon" className="fusion-logo-lockup h-10 w-10 rounded-xl" />
                  <h2 className="mt-4 text-xl font-semibold text-foreground">Support channels</h2>

                  <div className="mt-5 space-y-4">
                    <a
                      href="mailto:fusion@paperfrogs.dev"
                      className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/55 p-3 transition-colors hover:border-primary/30"
                    >
                      <Mail className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                        <p className="mt-1 text-sm text-foreground">fusion@paperfrogs.dev</p>
                      </div>
                    </a>

                    <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/55 p-3">
                      <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Response</p>
                        <p className="mt-1 text-sm text-foreground">Typically within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/55 p-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Coverage</p>
                        <p className="mt-1 text-sm text-foreground">Product, billing, technical and enterprise support</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="surface-panel p-6">
                  <h3 className="text-lg font-semibold text-foreground">Quick topics</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Tap a topic to prefill the subject line.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Product Support", "Billing", "Enterprise Inquiry", "API Integration"].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => applySubject(topic)}
                        className="rounded-lg border border-border/80 bg-secondary/55 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="surface-panel relative overflow-hidden">
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-2xl border-b border-l border-primary/25" />

                <div className="border-b border-border/80 p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Contact Form
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">Send message</h2>
                </div>

                <div className="p-6 sm:p-8">
                  {submitStatus && (
                    <motion.div
                      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                        submitStatus.type === "success"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-destructive/40 bg-destructive/10 text-red-300"
                      }`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {submitStatus.message}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your name"
                          className="h-11 border-border/80 bg-secondary/65"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="you@example.com"
                          className="h-11 border-border/80 bg-secondary/65"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Subject
                      </label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What can we help with?"
                        className="h-11 border-border/80 bg-secondary/65"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={7}
                        className="resize-none border-border/80 bg-secondary/65"
                        placeholder="Describe your request with as much context as possible."
                      />
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
