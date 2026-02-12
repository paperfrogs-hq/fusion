import { useState } from 'react';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface ComplianceReportModalProps {
  organizationId: string;
  environmentId: string;
  onClose: () => void;
}

export default function ComplianceReportModal({ 
  organizationId, 
  environmentId, 
  onClose 
}: ComplianceReportModalProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeTamperAnalysis, setIncludeTamperAnalysis] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      toast.error('Start date must be before end date');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/.netlify/functions/generate-compliance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          environmentId,
          dateFrom,
          dateTo,
          options: {
            includeDetails,
            includeTamperAnalysis,
            includeMetadata,
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${dateFrom}-to-${dateTo}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Compliance report generated successfully');
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Compliance Report
          </DialogTitle>
          <DialogDescription>
            Create a detailed PDF report for auditing and compliance purposes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4 mt-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Start Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                End Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Report Options */}
          <div className="space-y-3 border border-neutral-800 rounded-lg p-4">
            <Label className="text-sm font-semibold">Report Contents</Label>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="includeDetails"
                checked={includeDetails}
                onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
              />
              <div className="flex-1">
                <label
                  htmlFor="includeDetails"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Detailed Verification Logs
                </label>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Complete list of all verifications with timestamps and results
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="includeTamperAnalysis"
                checked={includeTamperAnalysis}
                onCheckedChange={(checked) => setIncludeTamperAnalysis(checked as boolean)}
              />
              <div className="flex-1">
                <label
                  htmlFor="includeTamperAnalysis"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Tamper Detection Analysis
                </label>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Detailed breakdown of detected tampering incidents
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="includeMetadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <div className="flex-1">
                <label
                  htmlFor="includeMetadata"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Technical Metadata
                </label>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Audio file properties, processing times, and system information
                </p>
              </div>
            </div>
          </div>

          {/* Report Preview Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Report includes:</p>
                <ul className="space-y-1 text-blue-200">
                  <li>• Executive summary with key metrics</li>
                  <li>• Verification statistics and trends</li>
                  <li>• Success rate and confidence analysis</li>
                  <li>• Compliance certification statement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={generating}>
              Cancel
            </Button>
            <Button type="submit" disabled={generating}>
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
