import { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner';

interface WebhookDelivery {
  id: string;
  event_type: string;
  response_status: number;
  response_time_ms: number;
  attempt_number: number;
  delivered_at: string;
  next_retry_at?: string;
}

interface WebhookDeliveryLogProps {
  webhookId: string;
  onClose: () => void;
}

export default function WebhookDeliveryLog({ webhookId, onClose }: WebhookDeliveryLogProps) {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, [webhookId]);

  const loadDeliveries = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-webhook-deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId }),
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries || []);
      } else {
        toast.error('Failed to load delivery log');
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      toast.error('Failed to load delivery log');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Success</Badge>;
    }
    if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Client Error</Badge>;
    }
    if (status >= 500) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Server Error</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Webhook Delivery Log</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDeliveries}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No deliveries yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Attempt</TableHead>
                  <TableHead>Delivered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {delivery.event_type}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(delivery.response_status)}
                        {getStatusBadge(delivery.response_status)}
                        <span className="text-sm text-gray-600">
                          {delivery.response_status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {delivery.response_time_ms}ms
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        Attempt {delivery.attempt_number}
                      </Badge>
                      {delivery.next_retry_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Retry: {formatDate(delivery.next_retry_at)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(delivery.delivered_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing last 50 deliveries
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
