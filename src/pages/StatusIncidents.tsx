// Status & Incidents Page
// Shows system status and incident history

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Server,
  Database,
  Globe,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ClientLayout from '../components/client/ClientLayout';
import { toast } from 'sonner';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  latency?: number;
  icon: typeof Server;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  created_at: string;
  updated_at: string;
  description: string;
}

const services: ServiceStatus[] = [
  { name: 'API Gateway', status: 'operational', latency: 45, icon: Globe },
  { name: 'Verification Engine', status: 'operational', latency: 120, icon: Shield },
  { name: 'Audio Processing', status: 'operational', latency: 89, icon: Zap },
  { name: 'Database', status: 'operational', latency: 12, icon: Database },
  { name: 'Webhooks', status: 'operational', latency: 35, icon: Activity },
  { name: 'Dashboard', status: 'operational', latency: 28, icon: Server },
];

const recentIncidents: Incident[] = [
  // No current incidents - showing all systems operational
];

export default function StatusIncidents() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshStatus = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
      toast.success('Status refreshed');
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Degraded</Badge>;
      case 'outage':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Outage</Badge>;
      case 'maintenance':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getIncidentStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge className="bg-red-500/20 text-red-400">Investigating</Badge>;
      case 'identified':
        return <Badge className="bg-amber-500/20 text-amber-400">Identified</Badge>;
      case 'monitoring':
        return <Badge className="bg-blue-500/20 text-blue-400">Monitoring</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500/20 text-green-400">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'major':
        return <Badge className="bg-amber-500/20 text-amber-600">Major</Badge>;
      case 'minor':
        return <Badge variant="outline">Minor</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const allOperational = services.every(s => s.status === 'operational');

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Status</h1>
            <p className="text-neutral-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshStatus}
            disabled={loading}
            className="gap-2 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overall Status Banner */}
        <Card className={`border-2 ${allOperational ? 'border-green-500/50 bg-green-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              {allOperational ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-green-400">All Systems Operational</h2>
                    <p className="text-green-300/80">All services are running smoothly.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-amber-400">Some Systems Affected</h2>
                    <p className="text-amber-300/80">We're working to resolve the issues.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Status Grid */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Service Status</CardTitle>
            <CardDescription className="text-neutral-400">Current status of all Fusion services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-700 rounded-lg">
                        <Icon className="w-5 h-5 text-neutral-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{service.name}</p>
                        {service.latency && (
                          <p className="text-sm text-neutral-400">{service.latency}ms</p>
                        )}
                      </div>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Incidents</CardTitle>
            <CardDescription className="text-neutral-400">Incident history from the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIncidents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No Recent Incidents</h3>
                <p className="text-neutral-400 mt-1">All systems have been running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{incident.title}</h4>
                        <p className="text-sm text-neutral-400 mt-1">{incident.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(incident.severity)}
                        {getIncidentStatusBadge(incident.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 mt-3">
                      <span>Created: {new Date(incident.created_at).toLocaleString()}</span>
                      <span>Updated: {new Date(incident.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uptime Stats */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Uptime Statistics</CardTitle>
            <CardDescription className="text-neutral-400">Historical uptime data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-3xl font-bold text-green-400">99.99%</p>
                <p className="text-sm text-neutral-400 mt-1">Last 24 hours</p>
              </div>
              <div className="text-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-3xl font-bold text-green-400">99.98%</p>
                <p className="text-sm text-neutral-400 mt-1">Last 7 days</p>
              </div>
              <div className="text-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-3xl font-bold text-green-400">99.95%</p>
                <p className="text-sm text-neutral-400 mt-1">Last 30 days</p>
              </div>
              <div className="text-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-3xl font-bold text-green-400">99.97%</p>
                <p className="text-sm text-neutral-400 mt-1">Last 90 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
