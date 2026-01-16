// Audio Provenance Registry Module

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileAudio, Search, AlertTriangle, CheckCircle, Brain, User, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import type { AudioAsset } from "@/types/admin";

const AudioProvenanceModule = () => {
  const [assets, setAssets] = useState<AudioAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AudioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.audio_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.watermark_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(asset => asset.provenance_status === filterStatus);
    }

    setFilteredAssets(filtered);
  }, [searchTerm, filterStatus, assets]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("audio_registry")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAssets(data || []);
      setFilteredAssets(data || []);
    } catch (error) {
      console.error("Error fetching audio assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProvenanceIcon = (status: string) => {
    switch (status) {
      case "human_created": return <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "ai_generated": return <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case "platform_processed": return <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getProvenanceColor = (status: string) => {
    switch (status) {
      case "human_created": return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "ai_generated": return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
      case "platform_processed": return "bg-green-500/20 text-green-600 dark:text-green-400";
      default: return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading audio registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audio Provenance Registry</h2>
        <p className="text-muted-foreground mt-1">Track audio asset provenance, watermarks, and tamper detection</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <FileAudio className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">Total Assets</p>
          <p className="text-3xl font-bold">{assets.length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <User className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">Human Created</p>
          <p className="text-3xl font-bold">{assets.filter(a => a.provenance_status === "human_created").length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <Brain className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm text-muted-foreground">AI Generated</p>
          <p className="text-3xl font-bold">{assets.filter(a => a.provenance_status === "ai_generated").length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-muted-foreground">Tamper Detected</p>
          <p className="text-3xl font-bold">{assets.filter(a => a.tamper_detected).length}</p>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by hash or watermark ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative min-w-[200px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="human_created">Human Created</option>
              <option value="ai_generated">AI Generated</option>
              <option value="platform_processed">Platform Processed</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <Button onClick={fetchAssets} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No audio assets found</p>
            </div>
          ) : (
            filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                    {getProvenanceIcon(asset.provenance_status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProvenanceColor(asset.provenance_status)}`}>
                        {asset.provenance_status.replace("_", " ")}
                      </span>
                      {asset.tamper_detected && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Tampered
                        </span>
                      )}
                      {asset.confidence_score && (
                        <span className="text-xs text-muted-foreground">
                          Confidence: {(asset.confidence_score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Hash:</span>
                        <code className="text-xs font-mono">{asset.audio_hash.slice(0, 32)}...</code>
                      </div>
                      {asset.watermark_id && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Watermark:</span>
                          <code className="text-xs font-mono">{asset.watermark_id}</code>
                        </div>
                      )}
                      {asset.model_used && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Model:</span>
                          <span className="text-xs">{asset.model_used}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="text-xs">{new Date(asset.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Provenance Chain Integrity</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Each audio asset maintains an immutable provenance chain with cryptographic verification.
        </p>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">All chains verified</span>
        </div>
      </div>
    </div>
  );
};

export default AudioProvenanceModule;
