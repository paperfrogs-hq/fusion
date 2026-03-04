import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Building2, CheckCircle2, Eye, EyeOff, Loader2, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function WaitlistSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupType, setSignupType] = useState('client');

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });

  useEffect(() => {
    verifyInvite();
  }, [token]);

  const verifyInvite = async () => {
    if (!token) {
      setVerifyError('Invalid invitation link');
      setVerifying(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/verify-waitlist-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid invitation');
      }

      setVerified(true);
      setSignupType(data.signupType || 'client');
      setFormData((prev) => ({ ...prev, email: data.email }));
    } catch (err: any) {
      setVerifyError(err.message || 'Invalid or expired invitation');
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const endpoint = signupType === 'user' ? '/.netlify/functions/signup-user' : '/.netlify/functions/client-signup';

      const payload =
        signupType === 'user'
          ? {
              email: formData.email,
              password: formData.password,
              fullName: formData.fullName,
              fromWaitlist: true,
              inviteToken: token,
            }
          : {
              email: formData.email,
              password: formData.password,
              fullName: formData.fullName,
              organizationName: formData.organizationName || formData.fullName + "'s Organization",
              companyName: formData.organizationName || formData.fullName + "'s Organization",
              fromWaitlist: true,
              inviteToken: token,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      await fetch('/.netlify/functions/use-waitlist-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (signupType === 'user') {
        navigate('/user/login?registered=true');
      } else {
        navigate('/client/login?registered=true');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="absolute inset-0 bg-animated-grid opacity-15" />
          <div className="absolute left-[14%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <Header />
        <main className="relative z-10 flex flex-1 items-center justify-center p-4 pt-28 sm:pt-32">
          <section className="surface-panel relative w-full max-w-md overflow-hidden p-8 text-center">
            <img src="/shortIcon.png" alt="Fusion Logo" className="fusion-logo-lockup mx-auto h-11 w-11 rounded-xl" />
            <Badge className="mt-5">Invite Verification</Badge>
            <Loader2 className="mx-auto mt-6 h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Verifying your invitation...</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="absolute inset-0 bg-animated-grid opacity-15" />
          <div className="absolute right-[14%] top-24 h-72 w-72 rounded-full bg-destructive/10 blur-[120px]" />
        </div>
        <Header />
        <main className="relative z-10 flex flex-1 items-center justify-center p-4 pt-28 sm:pt-32">
          <section className="surface-panel relative w-full max-w-md overflow-hidden p-8 text-center">
            <img src="/shortIcon.png" alt="Fusion Logo" className="fusion-logo-lockup mx-auto h-11 w-11 rounded-xl" />
            <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/35 bg-destructive/15">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-foreground">Invitation unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{verifyError}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Request a fresh invite link or contact support.
            </p>
            <Link to="/" className="mt-6 block">
              <Button variant="outline" className="h-11 w-full">
                Go to Homepage
              </Button>
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[14%] top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[8%] h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Header />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-8 pt-28 sm:pt-32">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="surface-panel relative hidden overflow-hidden p-8 lg:block">
            <div className="pointer-events-none absolute -left-8 top-10 h-24 w-24 rounded-[26px] border border-primary/20 bg-primary/10 auth-orbital" />
            <div className="pointer-events-none absolute bottom-8 right-8 h-20 w-20 rounded-full border border-primary/20 auth-orbital-reverse" />

            <div className="relative z-10">
              <Badge className="mb-5">Invite-Only Access</Badge>
              <img src="/shortIcon.png" alt="Fusion Logo" className="fusion-logo-lockup h-11 w-11 rounded-xl" />
              <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground">
                Your invite unlocks
                <span className="gradient-text block">
                  {signupType === 'user' ? 'personal verification' : 'organization onboarding'}
                </span>
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Complete your account setup to continue into Fusion.
              </p>

              <div className="mt-7 space-y-3">
                <div className="rounded-xl border border-border/80 bg-secondary/55 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Account Type</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {signupType === 'user' ? 'Personal account flow' : 'Organization account flow'}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">Invitation token has been validated</p>
                </div>
              </div>
            </div>
          </section>

          <section className="surface-panel relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-2xl border-b border-l border-primary/25" />
            <div className="pointer-events-none absolute left-0 top-1/2 h-12 w-12 -translate-y-1/2 rounded-r-xl border-r border-y border-primary/20" />

            <div className="relative z-10">
              <img src="/shortIcon.png" alt="Fusion Logo" className="fusion-logo-lockup h-11 w-11 rounded-xl" />
              <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Invitation Signup</p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">Activate your account</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Set your account details to continue to the login portal.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert className="border-primary/35 bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-foreground/90">
                    {verified ? 'Invitation confirmed for' : 'Invitation linked to'} <strong>{formData.email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                    />
                  </div>
                </div>

                {signupType === 'client' && (
                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Organization Name
                    </Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        type="text"
                        autoComplete="organization"
                        value={formData.organizationName}
                        onChange={(e) => handleChange('organizationName', e.target.value)}
                        placeholder="Your Organization"
                        className="h-12 border-border/80 bg-secondary/70 pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="At least 8 characters"
                      className="h-12 border-border/80 bg-secondary/70 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      className="h-12 border-border/80 bg-secondary/70 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} variant="hero" size="lg" className="h-12 w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By creating an account, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                  and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
