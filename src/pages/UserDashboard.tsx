import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, Music, Shield, LogOut, Key, User } from 'lucide-react';
import AudioUpload from '@/components/user/AudioUpload';
import AudioVerification from '@/components/user/AudioVerification';

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
      // TODO: Fetch user's audio files
      setAudioFiles([]);
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/Fusion_Icon-No-BG-01.png" 
              alt="Fusion Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white">Fusion Dashboard</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-white/10">
            <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-purple-600">
              <Shield className="w-4 h-4 mr-2" />
              Verify Audio
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-purple-600">
              <Music className="w-4 h-4 mr-2" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-purple-600">
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
            <Card className="border-purple-500/20 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">My Audio Library</CardTitle>
                <CardDescription className="text-gray-300">
                  All your uploaded and protected audio files
                </CardDescription>
              </CardHeader>
              <CardContent>
                {audioFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No audio files yet</p>
                    <p className="text-sm mt-2">Upload your first audio file to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audioFiles.map((file) => (
                      <div
                        key={file.id}
                        className="border border-white/10 rounded-lg p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{file.original_filename}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
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
            <Card className="border-purple-500/20 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your account and API access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Email</h3>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Full Name</h3>
                    <p className="text-white">{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">API Key</h3>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-900/50 border border-white/10 rounded px-3 py-2 text-purple-400 text-sm font-mono">
                        fus_********************************
                      </code>
                      <Button variant="outline" size="sm">
                        <Key className="w-4 h-4 mr-2" />
                        Show
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Use this key to access the Fusion API and Python SDK
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Storage Used</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-900/50 border border-white/10 rounded-full h-2">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-white text-sm">150 MB / 1 GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
