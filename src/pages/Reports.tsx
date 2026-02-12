// Reports & Exports Page
// Generate compliance reports and export verification data

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  FileSpreadsheet,
  File,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ClientLayout from '../components/client/ClientLayout';
import { getCurrentOrganization, getCurrentEnvironment } from '../lib/client-auth';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: 'compliance' | 'verification' | 'analytics' | 'audit';
  status: 'ready' | 'generating' | 'failed';
  format: 'pdf' | 'csv' | 'xlsx';
  created_at: string;
  file_size?: string;
}

const reportTemplates = [
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'Full compliance report with verification history and audit trail',
    icon: FileText,
    format: 'pdf',
  },
  {
    id: 'verification',
    name: 'Verification Export',
    description: 'Export all verification records with metadata',
    icon: FileSpreadsheet,
    format: 'csv',
  },
  {
    id: 'analytics',
    name: 'Analytics Summary',
    description: 'Monthly analytics and usage statistics',
    icon: FileText,
    format: 'pdf',
  },
  {
    id: 'audit',
    name: 'Audit Log',
    description: 'Complete audit trail of all actions',
    icon: FileSpreadsheet,
    format: 'xlsx',
  },
];

const recentReports: Report[] = [
  {
    id: '1',
    name: 'Compliance Report - Jan 2026',
    type: 'compliance',
    status: 'ready',
    format: 'pdf',
    created_at: '2026-01-31T10:00:00Z',
    file_size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Verification Export - Q4 2025',
    type: 'verification',
    status: 'ready',
    format: 'csv',
    created_at: '2026-01-15T14:30:00Z',
    file_size: '15.2 MB',
  },
];

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('all');

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();

  const handleGenerateReport = async (templateId: string) => {
    if (!org) return;

    setGenerating(templateId);
    toast.info('Generating report...');

    try {
      const response = await fetch('/.netlify/functions/generate-compliance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: org.id,
          environmentId: env?.id,
          reportType: templateId,
          dateRange: parseInt(dateRange),
        }),
      });

      if (response.ok) {
        toast.success('Report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500/20 text-blue-400"><Clock className="w-3 h-3 mr-1" />Generating</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <File className="w-4 h-4 text-red-500" />;
      case 'csv':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Exports</h1>
          <p className="text-neutral-400 mt-1">
            Generate compliance reports and export your verification data
          </p>
        </div>

        {/* Filter Options */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="w-5 h-5" />
              Report Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-neutral-300">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Environment</Label>
                <Input value={env?.display_name || 'All Environments'} disabled className="bg-neutral-800 border-neutral-700 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Generate New Report</CardTitle>
            <CardDescription className="text-neutral-400">Choose a report template to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                const isGenerating = generating === template.id;
                
                return (
                  <div
                    key={template.id}
                    className="flex items-start justify-between p-4 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors bg-neutral-800/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <p className="text-sm text-neutral-400 mt-0.5">{template.description}</p>
                        <Badge variant="outline" className="mt-2 border-neutral-600 text-neutral-300">{template.format.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(template.id)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Reports</CardTitle>
            <CardDescription className="text-neutral-400">Previously generated reports available for download</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No Reports Yet</h3>
                <p className="text-neutral-400 mt-1">Generate your first report using the templates above.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700 hover:bg-neutral-800/50">
                    <TableHead className="text-neutral-300">Report Name</TableHead>
                    <TableHead className="text-neutral-300">Type</TableHead>
                    <TableHead className="text-neutral-300">Format</TableHead>
                    <TableHead className="text-neutral-300">Status</TableHead>
                    <TableHead className="text-neutral-300">Created</TableHead>
                    <TableHead className="text-neutral-300">Size</TableHead>
                    <TableHead className="text-right text-neutral-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => (
                    <TableRow key={report.id} className="border-neutral-700 hover:bg-neutral-800/50">
                      <TableCell className="font-medium text-white">{report.name}</TableCell>
                      <TableCell className="capitalize text-neutral-300">{report.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-neutral-300">
                          {getFormatIcon(report.format)}
                          {report.format.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-neutral-300">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-neutral-300">{report.file_size || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" disabled={report.status !== 'ready'} className="border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
