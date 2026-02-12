// Accept Invitation Page
// Allows users to accept team invitations

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Users, Check, X, Loader2, Clock, AlertTriangle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, setOrganizations } from '../lib/client-auth';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    plan_type: string;
  };
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailRegistered, setEmailRegistered] = useState<boolean | null>(null);

  const user = getCurrentUser();

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/.netlify/functions/get-invitation?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invitation');
        }

        setInvitation(data.invitation);

        // Check if the invited email is registered
        const checkResponse = await fetch(`/.netlify/functions/check-email-exists?email=${encodeURIComponent(data.invitation.email)}`);
        const checkData = await checkResponse.json();
        setEmailRegistered(checkData.exists || false);
      } catch (err: any) {
        console.error('Fetch invitation error:', err);
        setError(err.message || 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Store the invite URL and redirect to login
      sessionStorage.setItem('pendingInvite', window.location.href);
      navigate('/client/login');
      return;
    }

    if (!invitation || !token) return;

    setAccepting(true);
    try {
      const response = await fetch('/.netlify/functions/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast.success(data.message || 'Invitation accepted!');

      // Refresh organizations list
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

      // Redirect to select org or dashboard
      navigate('/client/select-org');
    } catch (err: any) {
      console.error('Accept invitation error:', err);
      toast.error(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      developer: 'bg-green-500/20 text-green-400 border-green-500/30',
      analyst: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      read_only: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
    };
    return <Badge className={roleColors[role] || roleColors.read_only}>{role.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Invalid Invitation</CardTitle>
              <CardDescription className="text-neutral-400">{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="mt-4">
                <Link to="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Team Invitation</CardTitle>
            <CardDescription className="text-neutral-400">
              You've been invited to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Info */}
            <div className="p-4 bg-neutral-800/50 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-neutral-300" />
                </div>
                <div>
                  <p className="text-white font-semibold">{invitation.organization.name}</p>
                  <p className="text-sm text-neutral-400">fusion.paperfrogs.dev/org/{invitation.organization.slug}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                <span className="text-sm text-neutral-400">Your role:</span>
                {getRoleBadge(invitation.role)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Plan:</span>
                <Badge className="bg-neutral-700 text-neutral-300">{invitation.organization.plan_type || 'Trial'}</Badge>
              </div>
            </div>

            {/* Expiration Notice */}
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-300">
                This invitation expires on {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>

            {/* Email Match Warning */}
            {user && user.email?.toLowerCase() !== invitation.email.toLowerCase() && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-300">
                  <p className="font-medium">Email mismatch</p>
                  <p>This invitation was sent to <span className="font-mono">{invitation.email}</span></p>
                  <p>You are logged in as <span className="font-mono">{user.email}</span></p>
                </div>
              </div>
            )}

            {/* Email Not Registered Warning */}
            {!user && emailRegistered === false && (
              <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-300">
                  <p className="font-medium">Email not registered</p>
                  <p>The email <span className="font-mono">{invitation.email}</span> is not registered.</p>
                  <p>Please sign up with this email to accept the invitation.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    onClick={() => navigate('/')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAccept}
                    disabled={accepting || (user.email?.toLowerCase() !== invitation.email.toLowerCase())}
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                </>
              ) : emailRegistered === false ? (
                <Button className="w-full" asChild>
                  <Link to={`/client/signup?email=${encodeURIComponent(invitation.email)}&invite=${encodeURIComponent(token || '')}`}>
                    <Users className="h-4 w-4 mr-2" />
                    Sign Up to Accept
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" onClick={handleAccept}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login to Accept
                </Button>
              )}
            </div>

            {/* Login Link */}
            {!user && emailRegistered === true && (
              <p className="text-center text-sm text-neutral-400">
                Already have an account?{' '}
                <Link to={`/client/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            )}
            {!user && emailRegistered === false && (
              <p className="text-center text-sm text-neutral-400">
                Already have an account with a different email?{' '}
                <Link to="/client/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
