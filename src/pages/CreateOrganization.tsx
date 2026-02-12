// Create Organization Page
// Allows logged-in users to create a new organization

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { getCurrentUser, setOrganizations } from '../lib/client-auth';
import { toast } from 'sonner';

export default function CreateOrganization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const user = getCurrentUser();

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/client/login');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/create-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name.trim(),
          slug: formData.slug
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      toast.success('Organization created successfully!');
      
      // Fetch updated organizations list
      const orgsResponse = await fetch('/.netlify/functions/get-user-organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        if (orgsData.organizations) {
          setOrganizations(orgsData.organizations);
        }
      }
      
      navigate('/client/select-org');
    } catch (error: any) {
      console.error('Create org error:', error);
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/client/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-neutral-400 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Create Organization</CardTitle>
            <CardDescription className="text-neutral-400">
              Set up a new organization to manage your verification projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-300">Organization Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-neutral-300">Organization URL</Label>
                <div className="flex items-center">
                  <span className="text-neutral-500 text-sm mr-2">fusion.paperfrogs.dev/</span>
                  <Input
                    id="slug"
                    type="text"
                    placeholder="acme-corp"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  This will be your organization's unique identifier
                </p>
              </div>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Included in Free Plan:</h4>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>• 1,000 verifications/month</li>
                  <li>• 14-day trial period</li>
                  <li>• 2 team members</li>
                  <li>• Basic API access</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
