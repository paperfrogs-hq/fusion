import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface PaymentMethodModalProps {
  organizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentMethodModal({ 
  organizationId, 
  onClose, 
  onSuccess 
}: PaymentMethodModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [saving, setSaving] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length !== 16) {
      toast.error('Please enter a valid card number');
      return;
    }

    if (!expMonth || !expYear) {
      toast.error('Please enter expiration date');
      return;
    }

    if (cvc.length < 3) {
      toast.error('Please enter a valid CVC');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/.netlify/functions/update-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          cardNumber: cardDigits,
          expMonth: parseInt(expMonth),
          expYear: parseInt(expYear),
          cvc,
        }),
      });

      if (response.ok) {
        toast.success('Payment method updated successfully');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Update payment method error:', error);
      toast.error('Failed to update payment method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Update Payment Method
          </DialogTitle>
          <DialogDescription>
            Add or update your payment information securely.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expMonth">Month</Label>
              <Input
                id="expMonth"
                placeholder="MM"
                value={expMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2 && (value === '' || parseInt(value) <= 12)) {
                    setExpMonth(value);
                  }
                }}
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expYear">Year</Label>
              <Input
                id="expYear"
                placeholder="YY"
                value={expYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2) {
                    setExpYear(value);
                  }
                }}
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCvc(value);
                  }
                }}
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Secure Payment</p>
                <p className="text-blue-800">
                  Your payment information is encrypted and securely stored. We never store your full card number.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Payment Method'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
