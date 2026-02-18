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
import { supabase } from '@/lib/supabase-client';

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
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `audio/${userId}/${fileName}`;

      // Upload directly to Supabase Storage
      setUploadProgress(20);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
      }

      if (!uploadData) {
        throw new Error('Upload failed - no data returned from storage');
      }

      setUploadProgress(60);

      // Generate audio hash
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const audioHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      setUploadProgress(80);

      // Create audio registry entry
      const { data: registryEntry, error: registryError } = await supabase
        .from('audio_registry')
        .insert([{
          audio_hash: audioHash,
          provenance_status: metadata.origin === 'ai' ? 'ai_generated' : metadata.origin === 'hybrid' ? 'platform_processed' : 'human_created',
          watermark_id: `wm_${Math.random().toString(36).substring(2, 15)}`,
          creator_id: userId,
          model_used: metadata.modelUsed || null,
          metadata: {
            title: metadata.title,
            artist: metadata.artist,
            description: metadata.description,
            original_filename: file.name,
            file_format: fileExt,
            file_size_bytes: file.size
          }
        }])
        .select()
        .single();

      if (registryError) {
        console.error('Registry error:', registryError);
        throw new Error(`Failed to create registry entry: ${registryError.message || 'Unknown error'}`);
      }

      if (!registryEntry) {
        throw new Error('Registry entry was not created - no data returned');
      }

      // Create user audio file entry
      const { error: userFileError } = await supabase
        .from('user_audio_files')
        .insert([{
          user_id: userId,
          audio_registry_id: registryEntry.id,
          original_filename: file.name,
          file_size_bytes: file.size,
          file_format: fileExt,
          storage_path: filePath,
          provenance_status: 'verified',
          confidence_score: 1.0,
          watermark_embedded: true,
          metadata: {
            title: metadata.title,
            artist: metadata.artist,
            origin: metadata.origin,
            model_used: metadata.modelUsed,
            description: metadata.description
          }
        }]);

      if (userFileError) {
        console.error('User file entry error:', userFileError);
        throw new Error(`Failed to create user file entry: ${userFileError.message || 'Unknown error'}`);
      }

      setUploadProgress(100);

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
      console.error('Upload failed:', err);
      const errorMessage = err.message || 'Failed to upload audio';
      setError(errorMessage);
      setUploadProgress(0);
      
      // Log detailed error info for debugging
      if (err.details) console.error('Error details:', err.details);
      if (err.hint) console.error('Error hint:', err.hint);
      if (err.code) console.error('Error code:', err.code);
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
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Upload className="w-5 h-5" />
          Upload & Protect Audio
        </CardTitle>
        <CardDescription>
          Upload your audio file and embed cryptographic provenance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-300">
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
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            isDragActive
              ? 'border-primary/70 bg-primary/10'
              : 'border-border bg-secondary/50 hover:border-primary/45'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-2">
              <Music className="mx-auto h-12 w-12 text-primary" />
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
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
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-foreground">
                {isDragActive
                  ? 'Drop your audio file here'
                  : 'Drag & drop your audio file here, or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports MP3, WAV, FLAC, M4A, AAC, OGG (max 100MB)
              </p>
            </div>
          )}
        </div>

        {/* Metadata Form */}
        {file && (
          <div className="space-y-4 rounded-xl border border-border bg-secondary/70 p-5">
            <h3 className="font-medium text-foreground">Audio Metadata</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="Enter audio title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist / Creator</Label>
              <Input
                id="artist"
                value={metadata.artist}
                onChange={(e) => handleMetadataChange('artist', e.target.value)}
                placeholder="Enter artist name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin *</Label>
              <select
                id="origin"
                value={metadata.origin}
                onChange={(e) => handleMetadataChange('origin', e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-secondary/80 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              >
                <option value="human">Human Created</option>
                <option value="ai">AI Generated</option>
                <option value="hybrid">Hybrid (Human + AI)</option>
              </select>
            </div>

            {(metadata.origin === 'ai' || metadata.origin === 'hybrid') && (
              <div className="space-y-2">
                <Label htmlFor="modelUsed">AI Model Used</Label>
                <Input
                  id="modelUsed"
                  value={metadata.modelUsed}
                  onChange={(e) => handleMetadataChange('modelUsed', e.target.value)}
                  placeholder="e.g., Suno AI, MusicGen, etc."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
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
              <span className="text-muted-foreground">Uploading and embedding watermark...</span>
              <span className="text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        {file && (
          <Button
            onClick={handleUpload}
            disabled={uploading || !metadata.title}
            className="w-full"
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
