// Trial Expired Modal
// Shows when 14-day trial has ended, blocks access until upgrade

import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, Clock, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TrialExpiredModalProps {
  open: boolean;
  organizationName?: string;
}

export default function TrialExpiredModal({ open, organizationName }: TrialExpiredModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/client/billing');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-neutral-900 border-neutral-800"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="text-xl text-white text-center">
            Your Trial Has Ended
          </DialogTitle>
          <DialogDescription className="text-neutral-400 text-center">
            {organizationName ? (
              <>Your 14-day trial for <span className="text-white font-medium">{organizationName}</span> has expired.</>
            ) : (
              <>Your 14-day trial has expired.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits reminder */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Upgrade to continue with:
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Full API access & webhooks
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Unlimited audio verifications
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Advanced analytics & reports
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Priority support
              </li>
            </ul>
          </div>

          {/* Trial status */}
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>Trial period: 14 days</span>
            <Badge variant="outline" className="text-orange-400 border-orange-400/30">
              Expired
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleUpgrade} className="w-full bg-primary hover:bg-primary/90">
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
          <p className="text-xs text-neutral-500 text-center">
            Choose a plan that fits your needs. No hidden fees.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
