import { useState } from 'react';
import { Check, Zap, Crown, User, ArrowRight, AudioLines } from 'lucide-react';
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
  features: string[];
  is_popular: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: '1',
    plan_code: 'user_creator',
    plan_name: 'Creator',
    description: 'Perfect for content creators and podcasters',
    price_monthly: 9,
    price_yearly: 90,
    monthly_verifications: 100,
    features: [
      'Audio Fingerprinting',
      'Advanced Verification',
      'Personal Dashboard',
      'Audio Library Storage',
      'Verification Certificates',
      'Email Support',
      'Export Reports'
    ],
    is_popular: false,
    icon: <User className="h-6 w-6" />
  },
  {
    id: '2',
    plan_code: 'user_professional',
    plan_name: 'Professional',
    description: 'For professionals requiring extensive verification',
    price_monthly: 29,
    price_yearly: 290,
    monthly_verifications: 500,
    features: [
      'Audio Fingerprinting',
      'Advanced Verification',
      'Personal Dashboard',
      'Unlimited Audio Library',
      'Verification Certificates',
      'Priority Support',
      'Export Reports',
      'Bulk Verification',
      'API Access',
      'Tamper Detection Alerts'
    ],
    is_popular: true,
    icon: <Zap className="h-6 w-6" />
  }
];

export default function UserPricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleGetStarted = (planCode: string) => {
    // Check if user is already logged in
    const token = localStorage.getItem('fusion_user_token');
    const userId = localStorage.getItem('fusion_user_id');
    
    if (token && userId) {
      // User is logged in, go to checkout
      window.location.href = `/user/checkout?plan=${planCode}&billing=${billingCycle}`;
    } else {
      // User is not logged in, go to signup
      window.location.href = `/user/signup?plan=${planCode}&billing=${billingCycle}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              For Individuals
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Protect Your Audio Identity
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Secure your voice and audio content with cryptographic verification and deepfake protection
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
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
              const monthlyPrice = billingCycle === 'yearly' && plan.price_yearly > 0 
                ? Math.round(plan.price_yearly / 12) 
                : plan.price_monthly;

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
                      {billingCycle === 'yearly' && price > 0 && (
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
                      Start 14-Day Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="flex items-center gap-2 text-sm">
                      <AudioLines className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground font-semibold">
                        {plan.monthly_verifications} verifications/month
                      </span>
                    </div>

                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.price_monthly > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        14-day trial • Cancel anytime
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">What is audio verification?</h3>
                <p className="text-muted-foreground text-sm">
                  Audio verification uses cryptographic fingerprinting to prove the authenticity and origin of your audio content, protecting against deepfakes and unauthorized modifications.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades will apply at the start of your next billing cycle.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">What happens if I exceed my monthly verifications?</h3>
                <p className="text-muted-foreground text-sm">
                  You'll receive a notification when approaching your limit. You can upgrade your plan or purchase additional verifications as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
