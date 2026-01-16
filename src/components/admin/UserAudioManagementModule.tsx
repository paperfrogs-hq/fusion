// User Audio Management Module - Admin view of all user uploads

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Search, Filter, Download, Eye, Shield, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase-client";

interface UserAudio {
  id: string;
  user_id: string;
  original_filename: string;
  file_size_bytes: number;
  file_format: string;
  storage_path: string;
  provenance_status: string;
  confidence_score: number;
  watermark_embedded: boolean;
  uploaded_at: string;
  metadata: any;
  user_email?: string;
  user_name?: string;
}

const UserAudioManagementModule = () => {
  const [audioFiles, setAudioFiles] = useState<UserAudio[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UserAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<UserAudio | null>(null);

  useEffect(() => {
    fetchUserAudioFiles();
  }, []);

  useEffect(() => {
    let filtered = audioFiles;

    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.metadata?.artist?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(file => file.provenance_status === filterStatus);
    }

    setFilteredFiles(filtered);
  }, [searchTerm, filterStatus, audioFiles]);

  const fetchUserAudioFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_audio_files")
        .select(`
          *,
          users!user_audio_files_user_id_fkey (
            email,
            full_name
          )
        `)
        .order("uploaded_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const filesWithUserData = (data || []).map((file: any) => ({
        ...file,
        user_email: file.users?.email,
        user_name: file.users?.full_name
      }));

      setAudioFiles(filesWithUserData);
      setFilteredFiles(filesWithUserData);
    } catch (error) {
      console.error("Error fetching user audio files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const exportToCSV = () => {
    const headers = ['Filename', 'User Email', 'Size', 'Format', 'Status', 'Uploaded'];
    const rows = filteredFiles.map(file => [
      file.original_filename,
      file.user_email || '',
      formatBytes(file.file_size_bytes),
      file.file_format,
      file.provenance_status,
      formatDate(file.uploaded_at)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-audio-files-${Date.now()}.csv`;
    a.click();
  };

  const stats = {
    total: audioFiles.length,
    verified: audioFiles.filter(f => f.provenance_status === 'verified').length,
    pending: audioFiles.filter(f => f.provenance_status === 'pending').length,
    totalSize: audioFiles.reduce((sum, f) => sum + f.file_size_bytes, 0),
    watermarked: audioFiles.filter(f => f.watermark_embedded).length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Audio Management</h2>
        <p className="text-gray-600">View and manage all audio files uploaded by users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Music className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Watermarked</p>
              <p className="text-2xl font-bold text-purple-600">{stats.watermarked}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Storage</p>
              <p className="text-xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
            </div>
            <Music className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by filename, user, title, or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>

        <Button onClick={fetchUserAudioFiles} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No audio files found
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Music className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.original_filename}
                          </div>
                          {file.metadata?.title && (
                            <div className="text-xs text-gray-500">
                              {file.metadata.title}
                              {file.metadata.artist && ` - ${file.metadata.artist}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{file.user_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{file.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatBytes(file.file_size_bytes)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{file.file_format.toUpperCase()}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(file.provenance_status)}`}></div>
                        <span className="text-sm text-gray-900 capitalize">{file.provenance_status}</span>
                        {file.watermark_embedded && (
                          <Shield className="w-4 h-4 text-green-600" aria-label="Watermarked" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(file.uploaded_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFile(file)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Detail Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Audio File Details</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Filename</h4>
                  <p className="text-gray-900">{selectedFile.original_filename}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">User</h4>
                    <p className="text-gray-900">{selectedFile.user_name}</p>
                    <p className="text-sm text-gray-500">{selectedFile.user_email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Uploaded</h4>
                    <p className="text-gray-900">{formatDate(selectedFile.uploaded_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Size</h4>
                    <p className="text-gray-900">{formatBytes(selectedFile.file_size_bytes)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Format</h4>
                    <p className="text-gray-900">{selectedFile.file_format.toUpperCase()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <Badge className={getStatusColor(selectedFile.provenance_status)}>
                      {selectedFile.provenance_status}
                    </Badge>
                  </div>
                </div>

                {selectedFile.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Metadata</h4>
                    <div className="bg-gray-50 rounded p-3 space-y-2">
                      {selectedFile.metadata.title && (
                        <div>
                          <span className="text-xs text-gray-500">Title: </span>
                          <span className="text-sm text-gray-900">{selectedFile.metadata.title}</span>
                        </div>
                      )}
                      {selectedFile.metadata.artist && (
                        <div>
                          <span className="text-xs text-gray-500">Artist: </span>
                          <span className="text-sm text-gray-900">{selectedFile.metadata.artist}</span>
                        </div>
                      )}
                      {selectedFile.metadata.origin && (
                        <div>
                          <span className="text-xs text-gray-500">Origin: </span>
                          <span className="text-sm text-gray-900">{selectedFile.metadata.origin}</span>
                        </div>
                      )}
                      {selectedFile.metadata.description && (
                        <div>
                          <span className="text-xs text-gray-500">Description: </span>
                          <span className="text-sm text-gray-900">{selectedFile.metadata.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Storage Path</h4>
                  <code className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded block">
                    {selectedFile.storage_path}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${selectedFile.watermark_embedded ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-900">
                    {selectedFile.watermark_embedded ? 'Watermark Embedded' : 'No Watermark'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Confidence Score</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-full rounded-full"
                        style={{ width: `${selectedFile.confidence_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{(selectedFile.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAudioManagementModule;
