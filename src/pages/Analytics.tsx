import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ClientLayout from '../components/client/ClientLayout';
import AnalyticsChart from '../components/client/AnalyticsChart';
import ComplianceReportModal from '../components/client/ComplianceReportModal';
import { getCurrentOrganization, getCurrentEnvironment } from '../lib/client-auth';
import { toast } from 'sonner';

interface AnalyticsData {
  overview: {
    total_verifications: number;
    authentic_count: number;
    tampered_count: number;
    failed_count: number;
    avg_confidence: number;
    avg_processing_time: number;
  };
  timeSeriesData: Array<{
    date: string;
    authentic: number;
    tampered: number;
    failed: number;
  }>;
  topApiKeys: Array<{
    name: string;
    count: number;
  }>;
  fileTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    count: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();

  useEffect(() => {
    if (org && env) {
      loadAnalytics();
    }
  }, [org?.id, env?.id, timeRange]);

  const loadAnalytics = async () => {
    if (!org || !env) return;

    try {
      const response = await fetch('/.netlify/functions/get-analytics-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org.id,
          environmentId: env.id,
          timeRange
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.analytics);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (!data) return 0;
    const total = data.overview.total_verifications;
    if (total === 0) return 0;
    return Math.round((data.overview.authentic_count / total) * 100);
  };

  const getTamperRate = () => {
    if (!data) return 0;
    const total = data.overview.total_verifications;
    if (total === 0) return 0;
    return Math.round((data.overview.tampered_count / total) * 100);
  };

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
          <BarChart3 className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Environment Selected</h2>
          <p className="text-neutral-400">Please select an environment to view analytics.</p>
        </div>
      </ClientLayout>
    );
  }

  if (!data) return null;

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
            <p className="text-neutral-400 mt-1">
              Insights and compliance reporting for {env.display_name}
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowComplianceModal(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Total Verifications</h3>
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {data.overview.total_verifications.toLocaleString()}
            </p>
          </Card>

          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Success Rate</h3>
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {getSuccessRate()}%
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {data.overview.authentic_count.toLocaleString()} authentic
            </p>
          </Card>

          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Tamper Detection</h3>
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {getTamperRate()}%
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {data.overview.tampered_count.toLocaleString()} tampered
            </p>
          </Card>

          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Avg Confidence</h3>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(data.overview.avg_confidence)}%
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {data.overview.avg_processing_time}ms avg time
            </p>
          </Card>
        </div>

        {/* Verification Trends Chart */}
        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Verification Trends
          </h3>
          <AnalyticsChart 
            data={data.timeSeriesData}
            type="line"
            xKey="date"
            lines={[
              { key: 'authentic', color: '#10b981', name: 'Authentic' },
              { key: 'tampered', color: '#ef4444', name: 'Tampered' },
              { key: 'failed', color: '#6b7280', name: 'Failed' },
            ]}
          />
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top API Keys */}
          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top API Keys
            </h3>
            <div className="space-y-4">
              {data.topApiKeys.map((apiKey, idx) => {
                const maxCount = data.topApiKeys[0]?.count || 1;
                const percentage = (apiKey.count / maxCount) * 100;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white font-medium truncate">
                        {apiKey.name}
                      </span>
                      <span className="text-neutral-400 ml-2">
                        {apiKey.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {data.topApiKeys.length === 0 && (
                <p className="text-center text-neutral-500 py-8">No API key usage data</p>
              )}
            </div>
          </Card>

          {/* File Type Distribution */}
          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              File Type Distribution
            </h3>
            <div className="space-y-4">
              {data.fileTypeDistribution.map((fileType, idx) => {
                const total = data.fileTypeDistribution.reduce((sum, ft) => sum + ft.count, 0);
                const percentage = total > 0 ? (fileType.count / total) * 100 : 0;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white font-medium">
                        {fileType.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">
                          {fileType.count.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {data.fileTypeDistribution.length === 0 && (
                <p className="text-center text-neutral-500 py-8">No file type data</p>
              )}
            </div>
          </Card>
        </div>

        {/* Hourly Distribution */}
        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usage by Hour of Day
          </h3>
          <AnalyticsChart 
            data={data.hourlyDistribution}
            type="bar"
            xKey="hour"
            bars={[
              { key: 'count', color: '#3b82f6', name: 'Verifications' },
            ]}
            xAxisFormatter={(hour) => `${hour}:00`}
          />
        </Card>

        {/* Compliance Summary */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                Compliance Reporting
              </h3>
              <p className="text-blue-200/80 mb-4">
                Generate detailed compliance reports for auditing and regulatory requirements. 
                Reports include verification statistics, tamper detection summaries, and detailed activity logs.
              </p>
              <Button 
                onClick={() => setShowComplianceModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Compliance Report
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Compliance Report Modal */}
      {showComplianceModal && (
        <ComplianceReportModal
          organizationId={org?.id || ''}
          environmentId={env.id}
          onClose={() => setShowComplianceModal(false)}
        />
      )}
    </ClientLayout>
  );
}
