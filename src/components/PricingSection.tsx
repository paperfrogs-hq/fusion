import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import SectionBadge from './SectionBadge';
import { Section } from './ui/section';

const PricingSection = () => {
  const [selectedTab, setSelectedTab] = useState<'individual' | 'business'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const individualPlans = [
    {
      name: 'Creator',
      description: 'For content creators and podcasters',
      price: 9,
      yearlyPrice: 90,
      verifications: 100,
      features: ['Audio Fingerprinting', 'Advanced Verification', 'Audio Library', 'Certificates', 'Email Support'],
      popular: false,
      icon: <User className="h-5 w-5" />,
      cta: 'Start 14-Day Trial',
      link: '/user/signup?plan=creator'
    },
    {
      name: 'Professional',
      description: 'For professionals needing more',
      price: 29,
      yearlyPrice: 290,
      verifications: 500,
      features: ['Unlimited Library', 'Priority Support', 'Bulk Verification', 'API Access', 'Tamper Alerts'],
      popular: true,
      icon: <Zap className="h-5 w-5" />,
      cta: 'Start 14-Day Trial',
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
    <Section id="pricing">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionBadge>Pricing</SectionBadge>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Simple, Transparent Pricing</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Choose the plan that fits your usage. All plans include a 14-day trial.
          </p>

          <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-2 items-center gap-1 rounded-full border border-border bg-secondary/90 p-1 shadow-[0_0_0_1px_rgba(182,255,0,0.08)]">
            <button
              onClick={() => setSelectedTab('individual')}
              className={`rounded-full px-3 py-2 text-xs font-medium transition-all sm:px-5 sm:text-sm ${
                selectedTab === 'individual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Individuals
            </button>
            <button
              onClick={() => setSelectedTab('business')}
              className={`rounded-full px-3 py-2 text-xs font-medium transition-all sm:px-5 sm:text-sm ${
                selectedTab === 'business'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For Enterprise
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative h-6 w-12 rounded-full border border-border bg-secondary"
              aria-label="Toggle billing cycle"
            >
              <div
                className={`absolute top-[3px] h-4 w-4 rounded-full bg-primary transition-all ${
                  billingCycle === 'yearly' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly <Badge variant="secondary" className="ml-1 text-[10px]">Save 17%</Badge>
            </span>
          </div>
        </motion.div>

        <div className={`grid gap-5 ${plans.length === 2 ? 'mx-auto max-w-4xl md:grid-cols-2' : 'mx-auto max-w-6xl md:grid-cols-3'}`}>
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
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className={`relative h-full border p-6 transition-all duration-300 ${
                    plan.popular
                      ? 'border-primary/55 shadow-[0_0_32px_-16px_rgba(182,255,0,0.8)]'
                      : 'border-border hover:border-primary/30 hover:shadow-[0_0_28px_-18px_rgba(182,255,0,0.72)]'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-primary/40 bg-primary/15 text-primary">
                      Most Popular
                    </Badge>
                  )}

                  <div className="mb-4 text-center">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-5 text-center">
                    <div className="text-4xl font-bold text-foreground">
                      ${displayPrice}
                      <span className="text-base font-normal text-muted-foreground">/mo</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.verifications.toLocaleString()} verifications/month
                    </p>
                  </div>

                  <Button
                    className="mb-5 w-full"
                    variant={plan.popular ? 'hero' : 'outline'}
                    onClick={() => window.location.href = plan.link}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>

                  <div className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button
            variant="ghost"
            onClick={() => window.location.href = selectedTab === 'individual' ? '/user/pricing' : '/business/pricing'}
          >
            View All {selectedTab === 'individual' ? 'Individual' : 'Enterprise'} Plans
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
    </Section>
  );
};

export default PricingSection;
