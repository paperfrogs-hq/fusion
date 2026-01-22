import { useState, useEffect } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, Loader2, Users } from 'lucide-react';
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
  max_team_members: number | null;
  features: Record<string, boolean>;
  is_popular: boolean;
}

export default function BusinessPricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-subscription-plans?type=business');
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
    const orgId = localStorage.getItem('fusion_current_org_id');
    if (!orgId) {
      toast.error('Please select an organization first');
      window.location.href = '/client/select-org';
      return;
    }

    setProcessingPlan(planCode);

    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode,
          organizationId: orgId,
          billingCycle
        }),
      });

      if (response.ok) {
        const data = await response.json();
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
    return <Building2 className="h-6 w-6" />;
  };

  const getFeatureList = (features: Record<string, boolean>) => {
    const featureNames: Record<string, string> = {
      api_access: 'Full API Access',
      webhooks: 'Webhook Integration',
      team_management: 'Team Management',
      analytics_dashboard: 'Analytics Dashboard',
      priority_support: '24/7 Priority Support',
      sla_99_9: '99.9% SLA Guarantee',
      custom_branding: 'Custom Branding',
      dedicated_support: 'Dedicated Account Manager',
      custom_integration: 'Custom Integrations',
      volume_discounts: 'Volume Discounts'
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
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            For Businesses
          </Badge>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Enterprise-Grade Audio Verification
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Protect your platform with scalable, API-first audio provenance
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
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-muted-foreground mt-1">
                        ${price.toFixed(2)} billed annually
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.plan_code)}
                    disabled={processingPlan === plan.plan_code}
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
                    <span className="text-foreground font-semibold">
                      {plan.monthly_verifications.toLocaleString()} API calls/month
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-foreground">
                      {plan.max_team_members ? `Up to ${plan.max_team_members} team members` : 'Unlimited team members'}
                    </span>
                  </div>

                  {getFeatureList(plan.features).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground text-center">
                    14-day free trial • No credit card required
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-20 glass-card p-12 rounded-2xl text-center max-w-4xl mx-auto">
          <Crown className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            For enterprises requiring custom SLAs, on-premise deployment, or processing more than 100,000 verifications per month, contact our sales team.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Contact Enterprise Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
