import { useState } from 'react';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  quota: number;
  features: string[];
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    quota: 10000,
    features: [
      '10,000 verifications/month',
      'Standard API access',
      'Email support',
      'Basic analytics',
      '1 production environment',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 199,
    quota: 50000,
    features: [
      '50,000 verifications/month',
      'Priority API access',
      'Priority support',
      'Advanced analytics',
      'Webhooks',
      'Multiple environments',
      'Team collaboration',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    quota: 999999,
    features: [
      'Unlimited verifications',
      'Dedicated infrastructure',
      '24/7 premium support',
      'Custom analytics',
      'SLA guarantees',
      'Advanced security',
      'Custom integrations',
      'On-premise deployment',
    ],
  },
];

interface UpgradePlanModalProps {
  currentPlan: string;
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpgradePlanModal({ 
  currentPlan, 
  organizationId, 
  onClose, 
  onSuccess 
}: UpgradePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    if (selectedPlan === 'enterprise') {
      window.location.href = '/contact-sales';
      return;
    }

    setUpgrading(true);

    try {
      const response = await fetch('/.netlify/functions/upgrade-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          planId: selectedPlan,
        }),
      });

      if (response.ok) {
        toast.success('Plan upgraded successfully');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upgrade plan');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to upgrade plan');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs. You can change or cancel anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : isCurrent
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isCurrent && setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Recommended
                  </Badge>
                )}

                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                    Current Plan
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price > 0 ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">Custom</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? 'default' : isCurrent ? 'outline' : 'outline'}
                  className="w-full"
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            All plans include SSL encryption, 99.9% uptime, and GDPR compliance
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={upgrading}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={!selectedPlan || upgrading}>
              {upgrading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Upgrading...
                </>
              ) : (
                <>
                  Upgrade Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
