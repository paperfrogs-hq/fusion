import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Key,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Zap,
  Shield,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ClientLayout from '../components/client/ClientLayout';
import QuickStatsCard from '../components/client/QuickStatsCard';
import RecentActivityFeed from '../components/client/RecentActivityFeed';
import QuickStartGuide from '../components/client/QuickStartGuide';
import { getCurrentOrganization, getCurrentEnvironment, getQuotaUsagePercent } from '../lib/client-auth';
import { toast } from 'sonner';

interface DashboardStats {
  total_verifications: number;
  verifications_today: number;
  verifications_this_month: number;
  success_rate: number;
  total_api_keys: number;
  active_api_keys: number;
  total_webhooks: number;
  active_webhooks: number;
  tamper_detected_count: number;
  quota_used: number;
  quota_limit: number;
  avg_response_time_ms: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();

  useEffect(() => {
    if (org && env) {
      loadDashboardStats();
    }
  }, [org?.id, env?.id]);

  const loadDashboardStats = async () => {
    if (!org || !env) return;

    try {
      const response = await fetch('/.netlify/functions/get-dashboard-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org.id,
          environmentId: env.id 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const quotaPercent = stats ? getQuotaUsagePercent(org) : 0;
  const hasApiKeys = stats && stats.total_api_keys > 0;

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ClientLayout>
    );
  }

  if (!env) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">No Environment Selected</h2>
          <p className="text-muted-foreground">Please select an environment to view dashboard.</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of {env.display_name} environment
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStatsCard
            title="Total Verifications"
            value={stats?.total_verifications || 0}
            change={stats?.verifications_today || 0}
            changeLabel="today"
            icon={Shield}
            color="blue"
          />
          <QuickStatsCard
            title="Success Rate"
            value={`${stats?.success_rate || 0}%`}
            icon={CheckCircle2}
            color="green"
          />
          <QuickStatsCard
            title="Active API Keys"
            value={stats?.active_api_keys || 0}
            total={stats?.total_api_keys || 0}
            icon={Key}
            color="purple"
          />
          <QuickStatsCard
            title="Avg Response Time"
            value={`${stats?.avg_response_time_ms || 0}ms`}
            icon={Zap}
            color="yellow"
          />
        </div>

        {/* Quota Usage */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Monthly Quota Usage</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.quota_used || 0} of {stats?.quota_limit || 0} verifications used
              </p>
            </div>
            <Badge 
              className={
                quotaPercent >= 90 ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                quotaPercent >= 80 ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                'bg-green-500/20 text-green-400 border-green-500/50'
              }
            >
              {quotaPercent}% used
            </Badge>
          </div>
          <Progress value={quotaPercent} className="h-3" />
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-muted-foreground">
              {(stats?.quota_limit || 0) - (stats?.quota_used || 0)} remaining
            </span>
            {quotaPercent >= 80 && (
              <Button variant="link" className="text-primary p-0 h-auto">
                Upgrade Plan <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - 2 columns */}
          <div className="lg:col-span-2">
            <RecentActivityFeed 
              organizationId={org?.id || ''}
              environmentId={env.id}
            />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Security Alerts */}
            {stats && stats.tamper_detected_count > 0 && (
              <Card className="p-4 border-red-500/50 bg-red-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-400 mb-1">Security Alert</h4>
                    <p className="text-sm text-red-300 mb-3">
                      {stats.tamper_detected_count} tampered audio file{stats.tamper_detected_count !== 1 ? 's' : ''} detected this month
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-400 border-red-500/50 hover:bg-red-500/20"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-foreground">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => window.location.href = '/client/api-keys'}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Manage API Keys
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => window.location.href = '/client/webhooks'}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Configure Webhooks
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => window.location.href = '/client/analytics'}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </Card>

            {/* Team Activity */}
            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-foreground">Team</h3>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Active members</span>
                </div>
                <span className="font-semibold text-foreground">
                  1
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => window.location.href = '/client/team'}
              >
                Manage Team
              </Button>
            </Card>
          </div>
        </div>

        {/* Quick Start Guide (shown if no API keys) */}
        {!hasApiKeys && (
          <QuickStartGuide organizationId={org?.id || ''} environmentId={env.id} />
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Webhooks</h4>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.active_webhooks || 0} <span className="text-base font-normal text-muted-foreground">/ {stats?.total_webhooks || 0}</span>
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <Button 
              variant="link" 
              className="text-primary p-0 h-auto mt-2 text-sm"
              onClick={() => window.location.href = '/client/webhooks'}
            >
              Configure webhooks <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">System Status</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">All Systems Operational</span>
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <Button 
              variant="link" 
              className="text-primary p-0 h-auto mt-2 text-sm"
              onClick={() => window.location.href = '/client/status'}
            >
              View status page <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
