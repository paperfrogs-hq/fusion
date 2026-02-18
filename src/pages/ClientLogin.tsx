import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
    totpCode: ''
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deviceId = localStorage.getItem('fusion_device_id') || 
        crypto.randomUUID();
      localStorage.setItem('fusion_device_id', deviceId);

      const response = await fetch('/.netlify/functions/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberDevice: formData.rememberDevice,
          deviceId,
          totpCode: show2FA ? formData.totpCode : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requires2FA) {
          // 2FA is enabled, show 2FA input
          setShow2FA(true);
          setError('');
        } else {
          throw new Error(data.error || 'Login failed');
        }
        setLoading(false);
        return;
      }

      // Store session
      localStorage.setItem('fusion_client_token', data.sessionToken);
      localStorage.setItem('fusion_client_user', JSON.stringify(data.user));
      localStorage.setItem('fusion_client_orgs', JSON.stringify(data.organizations));

      // If user belongs to multiple orgs, show org selector
      if (data.organizations.length > 1) {
        navigate('/client/select-org');
      } else if (data.organizations.length === 1) {
        localStorage.setItem('fusion_current_org', JSON.stringify(data.organizations[0]));
        localStorage.setItem('fusion_org_id', data.organizations[0].id);
        localStorage.setItem('fusion_org_name', data.organizations[0].name);
        
        // Check if there's a pending plan to subscribe to
        const pendingPlan = localStorage.getItem('fusion_client_pending_plan');
        const pendingBilling = localStorage.getItem('fusion_client_pending_billing') || 'monthly';
        
        if (pendingPlan) {
          // Clear pending plan
          localStorage.removeItem('fusion_client_pending_plan');
          localStorage.removeItem('fusion_client_pending_billing');
          // Redirect to checkout
          navigate(`/client/checkout?plan=${pendingPlan}&billing=${pendingBilling}`);
        } else {
          navigate('/client/dashboard');
        }
      } else {
        throw new Error('No organization access');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[14%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[8%] h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 pt-28 sm:pt-32">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-panel noise relative hidden overflow-hidden p-10 lg:block">
            <div className="relative z-10">
              <Badge className="mb-5">Enterprise Access</Badge>
              <img 
                src="/Logo-01-transparent.png" 
                alt="Fusion Logo" 
                className="fusion-logo-lockup h-auto w-[150px]"
              />
              <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
                Enterprise workspace for
                <span className="gradient-text block">secure verification</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground">
                Sign in to manage organizations, teams, billing, and high-trust audio provenance operations.
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-xl border border-border/80 bg-secondary/55 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Authentication</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Password + optional 2FA</p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">Role-based access per organization</p>
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
                <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Client Login</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground">Welcome Back</h2>
                <p className="mt-3 text-sm text-muted-foreground">Sign in to your Fusion enterprise account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {show2FA && (
                  <Alert>
                    <AlertDescription>
                      Two-factor authentication is enabled. Please enter your 6-digit code.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      disabled={show2FA}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@company.com"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Password</Label>
                    <Link 
                      to="/client/forgot-password" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      disabled={show2FA}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 border-border/80 bg-secondary/70 pl-10"
                    />
                  </div>
                </div>

                {show2FA && (
                  <div className="space-y-2">
                    <Label htmlFor="totpCode" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">2FA Code</Label>
                    <div className="relative">
                      <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="totpCode"
                        type="text"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={formData.totpCode}
                        onChange={(e) => handleChange('totpCode', e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="h-12 border-border/80 bg-secondary/70 pl-10 text-center text-2xl tracking-[0.24em]"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {!show2FA && (
                  <div className="flex items-center space-x-2 rounded-lg border border-border/70 bg-secondary/40 p-3">
                    <Checkbox
                      id="rememberDevice"
                      checked={formData.rememberDevice}
                      onCheckedChange={(checked) => handleChange('rememberDevice', checked as boolean)}
                    />
                    <label
                      htmlFor="rememberDevice"
                      className="text-sm leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember this device for 30 days
                    </label>
                  </div>
                )}

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
                      {show2FA ? 'Verifying...' : 'Signing In...'}
                    </>
                  ) : (
                    show2FA ? 'Verify & Sign In' : 'Sign In'
                  )}
                </Button>

                {show2FA && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => {
                      setShow2FA(false);
                      setFormData({ ...formData, totpCode: '' });
                    }}
                  >
                    Back to Login
                  </Button>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/client/signup" className="text-primary hover:underline font-medium">
                    Create one
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
