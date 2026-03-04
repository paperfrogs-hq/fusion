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
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is in the approved admin domain
    if (!normalizedEmail.endsWith("@paperfrogs.dev")) {
      toast({
        title: "Unauthorized Email",
        description: "This email is not permitted for admin access.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/send-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail(normalizedEmail);
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
    const normalizedEmail = email.trim().toLowerCase();
    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/verify-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, code }),
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
        <div className="absolute inset-0 bg-animated-grid opacity-[0.12]" />
        <div className="absolute inset-0 bg-radial-gradient opacity-70" />
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-[36px] border border-primary/20 bg-primary/10 blur-[2px]" />
        <div className="absolute right-[-120px] bottom-[-120px] h-[420px] w-[420px] rounded-[44px] border border-primary/20 bg-accent/10 blur-[2px]" />
        <div className="absolute left-1/2 top-[-160px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/12 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/shortIcon.png" alt="Fusion Logo" className="fusion-logo-lockup h-10 w-10 rounded-xl" />
              <div className="rounded-md border border-border/80 bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                ADMIN SIGN-IN
              </div>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </a>
          </header>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.section
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="surface-panel relative overflow-hidden p-7 sm:p-8"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-primary/25" />
              <Badge className="mb-5">Admin Workspace</Badge>
              <h1 className="text-3xl font-semibold leading-[1.03] text-foreground sm:text-4xl">
                Fusion admin
                <span className="gradient-text mt-1 block">portal access</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Sign in to access administrator tools and account management features.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/55 p-3.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Account</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Use your assigned admin email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-secondary/55 p-3.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Access</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Protected session handling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Verification</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Additional sign-in confirmation</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border/80 bg-black/25 px-4 py-3 font-mono text-xs text-muted-foreground">
                <p className="uppercase tracking-[0.12em]">Security Notice</p>
                <p className="mt-1 text-foreground/80">Administrator access is monitored and protected.</p>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="surface-panel relative overflow-hidden p-6 sm:p-8"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 border-b border-l border-primary/25 rounded-bl-2xl" />

              <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Administrator Authentication</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  {step === "email" ? "Start sign-in" : "Enter verification code"}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-secondary/55 p-1">
                  <div
                    className={`rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors ${
                      step === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Step 1: Email
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors ${
                      step === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Step 2: Verify
                  </div>
                </div>
              </div>

              {step === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your administrator email"
                        autoComplete="email"
                        className="h-11 border-border/80 bg-secondary/65 pl-10"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Use your approved administrator email address.</p>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="h-11 w-full text-sm" disabled={isLoading}>
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Verification Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 6-digit code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="h-11 border-border/80 bg-secondary/65 pl-10 text-center text-xl tracking-[0.22em]"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Code sent to <span className="text-foreground">{email}</span>.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button type="button" variant="outline" size="lg" className="h-11" onClick={() => setStep("email")}>
                      Back
                    </Button>
                    <Button type="submit" variant="hero" size="lg" className="h-11" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify & Login"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
