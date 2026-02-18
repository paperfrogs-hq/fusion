import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClientSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    organizationName: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });

  // Store plan if passed via URL for redirect after login
  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    if (plan) {
      localStorage.setItem('fusion_client_pending_plan', plan);
      localStorage.setItem('fusion_client_pending_billing', billing || 'monthly');
    }
  }, [searchParams]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.acceptedTerms) {
      setError('You must accept the terms and privacy policy');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/client-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="absolute inset-0 bg-animated-grid opacity-15" />
          <div className="absolute left-[14%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <Header />
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-8 pt-28 sm:pt-32">
          <section className="surface-panel noise w-full max-w-xl p-8 text-center sm:p-10">
            <Clock className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-6 text-3xl font-semibold text-foreground">Application Submitted!</h1>
            <p className="mt-3 text-sm text-muted-foreground">
                Thank you for applying for a Fusion business account.
            </p>
            <div className="mt-6 rounded-xl border border-border/80 bg-secondary/60 p-4">
              <p className="text-sm text-muted-foreground">
                Our team will review your application and get back to you within <strong>1-2 business days</strong>.
              </p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You will receive an email notification once your account is approved and ready to use.
            </p>
            <Button variant="outline" className="mt-6 h-11 w-full" onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[14%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[8%] h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Header />
      <main className="relative z-10 flex-1 px-4 pb-8 pt-28 sm:pt-32">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-panel noise relative hidden overflow-hidden p-10 lg:block">
            <div className="relative z-10">
              <Badge className="mb-5">Enterprise Signup</Badge>
              <img 
                src="/Logo-01-transparent.png" 
                alt="Fusion Logo" 
                className="fusion-logo-lockup h-auto w-[150px]"
              />
              <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
                Launch organization-grade
                <span className="gradient-text block">audio trust operations</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground">
                Apply for Fusion enterprise access to manage teams, verification governance, and infrastructure-grade workflows.
              </p>
              <div className="mt-8 space-y-3">
                <div className="rounded-xl border border-border/80 bg-secondary/55 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Review Process</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Application approval in 1-2 business days</p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">No credit card required to apply</p>
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
                <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Client Signup</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground">Create Your Account</h2>
                <p className="mt-3 text-sm text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
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
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Work Email *</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@company.com"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Organization Name *</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="organizationName"
                      type="text"
                      required
                      value={formData.organizationName}
                      onChange={(e) => handleChange('organizationName', e.target.value)}
                      placeholder="Acme Inc"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Password *</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className="h-12 border-border/80 bg-secondary/70 pl-10 pr-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="h-12 border-border/80 bg-secondary/70 pl-10 pr-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 rounded-lg border border-border/70 bg-secondary/40 p-3">
                  <Checkbox
                    id="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onCheckedChange={(checked) => handleChange('acceptedTerms', checked as boolean)}
                  />
                  <label
                    htmlFor="acceptedTerms"
                    className="text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full"
                  size="lg"
                  variant="hero"
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
                  <Link to="/client/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
