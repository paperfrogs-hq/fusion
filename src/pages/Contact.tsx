import { motion } from "framer-motion";
import { ArrowLeft, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/SectionBadge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </span>
          </button>
          <h1 className="text-xl font-bold text-foreground">Contact Us</h1>
          <div className="w-20" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            {/* Title Section */}
            <div className="space-y-6">
              <SectionBadge>Get in Touch</SectionBadge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Contact Fusion Support
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Have a question or feedback? We'd love to hear from you. Reach out to the Fusion team.
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                className="space-y-4 bg-card/50 p-6 rounded-lg border border-border/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Email</h3>
                    <a href="mailto:hello@paperfrogs.dev" className="text-muted-foreground hover:text-primary transition-colors">
                      fusion@paperfrogs.dev
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-4 bg-card/50 p-6 rounded-lg border border-border/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Website</h3>
                    <a href="https://fusion.paperfrogs.dev" className="text-muted-foreground hover:text-primary transition-colors">
                      fusion.paperfrogs.dev
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="space-y-6 bg-card/50 p-8 rounded-lg border border-border/50">
              <h2 className="text-3xl font-bold text-foreground">Send us a Message</h2>

              {submitStatus && (
                <motion.div
                  className={`p-4 rounded-lg ${submitStatus.type === "success"
                      ? "bg-green-500/10 border border-green-500/50 text-green-600"
                      : "bg-red-500/10 border border-red-500/50 text-red-600"
                    }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {submitStatus.message}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Your message..."
                  />
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </motion.div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="space-y-6 bg-card/50 p-8 rounded-lg border border-border/50">
              <h2 className="text-3xl font-bold text-foreground">About Paperfrogs</h2>
              <p className="text-muted-foreground leading-relaxed">
                Paperfrogs HQ and Paperfrogs Labs are dedicated to building innovative solutions for audio provenance and verification in the AI era. Fusion is our flagship product, designed to embed cryptographically verifiable proof of audio origin at creation time.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We're passionate about creating trust infrastructure that works across platforms and ecosystems. Whether you have questions about Fusion, want to collaborate, or just want to chat, we'd love to hear from you.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
