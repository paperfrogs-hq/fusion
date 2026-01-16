import { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ClientLayout from '../components/client/ClientLayout';
import CreateAPIKeyModal from '../components/client/CreateAPIKeyModal';
import { getCurrentOrganization, getCurrentEnvironment, canManageAPIKeys } from '../lib/client-auth';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  key_name: string;
  key_prefix: string;
  key_secret_partial: string;
  scopes: string[];
  created_at: string;
  last_used_at?: string;
  last_used_ip?: string;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  expires_at?: string;
  revoked_at?: string;
}

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();
  const canManage = canManageAPIKeys(org);

  useEffect(() => {
    if (env) {
      loadAPIKeys();
    }
  }, [org?.id, env?.id]);

  const loadAPIKeys = async () => {
    if (!org || !env) return;

    try {
      const response = await fetch('/.netlify/functions/get-api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org.id,
          environmentId: env.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      } else {
        toast.error('Failed to load API keys');
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (keyPrefix: string, partial: string) => {
    // In production, this would copy the full key (stored securely)
    const displayKey = `${keyPrefix}••••••••${partial}`;
    navigator.clipboard.writeText(displayKey);
    toast.success('API key copied to clipboard');
  };

  const handleRotateKey = async (keyId: string) => {
    if (!confirm('Rotating this key will invalidate the old key immediately. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/rotate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyId,
          organizationId: org?.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('API key rotated successfully');
        // Show the new key
        alert(`New API Key (save this, it won't be shown again):\n\n${data.newKey}`);
        loadAPIKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to rotate key');
      }
    } catch (error) {
      console.error('Rotate key error:', error);
      toast.error('Failed to rotate key');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/revoke-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyId,
          organizationId: org?.id 
        }),
      });

      if (response.ok) {
        toast.success('API key revoked successfully');
        loadAPIKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to revoke key');
      }
    } catch (error) {
      console.error('Revoke key error:', error);
      toast.error('Failed to revoke key');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getKeyStatus = (key: APIKey) => {
    if (key.revoked_at) return { label: 'Revoked', color: 'bg-red-100 text-red-800 border-red-300' };
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return { label: 'Expired', color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
    if (!key.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-300' };
    return { label: 'Active', color: 'bg-green-100 text-green-800 border-green-300' };
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
          <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Environment Selected</h2>
          <p className="text-gray-600">Please select an environment to view API keys.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
            <p className="text-gray-600 mt-1">
              Manage API keys for {env.display_name} environment
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          )}
        </div>

        {/* Warning Banner */}
        {env.is_production && (
          <Card className="bg-amber-50 border-amber-200">
            <div className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <strong>Production Environment:</strong> These keys have access to live data. 
                Keep them secure and rotate them regularly.
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
              </div>
              <Key className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold text-green-600">
                  {apiKeys.filter(k => k.is_active && !k.revoked_at).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revoked Keys</p>
                <p className="text-2xl font-bold text-red-600">
                  {apiKeys.filter(k => k.revoked_at).length}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-red-400" />
            </div>
          </Card>
        </div>

        {/* API Keys Table */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              API Keys ({apiKeys.length})
            </h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Rate Limits</TableHead>
                {canManage && <TableHead className="w-32">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => {
                const status = getKeyStatus(key);
                
                return (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{key.key_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {key.key_prefix}••••••••{key.key_secret_partial}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyKey(key.key_prefix, key.key_secret_partial)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-3 w-3" />
                        {formatDate(key.last_used_at)}
                      </div>
                      {key.last_used_ip && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {key.last_used_ip}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <div>{key.rate_limit_per_minute}/min</div>
                      <div className="text-xs text-gray-400">
                        {key.rate_limit_per_day.toLocaleString()}/day
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!key.revoked_at && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRotateKey(key.id)}
                                title="Rotate key"
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeKey(key.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Revoke key"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Key className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No API keys yet</p>
                    {canManage && (
                      <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First API Key
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Best Practices */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">API Key Best Practices</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Store API keys securely in environment variables, never commit them to version control</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Use separate keys for different applications or services</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Rotate keys regularly and immediately if compromised</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Use minimal scopes - only grant the permissions your application needs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Monitor key usage and set up alerts for unusual activity</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Create Modal */}
      {showCreateModal && env && (
        <CreateAPIKeyModal
          organizationId={org?.id || ''}
          environmentId={env.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAPIKeys();
          }}
        />
      )}
    </ClientLayout>
  );
}
