import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowLeft, Loader2, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase-client';

interface Plan {
  plan_code: string;
  plan_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  monthly_verifications: number;
}

const plans: Record<string, Plan> = {
  user_creator: {
    plan_code: 'user_creator',
    plan_name: 'Creator',
    description: 'Perfect for content creators and podcasters',
    price_monthly: 9,
    price_yearly: 90,
    monthly_verifications: 100,
  },
  user_professional: {
    plan_code: 'user_professional',
    plan_name: 'Professional',
    description: 'For professionals requiring extensive verification',
    price_monthly: 29,
    price_yearly: 290,
    monthly_verifications: 500,
  },
};

export default function UserCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get('plan') || 'user_creator';
  const billingCycle = (searchParams.get('billing') || 'monthly') as 'monthly' | 'yearly';

  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const plan = plans[planCode];
  const price = billingCycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('fusion_user_token');
    const userId = localStorage.getItem('fusion_user_id');
    if (!token || !userId) {
      navigate(`/user/signup?plan=${planCode}&billing=${billingCycle}`);
      return;
    }

    // Check if user already has a subscription
    const checkSubscription = async () => {
      try {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('status, trial_end')
          .eq('user_id', userId)
          .single();

        if (subscription) {
          // User already has a subscription
          if (subscription.status === 'trialing') {
            const trialEnd = new Date(subscription.trial_end);
            if (trialEnd < new Date()) {
              // Trial expired, redirect to payment
              navigate(`/user/payment?plan=${planCode}&billing=${billingCycle}`);
            } else {
              // Trial still active, go to dashboard
              navigate('/user/dashboard');
            }
          } else if (subscription.status === 'active') {
            // Already subscribed
            navigate('/user/dashboard');
          } else {
            // Trial expired or cancelled, redirect to payment
            navigate(`/user/payment?plan=${planCode}&billing=${billingCycle}`);
          }
        }
        // No subscription exists, allow them to start trial
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Continue to trial page on error
      }
    };

    checkSubscription();
  }, [navigate, planCode, billingCycle]);

  const handleStartTrial = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setProcessing(true);

    try {
      const userId = localStorage.getItem('fusion_user_id');
      
      const response = await fetch('/.netlify/functions/create-user-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planCode,
          billingCycle,
          isTrial: true, // No card required for trial
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Your 14-day trial has started!');
        navigate('/user/dashboard');
      } else {
        toast.error(result.error || 'Failed to start trial. Please try again.');
      }
    } catch (error) {
      console.error('Trial activation error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Plan Not Found</h1>
            <p className="text-muted-foreground mb-6">The selected plan does not exist.</p>
            <Button onClick={() => navigate('/user/pricing')}>
              View Plans
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/user/pricing')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>

          <Card className="p-8 bg-card border">
            {/* Trial Badge */}
            <div className="flex justify-center mb-6">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                No Credit Card Required
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-foreground text-center mb-2">
              Start Your 14-Day Free Trial
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Try {plan.plan_name} with full access. No payment needed today.
            </p>

            {/* Plan Summary */}
            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{plan.plan_name} Plan</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {billingCycle}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-foreground">{plan.monthly_verifications} verifications per month</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-foreground">Full feature access during trial</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-foreground">Cancel anytime, no questions asked</span>
                </div>
              </div>
            </div>

            {/* Trial Timeline */}
            <div className="bg-primary/5 rounded-xl p-6 mb-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">How Your Trial Works</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-foreground">Today - Start Free</p>
                    <p className="text-muted-foreground">Instant access to all features. No card required.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-foreground">Day 12 - Reminder</p>
                    <p className="text-muted-foreground">We'll email you before your trial ends.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-foreground">Day 14 - Add Payment</p>
                    <p className="text-muted-foreground">Add your card to continue at ${price}/{billingCycle === 'yearly' ? 'year' : 'month'}.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </label>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartTrial}
              className="w-full h-14 text-lg"
              disabled={processing || !agreedToTerms}
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Starting Trial...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start 14-Day Free Trial
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              No credit card required. Add payment details only when your trial ends.
            </p>

            {/* Trust Badge */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Trusted by 10,000+ creators worldwide</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
