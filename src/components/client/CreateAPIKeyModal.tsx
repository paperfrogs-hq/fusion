import { useState } from 'react';
import { Key, AlertTriangle, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface CreateAPIKeyModalProps {
  organizationId: string;
  environmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const availableScopes = [
  { id: 'verify', label: 'Verify Audio', description: 'Verify audio authenticity and detect tampering' },
  { id: 'audit', label: 'Audit & Reports', description: 'Generate audit reports and proof of verification' },
  { id: 'extract_metadata', label: 'Extract Metadata', description: 'Extract audio metadata and provenance information' },
  { id: 'webhook_manage', label: 'Manage Webhooks', description: 'Configure and manage webhook endpoints' },
];

export default function CreateAPIKeyModal({ 
  organizationId, 
  environmentId, 
  onClose, 
  onSuccess 
}: CreateAPIKeyModalProps) {
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['verify']);
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId)
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    if (selectedScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/create-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          environmentId,
          keyName: keyName.trim(),
          scopes: selectedScopes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKey(data.fullKey);
        toast.success('API key created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create API key');
        setLoading(false);
      }
    } catch (error) {
      console.error('Create API key error:', error);
      toast.error('Failed to create API key');
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    onSuccess();
  };

  if (newKey) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              API Key Created Successfully
            </DialogTitle>
            <DialogDescription>
              Save this key now. For security reasons, it won't be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <strong>Important:</strong> Copy this key now and store it securely. 
                  You won't be able to see the full key again after closing this dialog.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-900 text-green-400 px-4 py-3 rounded font-mono break-all">
                  {newKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Store this key in your environment variables</li>
                <li>Never commit it to version control</li>
                <li>Use it in your API requests as: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer {'{key}'}</code></li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={handleDone} className="w-full">
                I've Saved the Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create API Key
          </DialogTitle>
          <DialogDescription>
            Generate a new API key with specific permissions for your application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input
              id="keyName"
              placeholder="e.g., Production App, Mobile Client, Testing"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              A descriptive name to help you identify this key
            </p>
          </div>

          <div className="space-y-2">
            <Label>Scopes (Permissions)</Label>
            <div className="space-y-3 border border-gray-200 rounded-md p-3">
              {availableScopes.map((scope) => (
                <div key={scope.id} className="flex items-start gap-3">
                  <Checkbox
                    id={scope.id}
                    checked={selectedScopes.includes(scope.id)}
                    onCheckedChange={() => handleScopeToggle(scope.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={scope.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {scope.label}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {scope.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Select the minimum permissions needed for your use case
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
            <strong>Rate Limits:</strong> Default limits are 100 requests/min and 10,000 requests/day. 
            Contact support for higher limits.
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create API Key'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
