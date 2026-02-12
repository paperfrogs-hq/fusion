import { useState, useEffect } from 'react';
import { 
  Shield, 
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ClientLayout from '../components/client/ClientLayout';
import VerificationDetailModal from '../components/client/VerificationDetailModal';
import ActivityFilters from '../components/client/ActivityFilters';
import { getCurrentOrganization, getCurrentEnvironment } from '../lib/client-auth';
import { toast } from 'sonner';

interface VerificationActivity {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  result: 'authentic' | 'tampered' | 'failed';
  confidence_score?: number;
  processing_time_ms: number;
  api_key_name: string;
  created_at: string;
  metadata?: any;
}

interface Filters {
  result?: string;
  dateFrom?: string;
  dateTo?: string;
  apiKey?: string;
}

export default function VerificationActivity() {
  const [activities, setActivities] = useState<VerificationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();
  const itemsPerPage = 20;

  useEffect(() => {
    if (org && env) {
      loadActivity();
    }
  }, [org?.id, env?.id, currentPage, searchQuery, filters]);

  const loadActivity = async () => {
    if (!org || !env) return;

    try {
      const response = await fetch('/.netlify/functions/get-verification-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org.id,
          environmentId: env.id,
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          filters
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        toast.error('Failed to load activity');
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!org || !env) return;

    setExporting(true);
    try {
      const response = await fetch('/.netlify/functions/export-verification-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizationId: org.id,
          environmentId: env.id,
          search: searchQuery,
          filters
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-activity-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Activity exported successfully');
      } else {
        toast.error('Failed to export activity');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export activity');
    } finally {
      setExporting(false);
    }
  };

  const getResultIcon = (result: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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
          <Shield className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Environment Selected</h2>
          <p className="text-neutral-400">Please select an environment to view activity.</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Verification Activity</h1>
            <p className="text-neutral-400 mt-1">
              Complete history of audio verifications in {env.display_name}
            </p>
          </div>
          <Button onClick={handleExport} disabled={exporting || activities.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-neutral-900 border-neutral-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search by file name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <ActivityFilters 
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }}
            />
          )}
        </Card>

        {/* Activity Table */}
        <Card className="bg-neutral-900 border-neutral-800">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-700 hover:bg-neutral-800/50">
                <TableHead className="text-neutral-300">File</TableHead>
                <TableHead className="text-neutral-300">Result</TableHead>
                <TableHead className="text-neutral-300">Confidence</TableHead>
                <TableHead className="text-neutral-300">API Key</TableHead>
                <TableHead className="text-neutral-300">Processing Time</TableHead>
                <TableHead className="text-neutral-300">Date</TableHead>
                <TableHead className="w-20 text-neutral-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id} className="border-neutral-700 hover:bg-neutral-800/50">
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {getResultIcon(activity.result)}
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate max-w-xs">
                          {activity.file_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                          <span>{activity.file_type}</span>
                          <span>•</span>
                          <span>{formatFileSize(activity.file_size)}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getResultBadge(activity.result)}
                  </TableCell>
                  <TableCell>
                    {activity.confidence_score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-neutral-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              activity.confidence_score >= 90 ? 'bg-green-500' :
                              activity.confidence_score >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${activity.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium">
                          {Math.round(activity.confidence_score)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-500">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400">
                    {activity.api_key_name}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400">
                    {activity.processing_time_ms}ms
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400">
                    {formatDate(activity.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-white"
                      onClick={() => setSelectedActivity(activity.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {activities.length === 0 && (
                <TableRow className="border-neutral-700">
                  <TableCell colSpan={7} className="text-center py-12">
                    <Shield className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400 mb-2">No verification activity found</p>
                    <p className="text-sm text-neutral-500">
                      {searchQuery || Object.keys(filters).length > 0
                        ? 'Try adjusting your search or filters'
                        : 'Start verifying audio files using your API keys'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-700">
              <p className="text-sm text-neutral-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedActivity && (
        <VerificationDetailModal
          verificationId={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </ClientLayout>
  );
}
