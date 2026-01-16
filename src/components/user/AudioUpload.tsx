import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, File, CheckCircle2, XCircle, Loader2, Music } from 'lucide-react';

interface AudioUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export default function AudioUpload({ userId, onUploadComplete }: AudioUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    origin: 'human',
    modelUsed: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
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
      setSuccess(false);

      // Auto-fill title from filename
      if (!metadata.title) {
        const filename = audioFile.name.replace(/\.[^/.]+$/, '');
        setMetadata(prev => ({ ...prev, title: filename }));
      }
    }
  }, [metadata.title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg']
    },
    maxFiles: 1
  });

  const handleMetadataChange = (field: string, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!metadata.title) {
      setError('Please provide a title for your audio');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch('/.netlify/functions/upload-audio', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setFile(null);
      setMetadata({
        title: '',
        artist: '',
        origin: 'human',
        modelUsed: '',
        description: ''
      });

      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (err: any) {
      setError(err.message || 'Failed to upload audio');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
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
          <Upload className="w-5 h-5" />
          Upload & Protect Audio
        </CardTitle>
        <CardDescription className="text-gray-300">
          Upload your audio file and embed cryptographic provenance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              Audio uploaded and protected successfully! Provenance watermark embedded.
            </AlertDescription>
          </Alert>
        )}

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
                  : 'Drag & drop your audio file here, or click to browse'}
              </p>
              <p className="text-sm text-gray-400">
                Supports MP3, WAV, FLAC, M4A, AAC, OGG (max 100MB)
              </p>
            </div>
          )}
        </div>

        {/* Metadata Form */}
        {file && (
          <div className="space-y-4 border border-white/10 rounded-lg p-4 bg-slate-700/30">
            <h3 className="text-white font-medium">Audio Metadata</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter audio title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist" className="text-white">Artist / Creator</Label>
              <Input
                id="artist"
                value={metadata.artist}
                onChange={(e) => handleMetadataChange('artist', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Enter artist name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin" className="text-white">Origin *</Label>
              <select
                id="origin"
                value={metadata.origin}
                onChange={(e) => handleMetadataChange('origin', e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-600 text-white"
              >
                <option value="human">Human Created</option>
                <option value="ai">AI Generated</option>
                <option value="hybrid">Hybrid (Human + AI)</option>
              </select>
            </div>

            {(metadata.origin === 'ai' || metadata.origin === 'hybrid') && (
              <div className="space-y-2">
                <Label htmlFor="modelUsed" className="text-white">AI Model Used</Label>
                <Input
                  id="modelUsed"
                  value={metadata.modelUsed}
                  onChange={(e) => handleMetadataChange('modelUsed', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="e.g., Suno AI, MusicGen, etc."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Add any additional details..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Uploading and embedding watermark...</span>
              <span className="text-purple-400">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        {file && (
          <Button
            onClick={handleUpload}
            disabled={uploading || !metadata.title}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload & Protect Audio
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
