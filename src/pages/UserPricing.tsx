import { useState, useEffect } from 'react';
import { Check, Zap, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface Plan {
  id: string;
  plan_code: string;
  plan_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  monthly_verifications: number;
  features: Record<string, boolean>;
  is_popular: boolean;
}

export default function UserPricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-subscription-plans?type=user');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planCode: string) => {
    const userSession = localStorage.getItem('fusion_user_session');
    if (!userSession) {
      toast.error('Please log in to subscribe');
      window.location.href = '/user/login';
      return;
    }

    const session = JSON.parse(userSession);
    setProcessingPlan(planCode);

    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode,
          userId: session.user.id,
          billingCycle
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanIcon = (planCode: string) => {
    if (planCode.includes('enterprise')) return <Crown className="h-6 w-6" />;
    if (planCode.includes('pro')) return <Zap className="h-6 w-6" />;
    return <Check className="h-6 w-6" />;
  };

  const getFeatureList = (features: Record<string, boolean>) => {
    const featureNames: Record<string, string> = {
      watermarking: 'Audio Watermarking',
      batch_upload: 'Batch Upload',
      priority_support: 'Priority Support',
      api_access: 'API Access',
      advanced_analytics: 'Advanced Analytics',
      custom_integration: 'Custom Integration',
      dedicated_support: 'Dedicated Support Manager'
    };

    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => featureNames[key] || key);
  };

  if (loading) {
    return (
      <div className="min-h-screen glass flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen glass py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Start protecting your audio with industry-leading verification
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 glass-card p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const monthlyPrice = billingCycle === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly;

            return (
              <Card
                key={plan.id}
                className={`relative p-8 ${
                  plan.is_popular
                    ? 'border-blue-500 border-2 shadow-2xl scale-105'
                    : 'glass-card'
                }`}
              >
                {plan.is_popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                    {getPlanIcon(plan.plan_code)}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.plan_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-4xl font-bold text-foreground">
                      ${monthlyPrice.toFixed(2)}
                      <span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        ${price.toFixed(2)} billed annually
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.plan_code)}
                    disabled={processingPlan === plan.plan_code || plan.price_monthly === 0}
                    className={`w-full ${
                      plan.is_popular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'glass-button'
                    }`}
                  >
                    {processingPlan === plan.plan_code ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : plan.price_monthly === 0 ? (
                      'Current Plan'
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">
                      {plan.monthly_verifications.toLocaleString()} verifications/month
                    </span>
                  </div>

                  {getFeatureList(plan.features).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.plan_code !== 'creator_free' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-muted-foreground text-center">
                      14-day free trial • Cancel anytime
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Have Questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            All plans include 14-day free trial with no credit card required
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
