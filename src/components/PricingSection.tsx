import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import SectionBadge from './SectionBadge';

const PricingSection = () => {
  const [selectedTab, setSelectedTab] = useState<'individual' | 'business'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const individualPlans = [
    {
      name: 'Free',
      description: 'Get started with basic verification',
      price: 0,
      yearlyPrice: 0,
      verifications: 10,
      features: ['Audio Fingerprinting', 'Basic Verification', 'Personal Dashboard'],
      popular: false,
      icon: <User className="h-5 w-5" />,
      cta: 'Sign Up Free',
      link: '/user/signup'
    },
    {
      name: 'Creator',
      description: 'For content creators and podcasters',
      price: 9,
      yearlyPrice: 90,
      verifications: 100,
      features: ['Audio Fingerprinting', 'Advanced Verification', 'Audio Library', 'Certificates', 'Email Support'],
      popular: true,
      icon: <Zap className="h-5 w-5" />,
      cta: 'Start Free Trial',
      link: '/user/signup?plan=creator'
    },
    {
      name: 'Professional',
      description: 'For professionals needing more',
      price: 29,
      yearlyPrice: 290,
      verifications: 500,
      features: ['Unlimited Library', 'Priority Support', 'Bulk Verification', 'API Access', 'Tamper Alerts'],
      popular: false,
      icon: <Crown className="h-5 w-5" />,
      cta: 'Start Free Trial',
      link: '/user/signup?plan=professional'
    }
  ];

  const businessPlans = [
    {
      name: 'Starter',
      description: 'For small teams getting started',
      price: 99,
      yearlyPrice: 990,
      verifications: 5000,
      features: ['Full API Access', 'Webhooks', 'Basic Analytics', '5 Team Members', 'Email Support'],
      popular: false,
      icon: <Building2 className="h-5 w-5" />,
      cta: 'Get Started',
      link: '/client/signup?plan=starter'
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      price: 299,
      yearlyPrice: 2990,
      verifications: 25000,
      features: ['Full API Access', 'Advanced Analytics', '15 Team Members', 'Priority Support', '99.5% SLA'],
      popular: true,
      icon: <Zap className="h-5 w-5" />,
      cta: 'Get Started',
      link: '/client/signup?plan=pro'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 799,
      yearlyPrice: 7990,
      verifications: 100000,
      features: ['Unlimited Team', '24/7 Support', '99.9% SLA', 'Dedicated Manager', 'Custom Integration'],
      popular: false,
      icon: <Crown className="h-5 w-5" />,
      cta: 'Contact Sales',
      link: '/contact'
    }
  ];

  const plans = selectedTab === 'individual' ? individualPlans : businessPlans;

  return (
    <section id="pricing" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionBadge>Pricing</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include a free trial.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-full mb-6">
            <button
              onClick={() => setSelectedTab('individual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTab === 'individual'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Individuals
            </button>
            <button
              onClick={() => setSelectedTab('business')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTab === 'business'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Businesses
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 bg-muted rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-primary rounded-full transition-all ${
                  billingCycle === 'yearly' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly <Badge variant="secondary" className="ml-1 text-xs">Save 17%</Badge>
            </span>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice > 0
              ? Math.round(plan.yearlyPrice / 12)
              : plan.price;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full p-6 bg-card border transition-all hover:shadow-lg ${
                    plan.popular ? 'border-primary border-2 shadow-xl' : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-foreground">
                      {displayPrice === 0 ? 'Free' : `$${displayPrice}`}
                      {displayPrice > 0 && <span className="text-base font-normal text-muted-foreground">/mo</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.verifications.toLocaleString()} verifications/month
                    </p>
                  </div>

                  <Button
                    className={`w-full mb-4 ${
                      plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => window.location.href = plan.link}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button
            variant="ghost"
            onClick={() => window.location.href = selectedTab === 'individual' ? '/user/pricing' : '/business/pricing'}
          >
            View All {selectedTab === 'individual' ? 'Individual' : 'Business'} Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
