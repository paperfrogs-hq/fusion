import { useState, useEffect } from 'react';
import { 
  Webhook, 
  Plus, 
  Play,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ClientLayout from '../components/client/ClientLayout';
import CreateWebhookModal from '../components/client/CreateWebhookModal';
import WebhookDeliveryLog from '../components/client/WebhookDeliveryLog';
import { getCurrentOrganization, getCurrentEnvironment, canManageWebhooks } from '../lib/client-auth';
import { toast } from 'sonner';

interface Webhook {
  id: string;
  endpoint_url: string;
  event_types: string[];
  is_active: boolean;
  signing_secret: string;
  retry_policy: {
    max_attempts: number;
    backoff: string;
  };
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
}

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();
  const canManage = canManageWebhooks(org);

  useEffect(() => {
    if (env) {
      loadWebhooks();
    }
  }, [org?.id, env?.id]);

  const loadWebhooks = async () => {
    if (!org || !env) return;

    try {
      const response = await fetch('/.netlify/functions/get-webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org.id,
          environmentId: env.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      } else {
        toast.error('Failed to load webhooks');
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (webhookId: string, currentState: boolean) => {
    try {
      const response = await fetch('/.netlify/functions/update-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          webhookId,
          updates: { is_active: !currentState }
        }),
      });

      if (response.ok) {
        toast.success(`Webhook ${!currentState ? 'enabled' : 'disabled'}`);
        loadWebhooks();
      } else {
        toast.error('Failed to update webhook');
      }
    } catch (error) {
      console.error('Toggle webhook error:', error);
      toast.error('Failed to update webhook');
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const response = await fetch('/.netlify/functions/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId }),
      });

      if (response.ok) {
        toast.success('Test webhook sent successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send test webhook');
      }
    } catch (error) {
      console.error('Test webhook error:', error);
      toast.error('Failed to send test webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/delete-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId }),
      });

      if (response.ok) {
        toast.success('Webhook deleted successfully');
        loadWebhooks();
      } else {
        toast.error('Failed to delete webhook');
      }
    } catch (error) {
      console.error('Delete webhook error:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const getSuccessRate = (webhook: Webhook) => {
    const total = webhook.success_count + webhook.failure_count;
    if (total === 0) return 0;
    return Math.round((webhook.success_count / total) * 100);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </ClientLayout>
    );
  }

  if (!env) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Environment Selected</h2>
          <p className="text-gray-600">Please select an environment to manage webhooks.</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
            <p className="text-gray-600 mt-1">
              Receive real-time notifications for {env.display_name} environment
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
              </div>
              <Webhook className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {webhooks.filter(w => w.is_active).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">
                  {webhooks.reduce((sum, w) => sum + w.success_count + w.failure_count, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Deliveries</p>
                <p className="text-2xl font-bold text-red-600">
                  {webhooks.reduce((sum, w) => sum + w.failure_count, 0)}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Webhooks Table */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Configured Webhooks ({webhooks.length})
            </h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Triggered</TableHead>
                {canManage && <TableHead className="w-40">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => {
                const successRate = getSuccessRate(webhook);
                
                return (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Webhook className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <code className="text-xs text-gray-900 break-all">
                            {webhook.endpoint_url}
                          </code>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {webhook.retry_policy.max_attempts} retries · {webhook.retry_policy.backoff} backoff
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {webhook.event_types.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={() => handleToggleActive(webhook.id, webhook.is_active)}
                          disabled={!canManage}
                        />
                        <span className="text-sm">
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div 
                            className={`h-2 rounded-full ${
                              successRate >= 95 ? 'bg-green-600' :
                              successRate >= 80 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {successRate}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {webhook.success_count} success · {webhook.failure_count} failed
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-3 w-3" />
                        {formatDate(webhook.last_triggered_at)}
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWebhook(webhook.id)}
                            title="View delivery log"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                            title="Send test"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {webhooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Webhook className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No webhooks configured</p>
                    {canManage && (
                      <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Webhook
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Webhook Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
              <div>
                <strong>verification.completed:</strong> Audio verification succeeded
              </div>
              <div>
                <strong>verification.failed:</strong> Audio verification failed
              </div>
              <div>
                <strong>tamper.detected:</strong> Audio tampering detected
              </div>
              <div>
                <strong>quota.warning:</strong> Usage quota threshold reached
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Modal */}
      {showCreateModal && env && (
        <CreateWebhookModal
          organizationId={org?.id || ''}
          environmentId={env.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadWebhooks();
          }}
        />
      )}

      {/* Delivery Log Modal */}
      {selectedWebhook && (
        <WebhookDeliveryLog
          webhookId={selectedWebhook}
          onClose={() => setSelectedWebhook(null)}
        />
      )}
    </ClientLayout>
  );
}
