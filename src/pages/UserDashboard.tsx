import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, Music, Shield, LogOut, Key, User } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import AudioUpload from '@/components/user/AudioUpload';
import AudioVerification from '@/components/user/AudioVerification';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [navigate]);

  const loadAudioFiles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_audio_files')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAudioFiles(data || []);
    } catch (error) {
      console.error('Failed to load audio files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fusion_user_token');
    localStorage.removeItem('fusion_user_id');
    localStorage.removeItem('fusion_user_email');
    localStorage.removeItem('fusion_user_name');
    navigate('/user/login');
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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* User Info Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-6 mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name || 'User Dashboard'}</h1>
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
      <main className="container mx-auto px-4 py-8">
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
                  All your uploaded and protected audio files
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
                              <Badge variant={file.watermark_embedded ? 'default' : 'secondary'}>
                                {file.watermark_embedded ? 'Protected' : 'Processing'}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and API access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                    <p>{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">API Key</h3>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted border rounded px-3 py-2 text-primary text-sm font-mono">
                        fus_********************************
                      </code>
                      <Button variant="outline" size="sm">
                        <Key className="w-4 h-4 mr-2" />
                        Show
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use this key to access the Fusion API and Python SDK
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Storage Used</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted border rounded-full h-2">
                        <div className="bg-primary h-full rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-sm">150 MB / 1 GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
