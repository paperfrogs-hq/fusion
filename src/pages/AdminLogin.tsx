import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Key, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveSession } from "@/lib/admin-auth";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if email is @paperfrogs.dev
    if (!email.endsWith("@paperfrogs.dev")) {
      toast({
        title: "Unauthorized Email",
        description: "Only @paperfrogs.dev email addresses are allowed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/send-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("code");
        toast({
          title: "Code Sent",
          description: "Check your email for the verification code.",
        });
      } else {
        throw new Error(data.error || "Failed to send code");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/verify-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin session using new auth system
        saveSession({
          token: data.token,
          admin: data.admin,
          expiresAt: data.expiresAt
        });
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.admin.email}`,
        });
        
        navigate("/admin/dashboard");
      } else {
        throw new Error(data.error || "Invalid code");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-animated-grid opacity-20" />
        <div className="absolute -top-20 left-[14%] h-80 w-80 rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute -bottom-24 right-[10%] h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="surface-panel noise relative hidden overflow-hidden p-8 lg:block xl:p-10"
          >
            <div className="relative z-10">
              <Badge className="mb-5">Admin Control Plane</Badge>
              <img 
                src="/Logo-01-transparent.png" 
                alt="Fusion Logo" 
                className="fusion-logo-lockup h-auto w-[150px]"
              />
              <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
                Security-first access for
                <span className="gradient-text block">Fusion operators</span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-muted-foreground">
                Verify admin identity with paperfrogs.dev email and one-time code. Every session is access-controlled and auditable.
              </p>

              <div className="mt-8 grid gap-3">
                <div className="rounded-2xl border border-border/90 bg-secondary/60 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Environment</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Production admin workspace</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Role-scoped authentication</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Only authorized `@paperfrogs.dev` admins can proceed.</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="surface-panel noise relative overflow-hidden p-6 sm:p-8 lg:p-9"
          >
            <div className="relative z-10 mb-8">
              <img 
                src="/Logo-01-transparent.png" 
                alt="Fusion Logo" 
                className="fusion-logo-lockup h-auto w-[150px]"
              />
              <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Admin Authentication</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-foreground">Sign in to dashboard</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {step === "email"
                  ? "Enter your work email to request a secure verification code."
                  : "Use the verification code sent to your inbox to complete login."}
              </p>
            </div>

            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@paperfrogs.dev"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Only `@paperfrogs.dev` emails are authorized.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="h-12 w-full text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Code..." : "Send Verification Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCodeSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="h-12 border-border/80 bg-secondary/70 pl-10 text-center text-2xl tracking-[0.24em]"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Check your inbox for the one-time verification code.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12"
                    onClick={() => setStep("email")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-7 border-t border-border/80 pt-5">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
