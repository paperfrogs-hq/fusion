import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Music, Shield, LogOut, Key, User, Download, Trash2, Eye, EyeOff, Copy, CheckCircle2, XCircle, Clock, Camera, Zap, ArrowRight, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import AudioUpload from '@/components/user/AudioUpload';
import AudioVerification from '@/components/user/AudioVerification';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '' });
  const [storageUsed, setStorageUsed] = useState(0);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [currentPlan] = useState({
    name: 'Free',
    verifications_limit: 10,
    verifications_used: 0,
    price: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('fusion_user_token');
    const userId = localStorage.getItem('fusion_user_id');
    const email = localStorage.getItem('fusion_user_email');
    const name = localStorage.getItem('fusion_user_name');

    if (!token || !userId) {
      navigate('/user/login');
      return;
    }

    setUser({ id: userId, email, name });
    loadAudioFiles(userId);
    loadVerificationHistory(userId);
    loadUserData(userId);
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, api_key, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setUser((prev: any) => ({ ...prev, api_key: data.api_key, full_name: data.full_name, email: data.email, avatar_url: data.avatar_url }));
        setProfileForm({ full_name: data.full_name || '' });
        if (data.avatar_url) {
          setProfilePicture(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadAudioFiles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_audio_files')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAudioFiles(data || []);
      
      // Calculate storage used
      const totalBytes = (data || []).reduce((sum: number, file: any) => sum + (file.file_size_bytes || 0), 0);
      setStorageUsed(totalBytes);
    } catch (error) {
      console.error('Failed to load audio files:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_verification_history')
        .select('*')
        .eq('user_id', userId)
        .order('verified_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setVerificationHistory(data || []);
    } catch (error) {
      console.error('Failed to load verification history:', error);
    }
  };

  const downloadAudioFile = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('audio-files')
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Downloaded', description: `${file.original_filename} downloaded successfully` });
    } catch (error: any) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  const deleteAudioFile = async (fileId: string, filename: string) => {
    if (!confirm(`Delete ${filename}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('user_audio_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({ title: 'Deleted', description: `${filename} deleted successfully` });
      loadAudioFiles(user.id);
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  };

  const copyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
      toast({ title: 'Copied', description: 'API key copied to clipboard' });
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: profileForm.full_name })
        .eq('id', user.id);

      if (error) throw error;

      setUser((prev: any) => ({ ...prev, full_name: profileForm.full_name }));
      localStorage.setItem('fusion_user_name', profileForm.full_name);
      setEditingProfile(false);
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully' });
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fusion_user_token');
    localStorage.removeItem('fusion_user_id');
    localStorage.removeItem('fusion_user_email');
    localStorage.removeItem('fusion_user_name');
    navigate('/user/login');
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setUploadingPicture(true);

    try {
      // Convert image to base64 and store in users table directly
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          
          // Update user record with base64 image
          const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: base64 })
            .eq('id', user.id);

          if (updateError) throw updateError;

          setProfilePicture(base64);
          setUser((prev: any) => ({ ...prev, avatar_url: base64 }));
          toast({ title: 'Success', description: 'Profile picture updated successfully' });
        } catch (error: any) {
          console.error('Update error:', error);
          toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        } finally {
          setUploadingPicture(false);
        }
      };
      reader.onerror = () => {
        toast({ title: 'Upload failed', description: 'Failed to read image file', variant: 'destructive' });
        setUploadingPicture(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      setUploadingPicture(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* User Info Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.full_name || user?.name || 'User Dashboard'}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </TabsTrigger>
            <TabsTrigger value="verify">
              <Shield className="w-4 h-4 mr-2" />
              Verify Audio
            </TabsTrigger>
            <TabsTrigger value="library">
              <Music className="w-4 h-4 mr-2" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <AudioUpload userId={user?.id} onUploadComplete={() => loadAudioFiles(user?.id)} />
          </TabsContent>

          {/* Verify Tab */}
          <TabsContent value="verify">
            <AudioVerification />
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>My Audio Library</CardTitle>
                <CardDescription>
                  {audioFiles.length} file{audioFiles.length !== 1 ? 's' : ''} • {formatBytes(storageUsed)} used
                </CardDescription>
              </CardHeader>
              <CardContent>
                {audioFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No audio files yet</p>
                    <p className="text-sm mt-2">Upload your first audio file to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audioFiles.map((file) => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{file.original_filename}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{formatBytes(file.file_size_bytes)}</span>
                              <span>{file.file_format?.toUpperCase()}</span>
                              <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                              <Badge variant={file.watermark_embedded ? 'default' : 'secondary'}>
                                {file.watermark_embedded ? 'Protected' : 'Processing'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedFile(file);
                                setShowFileDetails(true);
                              }}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadAudioFile(file)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteAudioFile(file.id, file.original_filename)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-border">
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-primary" />
                      )}
                    </div>
                    <label 
                      htmlFor="profile-picture" 
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {uploadingPicture ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="profile-picture"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Click the camera icon to upload a new photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Max size: 5MB. JPG, PNG, or GIF.</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p className="mb-1">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed after registration</p>
                </div>
                {editingProfile ? (
                  <>
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updateProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                      <p>{user?.full_name || user?.name || 'Not set'}</p>
                    </div>
                    <Button variant="outline" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* API Key Section */}
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  Use this key to access the Fusion API and Python SDK
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted border rounded px-3 py-2 text-primary text-sm font-mono truncate">
                    {showApiKey ? (user?.api_key || 'No API key generated') : 'fus_********************************'}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyApiKey}
                    disabled={!user?.api_key}
                  >
                    {copiedApiKey ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep your API key secure. Do not share it publicly.
                </p>
              </CardContent>
            </Card>

            {/* Subscription Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription and usage
                    </CardDescription>
                  </div>
                  <Badge variant={currentPlan.name === 'Free' ? 'secondary' : 'default'} className="text-sm">
                    {currentPlan.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Usage Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Monthly Verifications</span>
                    <span className="text-sm text-muted-foreground">
                      {verificationHistory.length} / {currentPlan.verifications_limit} used
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all" 
                      style={{ width: `${Math.min((verificationHistory.length / currentPlan.verifications_limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {verificationHistory.length >= currentPlan.verifications_limit && (
                    <p className="text-xs text-orange-500 mt-2">
                      You've reached your monthly limit. Upgrade to continue verifying.
                    </p>
                  )}
                </div>

                {/* Plan Features */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{currentPlan.verifications_limit}</p>
                    <p className="text-xs text-muted-foreground">Verifications/month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}`}</p>
                    <p className="text-xs text-muted-foreground">{currentPlan.price > 0 ? '/month' : 'Forever'}</p>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {currentPlan.name === 'Free' && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Crown className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Upgrade to Creator</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Get 100 verifications/month, audio library storage, and certificates for just $9/month.
                        </p>
                        <Button 
                          className="mt-3" 
                          onClick={() => navigate('/user/pricing')}
                        >
                          View Plans
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentPlan.name !== 'Free' && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/user/pricing')}>
                      Change Plan
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground">
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Storage Section */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  Track your audio file storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm">{formatBytes(storageUsed)} / 1 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted border rounded-full h-2">
                      <div 
                        className="bg-primary h-full rounded-full transition-all" 
                        style={{ width: `${Math.min((storageUsed / (1024 * 1024 * 1024)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Files</p>
                    <p className="text-lg font-semibold">{audioFiles.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Verifications</p>
                    <p className="text-lg font-semibold">{verificationHistory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Verifications</CardTitle>
                <CardDescription>
                  Your audio verification history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No verification history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verificationHistory.slice(0, 10).map((record) => (
                      <div key={record.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          {record.verification_status === 'verified' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : record.verification_status === 'tampered' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium capitalize">{record.verification_status}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.verified_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={record.verification_status === 'verified' ? 'default' : 'destructive'}>
                          {record.confidence_score ? `${(record.confidence_score * 100).toFixed(1)}%` : 'N/A'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* File Details Dialog */}
      <Dialog open={showFileDetails} onOpenChange={setShowFileDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audio File Details</DialogTitle>
            <DialogDescription>
              Complete information about this audio file
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filename</p>
                  <p className="text-sm">{selectedFile.original_filename}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Format</p>
                  <p className="text-sm">{selectedFile.file_format?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Size</p>
                  <p className="text-sm">{formatBytes(selectedFile.file_size_bytes)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                  <p className="text-sm">{new Date(selectedFile.uploaded_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Provenance Status</p>
                  <Badge variant={selectedFile.provenance_status === 'verified' ? 'default' : 'secondary'}>
                    {selectedFile.provenance_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Watermark</p>
                  <Badge variant={selectedFile.watermark_embedded ? 'default' : 'secondary'}>
                    {selectedFile.watermark_embedded ? 'Embedded' : 'Not Embedded'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                  <p className="text-sm">{selectedFile.confidence_score ? `${(selectedFile.confidence_score * 100).toFixed(2)}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verification Count</p>
                  <p className="text-sm">{selectedFile.verification_count || 0} times</p>
                </div>
              </div>
              {selectedFile.metadata && Object.keys(selectedFile.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedFile.metadata, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => downloadAudioFile(selectedFile)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setShowFileDetails(false);
                    deleteAudioFile(selectedFile.id, selectedFile.original_filename);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete File
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="bg-muted/50 border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Fusion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
