import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Crown, Users, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  getOrganizations, 
  setCurrentOrganization,
  getCurrentUser,
  Organization 
} from '../lib/client-auth';

export default function ClientSelectOrg() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const orgs = getOrganizations();
    
    if (orgs.length === 0) {
      // No orgs, shouldn't happen but redirect to login
      navigate('/client/login');
      return;
    }
    
    if (orgs.length === 1) {
      // Only one org, auto-select and redirect
      setCurrentOrganization(orgs[0]);
      navigate('/client/dashboard');
      return;
    }
    
    setOrganizations(orgs);
    setLoading(false);
  }, [navigate]);

  const handleSelectOrg = (org: Organization) => {
    setCurrentOrganization(org);
    navigate('/client/dashboard');
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-600 text-white';
      case 'professional': return 'bg-blue-600 text-white';
      case 'starter': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getRoleIcon = (role?: string) => {
    if (role === 'owner') return <Crown className="h-4 w-4 text-yellow-500" />;
    return <Users className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-gray-900 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Organization
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.full_name}. Choose an organization to continue.
          </p>
        </div>

        {/* Organization List */}
        <div className="space-y-4">
          {organizations.map((org) => (
            <Card 
              key={org.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-300"
              onClick={() => handleSelectOrg(org)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {org.logo_url ? (
                      <img 
                        src={org.logo_url} 
                        alt={org.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {org.name}
                        </h3>
                        {getRoleIcon(org.role)}
                      </div>
                      <p className="text-sm text-gray-500">
                        @{org.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Badge className={getPlanBadgeColor(org.plan_type)}>
                      {org.plan_type.charAt(0).toUpperCase() + org.plan_type.slice(1)} Plan
                    </Badge>
                    
                    <Badge variant="outline" className="capitalize">
                      {org.role || 'Member'}
                    </Badge>
                    
                    {org.billing_status === 'trial' && org.trial_ends_at && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Trial expires {new Date(org.trial_ends_at).toLocaleDateString()}
                      </Badge>
                    )}
                    
                    {org.account_status === 'suspended' && (
                      <Badge variant="destructive">
                        Suspended
                      </Badge>
                    )}
                  </div>

                  {org.billing_status === 'past_due' && (
                    <div className="mt-3 text-sm text-red-600">
                      ⚠️ Payment past due. Update billing to continue.
                    </div>
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-4"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button
            variant="link"
            onClick={() => {
              localStorage.clear();
              navigate('/client/login');
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
