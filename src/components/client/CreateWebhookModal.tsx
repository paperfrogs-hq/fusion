import { useState } from 'react';
import { Webhook, Plus, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface CreateWebhookModalProps {
  organizationId: string;
  environmentId: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const eventTypes = [
  { id: 'verification.completed', label: 'Verification Completed', description: 'Audio verification succeeded' },
  { id: 'verification.failed', label: 'Verification Failed', description: 'Audio verification failed' },
  { id: 'tamper.detected', label: 'Tamper Detected', description: 'Audio tampering detected' },
  { id: 'quota.warning', label: 'Quota Warning', description: 'Usage quota threshold reached (80%, 90%, 95%)' },
];

export default function CreateWebhookModal({ 
  organizationId, 
  environmentId,
  userId, 
  onClose, 
  onSuccess 
}: CreateWebhookModalProps) {
  const [endpointUrl, setEndpointUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['verification.completed']);
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!endpointUrl.trim()) {
      toast.error('Please enter an endpoint URL');
      return;
    }

    // Validate URL
    try {
      const url = new URL(endpointUrl);
      if (url.protocol !== 'https:') {
        toast.error('Webhook URL must use HTTPS');
        return;
      }
    } catch {
      toast.error('Please enter a valid HTTPS URL');
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event type');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/create-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          environmentId,
          endpointUrl: endpointUrl.trim(),
          eventTypes: selectedEvents,
          retryPolicy: {
            max_attempts: parseInt(maxAttempts),
            backoff: 'exponential'
          },
          createdBy: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Webhook created successfully');
        // Show signing secret
        alert(`Webhook Signing Secret (save this securely):\n\n${data.signingSecret}\n\nUse this to verify webhook signatures.`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create webhook');
      }
    } catch (error) {
      console.error('Create webhook error:', error);
      toast.error('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Add Webhook Endpoint
          </DialogTitle>
          <DialogDescription>
            Receive real-time HTTP notifications when events occur in your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="endpointUrl">Endpoint URL</Label>
            <Input
              id="endpointUrl"
              type="url"
              placeholder="https://api.yourapp.com/webhooks/fusion"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              required
            />
            <p className="text-xs text-neutral-500">
              Must be a valid HTTPS URL that can receive POST requests
            </p>
          </div>

          <div className="space-y-2">
            <Label>Event Types</Label>
            <div className="space-y-3 border border-neutral-800 rounded-md p-3 max-h-48 overflow-y-auto">
              {eventTypes.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <Checkbox
                    id={event.id}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleEventToggle(event.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={event.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {event.label}
                    </label>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttempts">Retry Policy</Label>
            <Select value={maxAttempts} onValueChange={setMaxAttempts}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 attempt (no retries)</SelectItem>
                <SelectItem value="3">3 attempts (recommended)</SelectItem>
                <SelectItem value="5">5 attempts</SelectItem>
                <SelectItem value="10">10 attempts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-500">
              Failed deliveries will be retried with exponential backoff
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong>Webhook Security:</strong> Each webhook receives a unique signing secret. 
                Use it to verify that requests are from Fusion by validating the <code className="bg-blue-500/20 px-1 rounded">X-Fusion-Signature</code> header.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Webhook'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
