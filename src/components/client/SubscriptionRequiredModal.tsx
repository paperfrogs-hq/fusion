// Subscription Required Modal
// Shows when enterprise/business organization needs to purchase a subscription

import { useNavigate } from 'react-router-dom';
import { CreditCard, Building2, Check, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubscriptionRequiredModalProps {
  open: boolean;
  organizationName?: string;
}

export default function SubscriptionRequiredModal({ open, organizationName }: SubscriptionRequiredModalProps) {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/enterprise/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-neutral-900 border-neutral-800"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl text-white text-center">
            Subscription Required
          </DialogTitle>
          <DialogDescription className="text-neutral-400 text-center">
            {organizationName ? (
              <>To access the dashboard for <span className="text-white font-medium">{organizationName}</span>, please subscribe to a plan.</>
            ) : (
              <>Please subscribe to a plan to access your dashboard.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan features */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Enterprise plans include:
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Full API access & webhooks
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Advanced analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Team management & collaboration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Priority support
              </li>
            </ul>
          </div>

          {/* Pricing badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Lock className="w-4 h-4" />
            <span>Plans starting at</span>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              $99/month
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleSubscribe} className="w-full bg-primary hover:bg-primary/90">
            <CreditCard className="w-4 h-4 mr-2" />
            View Plans & Subscribe
          </Button>
          <p className="text-xs text-neutral-500 text-center">
            Enterprise plans are charged immediately. No trial period.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
