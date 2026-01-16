import { useState, useEffect } from 'react';
import { X, Shield, CheckCircle2, XCircle, AlertTriangle, Copy, Check, Clock, Key, FileAudio } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface VerificationDetail {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_hash: string;
  result: 'authentic' | 'tampered' | 'failed';
  confidence_score?: number;
  processing_time_ms: number;
  api_key_name: string;
  created_at: string;
  metadata?: {
    duration_seconds?: number;
    sample_rate?: number;
    channels?: number;
    codec?: string;
  };
  tamper_indicators?: string[];
  verification_method?: string;
  request_id: string;
}

interface VerificationDetailModalProps {
  verificationId: string;
  onClose: () => void;
}

export default function VerificationDetailModal({ verificationId, onClose }: VerificationDetailModalProps) {
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadDetail();
  }, [verificationId]);

  const loadDetail = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-verification-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setDetail(data.verification);
      } else {
        toast.error('Failed to load verification details');
      }
    } catch (error) {
      console.error('Failed to load details:', error);
      toast.error('Failed to load verification details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getResultIcon = (result: string) => {
    if (result === 'authentic') {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    }
    if (result === 'tampered') {
      return <AlertTriangle className="h-6 w-6 text-red-600" />;
    }
    return <XCircle className="h-6 w-6 text-gray-400" />;
  };

  const getResultBadge = (result: string) => {
    if (result === 'authentic') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Authentic</Badge>;
    }
    if (result === 'tampered') {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Tampered</Badge>;
    }
    return <Badge variant="outline">Failed</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!detail) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="text-center py-12">
            <p className="text-gray-500">Verification not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getResultIcon(detail.result)}
            <span>Verification Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Result Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Result</h3>
              {getResultBadge(detail.result)}
            </div>
            {detail.confidence_score !== undefined && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Confidence Score</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(detail.confidence_score)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      detail.confidence_score >= 90 ? 'bg-green-600' :
                      detail.confidence_score >= 70 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${detail.confidence_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tamper Indicators */}
          {detail.tamper_indicators && detail.tamper_indicators.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Detected Issues
              </h3>
              <ul className="space-y-2">
                {detail.tamper_indicators.map((indicator, idx) => (
                  <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* File Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              File Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">File Name</p>
                <p className="text-sm text-gray-900 font-medium truncate">
                  {detail.file_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">File Size</p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatFileSize(detail.file_size)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">File Type</p>
                <p className="text-sm text-gray-900 font-medium">
                  {detail.file_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                <p className="text-sm text-gray-900 font-medium">
                  {detail.processing_time_ms}ms
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">File Hash (SHA-256)</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-3 py-2 rounded flex-1 break-all">
                  {detail.file_hash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(detail.file_hash, 'hash')}
                >
                  {copied === 'hash' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Audio Metadata */}
          {detail.metadata && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Audio Properties</h3>
              <div className="grid grid-cols-2 gap-4">
                {detail.metadata.duration_seconds !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {formatDuration(detail.metadata.duration_seconds)}
                    </p>
                  </div>
                )}
                {detail.metadata.sample_rate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sample Rate</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {detail.metadata.sample_rate} Hz
                    </p>
                  </div>
                )}
                {detail.metadata.channels && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Channels</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {detail.metadata.channels === 1 ? 'Mono' : detail.metadata.channels === 2 ? 'Stereo' : `${detail.metadata.channels} channels`}
                    </p>
                  </div>
                )}
                {detail.metadata.codec && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Codec</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {detail.metadata.codec}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Verification Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  API Key
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {detail.api_key_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Verified At
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(detail.created_at).toLocaleString()}
                </p>
              </div>
              {detail.verification_method && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Method</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {detail.verification_method}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Request ID</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-3 py-2 rounded flex-1">
                  {detail.request_id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(detail.request_id, 'request')}
                >
                  {copied === 'request' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
