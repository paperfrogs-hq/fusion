import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/SectionBadge";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
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
              <SectionBadge>Legal</SectionBadge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Effective Date: January 1, 2025
              </p>
            </div>

            {/* Privacy Policy Content */}
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">1. Introduction</h2>
                <p>
                  Paperfrogs HQ and Paperfrogs Labs (collectively, "we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, including all related sites, applications, and services that link to this Privacy Policy (collectively, the "Site").
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">2. Information We Collect</h2>
                <p>
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span><strong>Personal Data:</strong> Email address when you sign up for our waitlist</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span><strong>Automatically Collected Data:</strong> Analytics data through our analytics platform (Umami)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span><strong>Device Information:</strong> IP address, browser type, and pages visited</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">3. Use of Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Send you updates about Fusion and product announcements</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Improve our Site and services</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Monitor and analyze trends, usage, and activities</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Prevent fraudulent activity and maintain security</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">4. Data Storage and Security</h2>
                <p>
                  Your data is stored securely in our database (Supabase) and email service (Resend). We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">5. Third-Party Services</h2>
                <p>
                  We use third-party services to manage our operations, including:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span><strong>Supabase:</strong> Database hosting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span><strong>Resend:</strong> Email delivery</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span><strong>Umami:</strong> Privacy-focused analytics</span>
                  </li>
                </ul>
                <p>
                  These service providers are contractually obligated to use your information only as necessary to provide services to us.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">6. Your Rights</h2>
                <p>
                  You have the right to:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Access the personal data we hold about you</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Request deletion of your personal data</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Opt-out of marketing communications</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">7. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at: <strong>hello@paperfrogs.dev</strong>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
