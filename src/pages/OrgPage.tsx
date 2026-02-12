// Organization Public Page
// Displays organization details when visiting /org/:slug

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, CheckCircle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface Organization {
  id: string;
  name: string;
  slug: string;
  planType: string;
  status: string;
  createdAt: string;
}

export default function OrgPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!slug) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/.netlify/functions/get-org-by-slug?slug=${encodeURIComponent(slug)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Organization not found');
        }

        setOrganization(data.organization);
      } catch (err: any) {
        console.error('Fetch org error:', err);
        setError(err.message || 'Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [slug]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Approval</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Enterprise</Badge>;
      case 'professional':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Professional</Badge>;
      case 'starter':
        return <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30">Starter</Badge>;
      default:
        return <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30">{plan || 'Free'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Organization Not Found</h1>
          <p className="text-neutral-400 mb-6">
            The organization you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
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
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">{organization.name}</CardTitle>
            <CardDescription className="text-neutral-400 flex items-center justify-center gap-2 mt-2">
              <span className="text-sm">fusion.paperfrogs.dev/org/{organization.slug}</span>
            </CardDescription>
            <div className="flex items-center justify-center gap-3 mt-4">
              {getStatusBadge(organization.status)}
              {getPlanBadge(organization.planType)}
            </div>
          </CardHeader>
          <CardContent className="border-t border-neutral-800 pt-6">
            <div className="grid gap-4">
              {/* Verification Status */}
              <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Powered by</p>
                  <p className="text-white font-medium">Fusion Audio Verification</p>
                </div>
              </div>

              {/* Organisation Info */}
              <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Organization ID</p>
                  <p className="text-white font-mono text-sm">{organization.id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Member Since</p>
                  <p className="text-white font-medium">
                    {new Date(organization.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <p className="text-neutral-400 text-sm text-center mb-4">
                Want to protect your audio content?
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  <Link to="/">Learn More</Link>
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/client/signup">
                    Get Started
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-neutral-500 text-sm mt-8">
          © {new Date().getFullYear()} Fusion by Paperfrogs Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
