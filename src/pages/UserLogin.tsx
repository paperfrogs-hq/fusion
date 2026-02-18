import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/login-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store session token and user data
      localStorage.setItem('fusion_user_token', data.sessionToken);
      localStorage.setItem('fusion_user_id', data.userId);
      localStorage.setItem('fusion_user_email', data.email);
      localStorage.setItem('fusion_user_name', data.fullName || '');

      // Check if there's a pending plan to subscribe to
      const pendingPlan = localStorage.getItem('fusion_pending_plan');
      const pendingBilling = localStorage.getItem('fusion_pending_billing') || 'monthly';
      
      if (pendingPlan) {
        // Clear pending plan
        localStorage.removeItem('fusion_pending_plan');
        localStorage.removeItem('fusion_pending_billing');
        // Redirect to checkout
        navigate(`/user/checkout?plan=${pendingPlan}&billing=${pendingBilling}`);
      } else {
        // Redirect to dashboard
        navigate('/user/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[15%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
      </div>
      <Header />
      <main className="relative z-10 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="surface-panel noise relative hidden overflow-hidden p-10 lg:block">
              <div className="relative z-10">
                <Badge className="mb-5">User Access</Badge>
                <img 
                  src="/Logo-01-transparent.png" 
                  alt="Fusion Logo" 
                  className="fusion-logo-lockup h-auto w-[150px]"
                />
                <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground xl:text-5xl">
                  Continue your protected
                  <span className="gradient-text block">audio workflow</span>
                </h1>
                <p className="mt-4 max-w-lg text-base text-muted-foreground">
                  Access your verification dashboard and provenance records with secure account authentication.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="rounded-xl border border-border/80 bg-secondary/55 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Session Scope</p>
                    <p className="mt-1 text-sm font-medium text-foreground">User dashboard and report access</p>
                  </div>
                  <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                    <p className="text-sm font-medium text-foreground">Account-level controls stay unchanged</p>
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
                  <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">User Login</p>
                  <h2 className="mt-2 text-3xl font-semibold text-foreground">Welcome Back</h2>
                  <p className="mt-3 text-sm text-muted-foreground">Sign in to your Fusion account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</Label>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Password</Label>
                      <Link to="/user/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
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
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/user/signup" className="text-primary hover:underline font-medium">
                      Create one
                    </Link>
                  </div>

                  <div className="text-center">
                    <Link 
                      to="/client/login" 
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Enterprise Portal →
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
