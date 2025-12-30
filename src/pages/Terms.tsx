import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "@/components/SectionBadge";
import { useNavigate } from "react-router-dom";

const Terms = () => {
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
          <h1 className="text-xl font-bold text-foreground">Terms of Service</h1>
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
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Effective Date: January 1, 2025
              </p>
            </div>

            {/* Terms of Service Content */}
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">1. Agreement to Terms</h2>
                <p>
                  These Terms of Service ("Terms") constitute a legal agreement between you and Paperfrogs HQ and Paperfrogs Labs (collectively, "Company," "we," "us," "our"). By accessing and using this website and services, you agree to be bound by these Terms. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">2. Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on Fusion for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Modifying or copying the materials</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Using the materials for any commercial purpose or for any public display</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Attempting to decompile or reverse engineer any software contained on the Site</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Removing any copyright or other proprietary notations from the materials</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Transferring the materials to another person or "mirroring" the materials on any other server</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">3. Disclaimer</h2>
                <p>
                  The materials on Fusion are provided on an 'as is' basis. The Company makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">4. Limitations</h2>
                <p>
                  In no event shall the Company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Fusion, even if Company or authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">5. Accuracy of Materials</h2>
                <p>
                  The materials appearing on Fusion could include technical, typographical, or photographic errors. The Company does not warrant that any of the materials on its website are accurate, complete, or current. The Company may make changes to the materials contained on its website at any time without notice.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">6. Links</h2>
                <p>
                  The Company has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by the Company of the site. Use of any such linked website is at the user's own risk.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">7. Modifications</h2>
                <p>
                  The Company may revise these Terms of Service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">8. Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Paperfrogs HQ is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">9. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at: <strong>hello@paperfrogs.dev</strong>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
