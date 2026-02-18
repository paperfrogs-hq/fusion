import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Lock, Mail, User, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    userType: 'creator'
  });

  // Store plan if passed via URL for redirect after login
  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    if (plan) {
      localStorage.setItem('fusion_pending_plan', plan);
      localStorage.setItem('fusion_pending_billing', billing || 'monthly');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.fullName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/signup-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          userType: formData.userType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Signup failed';
        const detailMsg = data.details ? ` (${data.details})` : '';
        throw new Error(errorMsg + detailMsg);
      }

      setSuccess(true);
      // Don't auto-redirect, let user read the message
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="absolute inset-0 bg-animated-grid opacity-15" />
          <div className="absolute left-[14%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <Header />
        <main className="relative z-10 pb-20 pt-28 sm:pt-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <section className="surface-panel noise mx-auto max-w-xl p-8 text-center sm:p-10">
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
              <h1 className="mt-6 text-3xl font-semibold text-foreground">Check Your Email</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
              </p>
              <div className="mt-6 rounded-xl border border-border/80 bg-secondary/60 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or contact support.
                </p>
              </div>
              <Link to="/user/login" className="mt-6 block">
                <Button variant="outline" className="h-11 w-full">
                  Back to Login
                </Button>
              </Link>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[14%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Header />
      <main className="relative z-10 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="surface-panel noise relative hidden overflow-hidden p-10 lg:block">
              <div className="relative z-10">
                <Badge className="mb-5">Create Account</Badge>
                <img 
                  src="/Logo-01-transparent.png" 
                  alt="Fusion Logo" 
                  className="fusion-logo-lockup h-auto w-[150px]"
                />
                <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
                  Start secure audio
                  <span className="gradient-text block">verification now</span>
                </h1>
                <p className="mt-4 max-w-lg text-base text-muted-foreground">
                  Create your user account to access provenance workflows, cryptographic verification, and reporting.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="rounded-xl border border-border/80 bg-secondary/55 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Setup</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Account creation takes under 2 minutes</p>
                  </div>
                  <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                    <p className="text-sm font-medium text-foreground">Supports creators, artists, platforms, and developers</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="surface-panel noise relative overflow-hidden p-6 sm:p-8">
              <div className="relative z-10">
                <div className="mb-8">
                  <img 
                    src="/Logo-01-transparent.png" 
                    alt="Fusion Logo" 
                    className="fusion-logo-lockup h-auto w-[150px]"
                  />
                  <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">User Signup</p>
                  <h2 className="mt-2 text-3xl font-semibold text-foreground">Join Fusion</h2>
                  <p className="mt-3 text-sm text-muted-foreground">Create your account to start protecting your audio.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Full Name *</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="h-12 border-border/80 bg-secondary/70 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email *</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="h-12 border-border/80 bg-secondary/70 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Account Type *</Label>
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="h-12 w-full rounded-xl border border-border/80 bg-secondary/70 px-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75"
                      >
                        <option value="creator">Creator</option>
                        <option value="artist">Artist</option>
                        <option value="platform">Platform</option>
                        <option value="developer">Developer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Password *</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        className="h-12 border-border/80 bg-secondary/70 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="h-12 border-border/80 bg-secondary/70 pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="hero"
                    className="h-12 w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/user/login" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
