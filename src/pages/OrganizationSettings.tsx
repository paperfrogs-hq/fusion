import { useState, useEffect } from 'react';
import { Save, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ClientLayout from '../components/client/ClientLayout';
import { getCurrentOrganization } from '../lib/client-auth';
import { toast } from 'sonner';

export default function OrganizationSettings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
  });

  const org = getCurrentOrganization();
  const canManage = org && (org.role === 'owner' || org.role === 'admin');

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        website: '',
        description: '',
      });
    }
  }, [org]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('You do not have permission to update organization settings');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/update-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: org?.id,
          ...formData,
        }),
      });

      if (response.ok) {
        // Update local storage
        const updatedOrg = { ...org, ...formData };
        localStorage.setItem('fusion_current_org', JSON.stringify(updatedOrg));
        toast.success('Organization settings updated');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <Building2 className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400">You don't have permission to manage organization settings.</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
          <p className="text-neutral-400 mt-1">Manage your organization's information</p>
        </div>

        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your organization..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ClientLayout>
  );
}
