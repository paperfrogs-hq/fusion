import { motion } from "framer-motion";
import { ArrowLeft, Building2, Clock3, Globe, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionBadge from "@/components/SectionBadge";
import { Badge } from "@/components/ui/badge";
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
          message: data.message || "Message sent successfully!",
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

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -left-16 top-24 h-[320px] w-[320px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-16 bottom-24 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 pb-20 pt-32 sm:pt-36">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10 sm:space-y-12"
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
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Contact Fusion Support
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Have a question or feedback? Reach out to the Fusion team and we will follow up as quickly as possible.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-5">
                <Card className="surface-panel p-6 sm:p-7">
                  <h2 className="text-xl font-semibold text-foreground">Direct Channels</h2>
                  <div className="mt-5 space-y-5">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 rounded-lg border border-border bg-secondary p-2.5 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                        <a
                          href="mailto:fusion@paperfrogs.dev"
                          className="mt-1 block text-sm text-foreground transition-colors hover:text-primary sm:text-base"
                        >
                          fusion@paperfrogs.dev
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 rounded-lg border border-border bg-secondary p-2.5 text-primary">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Website</p>
                        <a
                          href="https://fusion.paperfrogs.dev"
                          className="mt-1 block text-sm text-foreground transition-colors hover:text-primary sm:text-base"
                          target="_blank"
                          rel="noreferrer"
                        >
                          fusion.paperfrogs.dev
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="surface-panel p-6 sm:p-7">
                  <h3 className="text-lg font-semibold text-foreground">Support Profile</h3>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <span className="text-sm sm:text-base">Typical response within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm sm:text-base">Handled by Paperfrogs Labs team</span>
                    </div>
                    <Badge className="w-fit">Audio-Provenance Support</Badge>
                  </div>
                </Card>
              </div>

              <Card className="surface-panel lg:col-span-7">
                <div className="border-b border-border/80 p-6 sm:p-8">
                  <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Send us a Message</h2>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    All fields are required.
                  </p>
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
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Full Name
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Email Address
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Subject
                      </label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What's this about?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="resize-none"
                        placeholder="Your message..."
                      />
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            <Card className="surface-panel p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">About Paperfrogs</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Paperfrogs HQ and Paperfrogs Labs are dedicated to building innovative solutions for audio provenance
                and verification in the AI era. Fusion is our flagship product, designed to embed cryptographically
                verifiable proof of audio origin at creation time.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                We are focused on building trust infrastructure across platforms and ecosystems. Whether you have
                questions about Fusion, want to collaborate, or need implementation support, we would love to hear
                from you.
              </p>
            </Card>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
