import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  type: 'verification.completed' | 'verification.failed' | 'tamper.detected';
  file_name: string;
  result: 'authentic' | 'tampered' | 'failed';
  confidence_score?: number;
  created_at: string;
  api_key_name?: string;
}

interface RecentActivityFeedProps {
  organizationId: string;
  environmentId: string;
}

export default function RecentActivityFeed({ organizationId, environmentId }: RecentActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
    // Refresh every 30 seconds
    const interval = setInterval(loadRecentActivity, 30000);
    return () => clearInterval(interval);
  }, [organizationId, environmentId]);

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-recent-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId,
          environmentId,
          limit: 10
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, result: string) => {
    if (result === 'authentic') {
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    }
    if (result === 'tampered') {
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
    return <XCircle className="h-5 w-5 text-neutral-500" />;
  };

  const getResultBadge = (result: string) => {
    if (result === 'authentic') {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Authentic</Badge>;
    }
    if (result === 'tampered') {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Tampered</Badge>;
    }
    return <Badge variant="outline">Failed</Badge>;
  };

  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Verifications</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.location.href = '/client/activity'}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-muted-foreground">No verification activity yet</p>
          <p className="text-sm text-muted-foreground">
            Start verifying audio files using your API keys
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/60"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type, activity.result)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {activity.file_name}
                    </p>
                    {activity.api_key_name && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        via {activity.api_key_name}
                      </p>
                    )}
                  </div>
                  {getResultBadge(activity.result)}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(activity.created_at)}
                  </div>
                  {activity.confidence_score !== undefined && (
                    <span>
                      Confidence: {Math.round(activity.confidence_score)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
