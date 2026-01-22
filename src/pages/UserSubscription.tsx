import { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface Subscription {
  id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  usage_verifications: number;
}

interface Plan {
  plan_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  monthly_verifications: number;
}

export default function UserSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const userSession = localStorage.getItem('fusion_user_session');
    if (!userSession) {
      window.location.href = '/user/login';
      return;
    }

    const session = JSON.parse(userSession);

    try {
      const response = await fetch('/.netlify/functions/get-current-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setPlan(data.plan);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const userSession = localStorage.getItem('fusion_user_session');
    if (!userSession) return;

    const session = JSON.parse(userSession);
    setCanceling(true);

    try {
      const response = await fetch('/.netlify/functions/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          reason: 'User requested cancellation'
        }),
      });

      if (response.ok) {
        toast.success('Subscription will cancel at period end');
        loadSubscription();
        setShowCancelDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
      trialing: { label: 'Trial', className: 'bg-blue-100 text-blue-800 border-blue-300', icon: AlertCircle },
      past_due: { label: 'Past Due', className: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      canceled: { label: 'Canceled', className: 'bg-gray-100 text-gray-800 border-gray-300', icon: XCircle },
    };

    const config = statusConfig[subscription.status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen glass flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen glass py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">No Active Subscription</h1>
          <p className="text-muted-foreground mb-8">
            You're currently on the free plan. Upgrade to unlock more features.
          </p>
          <Button
            onClick={() => window.location.href = '/user/pricing'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  const usagePercent = plan ? (subscription.usage_verifications / plan.monthly_verifications) * 100 : 0;

  return (
    <div className="min-h-screen glass py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Subscription & Billing</h1>

        {/* Trial Warning */}
        {subscription.status === 'trialing' && subscription.trial_end && (
          <Card className="bg-blue-50 border-blue-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Trial Active</h3>
                <p className="text-sm text-blue-800">
                  Your 14-day trial ends on {formatDate(subscription.trial_end)}. After that, you'll be charged ${plan?.price_monthly}/month.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Cancellation Warning */}
        {subscription.cancel_at_period_end && (
          <Card className="bg-orange-50 border-orange-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Subscription Ending</h3>
                <p className="text-sm text-orange-800">
                  Your subscription will end on {formatDate(subscription.current_period_end)}. You'll lose access to premium features.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Plan */}
        <Card className="glass-card p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{plan?.plan_name} Plan</h2>
              <p className="text-muted-foreground">{plan?.description}</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Billing Cycle</p>
              <p className="text-lg font-semibold text-foreground capitalize">{subscription.billing_cycle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(subscription.current_period_end)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = '/user/pricing'}
              variant="outline"
            >
              Change Plan
            </Button>
            {!subscription.cancel_at_period_end && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </Card>

        {/* Usage */}
        <Card className="glass-card p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-foreground">Usage This Month</h3>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Verifications Used</span>
              <span className="font-semibold text-foreground">
                {subscription.usage_verifications.toLocaleString()} / {plan?.monthly_verifications.toLocaleString()}
              </span>
            </div>
            <Progress value={usagePercent} className="h-3" />
          </div>

          {usagePercent > 80 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
              You're approaching your monthly limit. Consider upgrading your plan.
            </div>
          )}
        </Card>

        {/* Payment Method */}
        <Card className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-foreground">Payment Method</h3>
          </div>

          {subscription.card_last4 ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground capitalize">
                  {subscription.card_brand} ending in {subscription.card_last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires {subscription.card_exp_month}/{subscription.card_exp_year}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No payment method on file</p>
          )}
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Your subscription will remain active until {formatDate(subscription.current_period_end)}.
              You can reactivate anytime before then.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Canceling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
