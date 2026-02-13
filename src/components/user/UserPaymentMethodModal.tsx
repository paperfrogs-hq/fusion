import { useState } from 'react';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
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

interface UserPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserPaymentMethodModal({ 
  open,
  onClose, 
  onSuccess 
}: UserPaymentMethodModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
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

  const handleSave = async (e: React.FormEvent) => {
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

    if (!cardName.trim()) {
      toast.error('Please enter the cardholder name');
      return;
    }

    setSaving(true);

    try {
      const userId = localStorage.getItem('fusion_user_id');
      
      const response = await fetch('/.netlify/functions/update-user-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardNumber: cardDigits,
          cardName,
          expMonth: parseInt(expMonth),
          expYear: parseInt('20' + expYear),
          cvc,
        }),
      });

      if (response.ok) {
        toast.success('Payment method updated successfully');
        resetForm();
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

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvc('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <p>Your payment information is encrypted and secure.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Card'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
