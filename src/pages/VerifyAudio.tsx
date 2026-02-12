import { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileAudio, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Music,
  Shield,
  Clock,
  Hash,
  User,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ClientLayout from '../components/client/ClientLayout';
import { getCurrentOrganization, getCurrentEnvironment, getCurrentUser } from '../lib/client-auth';
import { toast } from 'sonner';

interface VerificationResult {
  id: string;
  filename: string;
  fileSize: number;
  result: 'authentic' | 'tampered' | 'unverified';
  confidenceScore: number;
  processingTimeMs: number;
  originDetected: string;
  tamperDetected: boolean;
  tamperIndicators: string[];
  hash: string;
  timestamp: string;
  quotaRemaining: number;
}

interface QueuedFile {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'verifying' | 'completed' | 'error';
  progress: number;
  result?: VerificationResult;
  error?: string;
}

const ALLOWED_FORMATS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function VerifyAudio() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const org = getCurrentOrganization();
  const env = getCurrentEnvironment();
  const user = getCurrentUser();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FORMATS.includes(ext)) {
      return `Unsupported format. Allowed: ${ALLOWED_FORMATS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: 100MB`;
    }
    return null;
  };

  const addFilesToQueue = (files: FileList | File[]) => {
    const newFiles: QueuedFile[] = [];
    
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }
      
      // Check if already in queue
      if (queue.some(q => q.file.name === file.name && q.file.size === file.size)) {
        toast.error(`${file.name} is already in queue`);
        return;
      }
      
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        status: 'queued',
        progress: 0,
      });
    });

    if (newFiles.length > 0) {
      setQueue(prev => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s) to queue`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  }, [queue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/mp3;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const verifyFile = async (queuedFile: QueuedFile): Promise<VerificationResult | null> => {
    if (!org || !env) return null;

    // Update status to uploading
    setQueue(prev => prev.map(q => 
      q.id === queuedFile.id ? { ...q, status: 'uploading', progress: 10 } : q
    ));

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(queuedFile.file);
      
      setQueue(prev => prev.map(q => 
        q.id === queuedFile.id ? { ...q, status: 'verifying', progress: 50 } : q
      ));

      // Call verification API
      const response = await fetch('/.netlify/functions/client-verify-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: org.id,
          environmentId: env.id,
          userId: user?.id,
          fileData: base64Data,
          fileName: queuedFile.file.name,
          fileSize: queuedFile.file.size,
        }),
      });

      setQueue(prev => prev.map(q => 
        q.id === queuedFile.id ? { ...q, progress: 90 } : q
      ));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      const data = await response.json();
      
      setQueue(prev => prev.map(q => 
        q.id === queuedFile.id ? { 
          ...q, 
          status: 'completed', 
          progress: 100, 
          result: data.verification 
        } : q
      ));

      return data.verification;
    } catch (error: any) {
      setQueue(prev => prev.map(q => 
        q.id === queuedFile.id ? { 
          ...q, 
          status: 'error', 
          progress: 0, 
          error: error.message 
        } : q
      ));
      return null;
    }
  };

  const processQueue = async () => {
    const queuedItems = queue.filter(q => q.status === 'queued');
    if (queuedItems.length === 0) {
      toast.error('No files in queue to verify');
      return;
    }

    setIsProcessing(true);

    let successCount = 0;
    let failCount = 0;

    for (const item of queuedItems) {
      const result = await verifyFile(item);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0 && failCount === 0) {
      toast.success(`Successfully verified ${successCount} file(s)`);
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`Verified ${successCount} file(s), ${failCount} failed`);
    } else {
      toast.error('All verifications failed');
    }
  };

  const retryFile = async (id: string) => {
    const item = queue.find(q => q.id === id);
    if (!item) return;

    setQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'queued', progress: 0, error: undefined } : q
    ));

    await verifyFile(item);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'authentic':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'tampered':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'unverified':
        return <XCircle className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'authentic':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Authentic</Badge>;
      case 'tampered':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Tampered</Badge>;
      case 'unverified':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Unverified</Badge>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const queuedCount = queue.filter(q => q.status === 'queued').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Verify Audio
            </h1>
            <p className="text-neutral-400 mt-1">
              Upload audio files to verify authenticity and detect tampering
            </p>
          </div>
          {queue.length > 0 && (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={clearQueue}
                className="border-neutral-700 hover:bg-neutral-800"
              >
                Clear All
              </Button>
              <Button 
                onClick={processQueue}
                disabled={isProcessing || queuedCount === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify {queuedCount} File{queuedCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <Card
          className={`p-8 border-2 border-dashed transition-all cursor-pointer ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FORMATS.join(',')}
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDragging ? 'bg-primary/20' : 'bg-neutral-800'
            }`}>
              <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-neutral-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragging ? 'Drop files here' : 'Drop audio files or click to upload'}
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Supports MP3, WAV, M4A, AAC, OGG, FLAC, WMA (max 100MB per file)
            </p>
            <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
              <FileAudio className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>
        </Card>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Verification Queue ({queue.length})
              </h2>
              <p className="text-sm text-neutral-400">
                {completedCount} completed, {queuedCount} pending
              </p>
            </div>

            <div className="space-y-3">
              {queue.map((item) => (
                <Card key={item.id} className="p-4 bg-neutral-900 border-neutral-800">
                  <div className="flex items-center gap-4">
                    {/* File Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-500/20' :
                      item.status === 'error' ? 'bg-red-500/20' :
                      'bg-neutral-800'
                    }`}>
                      {item.status === 'completed' && item.result ? (
                        getResultIcon(item.result.result)
                      ) : item.status === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : item.status === 'uploading' || item.status === 'verifying' ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <Music className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{item.file.name}</p>
                        {item.result && getResultBadge(item.result.result)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                        <span>{formatFileSize(item.file.size)}</span>
                        {item.result && (
                          <>
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {item.result.confidenceScore}% confidence
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.result.processingTimeMs}ms
                            </span>
                            {item.result.originDetected !== 'unknown' && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Origin: {item.result.originDetected}
                              </span>
                            )}
                          </>
                        )}
                        {item.error && (
                          <span className="text-red-400">{item.error}</span>
                        )}
                      </div>

                      {/* Progress bar for uploading/verifying */}
                      {(item.status === 'uploading' || item.status === 'verifying') && (
                        <div className="mt-2">
                          <Progress value={item.progress} className="h-1" />
                          <p className="text-xs text-neutral-500 mt-1">
                            {item.status === 'uploading' ? 'Uploading...' : 'Verifying...'}
                          </p>
                        </div>
                      )}

                      {/* Tamper Indicators */}
                      {item.result?.tamperDetected && item.result.tamperIndicators.length > 0 && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                          <p className="text-xs font-medium text-red-400 mb-1">Tamper Indicators:</p>
                          <ul className="text-xs text-red-300 space-y-0.5">
                            {item.result.tamperIndicators.map((indicator, i) => (
                              <li key={i}>• {indicator}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {item.status === 'error' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => retryFile(item.id)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status !== 'uploading' && item.status !== 'verifying' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeFromQueue(item.id)}
                          className="text-neutral-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Hash for completed verifications */}
                  {item.result && (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{item.result.hash}</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {queue.length === 0 && (
          <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
              <FileAudio className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No files in queue</h3>
            <p className="text-neutral-400 mb-4">
              Upload audio files to verify their authenticity and detect potential tampering.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Authentic
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Tampered
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-amber-500" /> Unverified
              </span>
            </div>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}
