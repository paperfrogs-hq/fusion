import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Check, ArrowLeft, Loader2, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Plan {
  plan_code: string;
  plan_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  monthly_verifications: number;
  max_team_members: number | null;
}

const plans: Record<string, Plan> = {
  business_starter: {
    plan_code: 'business_starter',
    plan_name: 'Starter',
    description: 'Perfect for small teams getting started',
    price_monthly: 99,
    price_yearly: 990,
    monthly_verifications: 5000,
    max_team_members: 5,
  },
  business_pro: {
    plan_code: 'business_pro',
    plan_name: 'Professional',
    description: 'For growing businesses with advanced needs',
    price_monthly: 299,
    price_yearly: 2990,
    monthly_verifications: 25000,
    max_team_members: 15,
  },
  business_enterprise: {
    plan_code: 'business_enterprise',
    plan_name: 'Enterprise',
    description: 'For large organizations with mission-critical requirements',
    price_monthly: 799,
    price_yearly: 7990,
    monthly_verifications: 100000,
    max_team_members: null,
  },
};

export default function ClientCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get('plan') || 'business_starter';
  const billingCycle = (searchParams.get('billing') || 'monthly') as 'monthly' | 'yearly';

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');

  const plan = plans[planCode];
  const price = billingCycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly;
  const monthlyPrice = billingCycle === 'yearly' ? Math.round((plan?.price_yearly || 0) / 12) : plan?.price_monthly;

  useEffect(() => {
    // Check if client is logged in
    const orgId = localStorage.getItem('fusion_org_id');
    const orgName = localStorage.getItem('fusion_org_name');
    
    if (!orgId) {
      navigate(`/client/signup?plan=${planCode}&billing=${billingCycle}`);
      return;
    }
    
    setOrganizationId(orgId);
    setOrganizationName(orgName || 'Your Organization');
  }, [navigate, planCode, billingCycle]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value.replace('/', ''));
    setExpiry(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    const [expMonth, expYear] = expiry.split('/');
    if (!expMonth || !expYear || parseInt(expMonth) > 12 || parseInt(expMonth) < 1) {
      toast.error('Please enter a valid expiration date');
      return;
    }

    if (cvc.length < 3) {
      toast.error('Please enter a valid CVC');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (!cardName.trim()) {
      toast.error('Please enter the cardholder name');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/.netlify/functions/create-business-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          planCode,
          billingCycle,
          cardNumber: cardDigits,
          cardName,
          expMonth: parseInt(expMonth),
          expYear: parseInt('20' + expYear),
          cvc,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Subscription activated successfully!');
        navigate('/client/dashboard');
      } else {
        toast.error(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
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
            <Button onClick={() => navigate('/enterprise/pricing')}>
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
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/enterprise/pricing')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="order-2 lg:order-1">
              <Card className="p-6 bg-card border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
                    <p className="text-sm text-muted-foreground">{organizationName}</p>
                  </div>
                </div>
                
                <div className="space-y-4 pb-4 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{plan.plan_name} Plan</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {billingCycle}
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.monthly_verifications.toLocaleString()} verifications/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{plan.max_team_members ? `${plan.max_team_members} team members` : 'Unlimited team members'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Full API access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${price}.00</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Annual discount</span>
                      <span className="text-green-600">
                        -${((plan.price_monthly * 12) - plan.price_yearly).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Due today</span>
                      <span className="font-bold text-2xl text-foreground">${price}.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next billing: ${price}.00/{billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Instant Access</p>
                      <p className="text-xs text-muted-foreground">
                        Enterprise plans are charged immediately. Your subscription will be activated right away with full access to all features.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="order-1 lg:order-2">
              <Card className="p-6 bg-card border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
                    <p className="text-sm text-muted-foreground">Enter your card information</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="pr-12"
                        required
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <div className="relative">
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          required
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
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
                      I understand that I will be charged ${price}.00 today and ${price}.00/{billingCycle === 'yearly' ? 'year' : 'month'} thereafter.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay ${price}.00 Now
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your payment is secure and encrypted.
                    You can cancel your subscription at any time.
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
