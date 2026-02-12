import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, CheckCircle2, AlertTriangle, XCircle, Loader2, Music, Calendar, User } from 'lucide-react';

export default function AudioVerification() {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const audioFile = acceptedFiles[0];
      
      // Validate file size (max 100MB)
      if (audioFile.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }

      setFile(audioFile);
      setError('');
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg']
    },
    maxFiles: 1
  });

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file to verify');
      return;
    }

    setVerifying(true);
    setError('');
    setResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove data URL prefix (e.g., "data:audio/mp3;base64,")
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const fileData = await fileDataPromise;

      const response = await fetch('/.netlify/functions/verify-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          fileName: file.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify audio');
    } finally {
      setVerifying(false);
    }
  };

  const getVerificationColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getVerificationIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    if (confidence >= 0.7) return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="border-purple-500/20 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Verify Audio Provenance
        </CardTitle>
        <CardDescription className="text-gray-300">
          Upload an audio file to verify its origin and authenticity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 hover:border-purple-500/50 bg-slate-700/30'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-2">
              <Music className="w-12 h-12 mx-auto text-purple-400" />
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-gray-400">
                {formatBytes(file.size)} • {file.type}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-white">
                {isDragActive
                  ? 'Drop your audio file here'
                  : 'Drag & drop an audio file to verify, or click to browse'}
              </p>
              <p className="text-sm text-gray-400">
                Supports MP3, WAV, FLAC, M4A, AAC, OGG (max 100MB)
              </p>
            </div>
          )}
        </div>

        {/* Verify Button */}
        {file && !result && (
          <Button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            size="lg"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Verify Audio
              </>
            )}
          </Button>
        )}

        {/* Verification Result */}
        {result && (
          <div className="border border-white/10 rounded-lg p-6 bg-slate-700/30 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Verification Results</h3>
              {getVerificationIcon(result.confidence)}
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Confidence Score</span>
                <span className={`text-2xl font-bold ${getVerificationColor(result.confidence)}`}>
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-900/50 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.confidence >= 0.9
                      ? 'bg-green-500'
                      : result.confidence >= 0.7
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Status</p>
                <Badge
                  variant={result.verified ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {result.verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Watermark</p>
                <Badge
                  variant={result.watermarkFound ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {result.watermarkFound ? 'Detected' : 'Not Found'}
                </Badge>
              </div>
            </div>

            {/* Audio Metadata */}
            {result.metadata && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-white font-medium">Audio Information</h4>
                
                {result.metadata.title && (
                  <div className="flex items-start gap-2">
                    <Music className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Title</p>
                      <p className="text-white">{result.metadata.title}</p>
                    </div>
                  </div>
                )}

                {result.metadata.artist && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Artist</p>
                      <p className="text-white">{result.metadata.artist}</p>
                    </div>
                  </div>
                )}

                {result.metadata.origin && (
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Origin</p>
                      <Badge variant="outline" className="mt-1">
                        {result.metadata.origin === 'human' ? 'Human Created' : 
                         result.metadata.origin === 'ai' ? 'AI Generated' : 
                         'Hybrid'}
                      </Badge>
                    </div>
                  </div>
                )}

                {result.metadata.uploadedAt && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Uploaded</p>
                      <p className="text-white">
                        {new Date(result.metadata.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tamper Detection */}
            {result.tamperedSections && result.tamperedSections.length > 0 && (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  <strong>Warning:</strong> Possible tampering detected in {result.tamperedSections.length} section(s)
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              variant="outline"
              className="w-full"
            >
              Verify Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
