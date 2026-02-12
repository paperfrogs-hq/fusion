import { useState } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Plan {
  id: string;
  plan_code: string;
  plan_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  monthly_verifications: number;
  max_team_members: number | null;
  features: string[];
  is_popular: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: '1',
    plan_code: 'business_starter',
    plan_name: 'Starter',
    description: 'Perfect for small teams getting started with audio verification',
    price_monthly: 99,
    price_yearly: 990,
    monthly_verifications: 5000,
    max_team_members: 5,
    features: [
      'Full API Access',
      'Webhook Integration',
      'Basic Analytics',
      'Email Support',
      'Documentation Access'
    ],
    is_popular: false,
    icon: <Building2 className="h-6 w-6" />
  },
  {
    id: '2',
    plan_code: 'business_pro',
    plan_name: 'Professional',
    description: 'For growing businesses with advanced verification needs',
    price_monthly: 299,
    price_yearly: 2990,
    monthly_verifications: 25000,
    max_team_members: 15,
    features: [
      'Full API Access',
      'Webhook Integration',
      'Advanced Analytics Dashboard',
      'Team Management',
      'Priority Support',
      'Custom Branding',
      '99.5% SLA'
    ],
    is_popular: true,
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: '3',
    plan_code: 'business_enterprise',
    plan_name: 'Enterprise',
    description: 'For large organizations with mission-critical requirements',
    price_monthly: 799,
    price_yearly: 7990,
    monthly_verifications: 100000,
    max_team_members: null,
    features: [
      'Full API Access',
      'Webhook Integration',
      'Advanced Analytics Dashboard',
      'Unlimited Team Members',
      '24/7 Priority Support',
      'Custom Branding',
      '99.9% SLA Guarantee',
      'Dedicated Account Manager',
      'Custom Integrations',
      'Volume Discounts'
    ],
    is_popular: false,
    icon: <Crown className="h-6 w-6" />
  }
];

export default function BusinessPricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleGetStarted = (planCode: string) => {
    window.location.href = `/client/signup?plan=${planCode}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              For Businesses
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Enterprise-Grade Audio Verification
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Protect your platform with scalable, API-first audio provenance and deepfake detection
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-full">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs opacity-80">Save 17%</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
              const monthlyPrice = billingCycle === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;

              return (
                <Card
                  key={plan.id}
                  className={`relative p-8 bg-card border transition-all hover:shadow-lg ${
                    plan.is_popular
                      ? 'border-primary border-2 shadow-xl md:scale-105'
                      : 'border-border'
                  }`}
                >
                  {plan.is_popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {plan.plan_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <div className="text-4xl font-bold text-foreground">
                        ${monthlyPrice}
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-muted-foreground mt-1">
                          ${price} billed annually
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleGetStarted(plan.plan_code)}
                      className={`w-full ${
                        plan.is_popular
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-foreground font-semibold">
                        {plan.monthly_verifications.toLocaleString()} API calls/month
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">
                        {plan.max_team_members ? `Up to ${plan.max_team_members} team members` : 'Unlimited team members'}
                      </span>
                    </div>

                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      14-day free trial • No credit card required
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Enterprise CTA */}
          <div className="mt-20 bg-card border border-border p-12 rounded-2xl text-center max-w-4xl mx-auto">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              For enterprises requiring custom SLAs, on-premise deployment, or processing more than 100,000 verifications per month, contact our sales team.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Enterprise Sales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
