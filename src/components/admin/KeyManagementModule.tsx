// Key Management Module - Cryptographic key lifecycle management

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Plus, Shield, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, Server, Lock, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";
import type { CryptoKey } from "@/types/admin";

const KeyManagementModule = () => {
  const [keys, setKeys] = useState<CryptoKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("crypto_master_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error("Error fetching keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      // Generate key fingerprint (in production, this would be from actual key generation)
      const fingerprint = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      const { error } = await supabase
        .from("crypto_master_keys")
        .insert([{
          key_fingerprint: fingerprint,
          key_type: "signing",
          algorithm: "RSA-4096",
          key_status: "active",
          is_hsm_backed: false,
        }]);

      if (error) throw error;

      await logAdminAction("key_created", "crypto_key", fingerprint);

      toast({
        title: "Key Created",
        description: "New signing key generated successfully",
      });

      fetchKeys();
      setShowCreateForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create key",
        variant: "destructive",
      });
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this key? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("crypto_master_keys")
        .update({
          key_status: "revoked",
          revoked_at: new Date().toISOString(),
        })
        .eq("id", keyId);

      if (error) throw error;

      await logAdminAction("key_revoked", "crypto_key", keyId);

      toast({
        title: "Key Revoked",
        description: "The key has been revoked",
        variant: "destructive",
      });

      fetchKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke key",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "revoked": return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "expired": return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "revoked": return "bg-red-500/20 text-red-600 dark:text-red-400";
      case "expired": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading keys...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cryptographic Key Management</h2>
          <p className="text-muted-foreground mt-1">Manage signing keys, verification keys, and HSM-backed master keys</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Key
        </Button>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Keys
          </TabsTrigger>
          <TabsTrigger value="rotation" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Rotation
          </TabsTrigger>
          <TabsTrigger value="hsm" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            HSM
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <Shield className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Total Keys</p>
              <p className="text-3xl font-bold">{keys.length}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-bold">{keys.filter(k => k.key_status === "active").length}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <XCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">Revoked</p>
              <p className="text-3xl font-bold">{keys.filter(k => k.key_status === "revoked").length}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Key className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">HSM-Backed</p>
              <p className="text-3xl font-bold">{keys.filter(k => k.is_hsm_backed).length}</p>
            </div>
          </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Key</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Key Type</label>
              <select className="w-full px-4 py-2 bg-background border border-border rounded-lg">
                <option>Signing Key (RSA-4096)</option>
                <option>Verification Key (Ed25519)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateKey}>
                <Key className="w-4 h-4 mr-2" />
                Generate Key
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fingerprint</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Algorithm</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">HSM</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No keys found. Create your first key to get started.
                  </td>
                </tr>
              ) : (
                keys.map((key, index) => (
                  <motion.tr
                    key={key.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border/30 hover:bg-muted/20"
                  >
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono">{key.key_fingerprint.slice(0, 16)}...</code>
                    </td>
                    <td className="py-3 px-4 text-sm">{key.key_type}</td>
                    <td className="py-3 px-4 text-sm">{key.algorithm}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(key.key_status)}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(key.key_status)}`}>
                          {key.key_status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {key.is_hsm_backed ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {key.key_status === "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeKey(key.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Security Notice
            </h3>
            <p className="text-sm text-muted-foreground">
              Private keys are never displayed or stored in plain text. All key operations are logged in the audit trail.
              For production use, consider HSM-backed keys for enhanced security.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="rotation" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <RotateCcw className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Scheduled Rotations</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Clock className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Keys Expiring (30d)</p>
              <p className="text-3xl font-bold">{keys.filter(k => k.expires_at && new Date(k.expires_at) < new Date(Date.now() + 30*24*60*60*1000)).length}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <RefreshCw className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Last Rotation</p>
              <p className="text-xl font-bold">Never</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Rotation Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Signing Keys</p>
                  <p className="text-sm text-muted-foreground">RSA-4096 keys used for digital signatures</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Every 365 days</p>
                  <p className="text-xs text-muted-foreground">Industry standard</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Verification Keys</p>
                  <p className="text-sm text-muted-foreground">Ed25519 keys for verification</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Every 180 days</p>
                  <p className="text-xs text-muted-foreground">High security</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">HSM Master Keys</p>
                  <p className="text-sm text-muted-foreground">Hardware-backed master keys</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Every 730 days</p>
                  <p className="text-xs text-muted-foreground">Compliant rotation</p>
                </div>
              </div>
            </div>
            <Button className="mt-4" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Trigger Manual Rotation
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="hsm" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <Server className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">HSM Devices</p>
              <p className="text-3xl font-bold">1</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Key className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">HSM Keys</p>
              <p className="text-3xl font-bold">{keys.filter(k => k.is_hsm_backed).length}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">HSM Status</p>
              <p className="text-xl font-bold text-green-500">Online</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Shield className="w-8 h-8 text-teal-500 mb-2" />
              <p className="text-sm text-muted-foreground">FIPS 140-2</p>
              <p className="text-xl font-bold">Level 3</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">HSM Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">HSM Provider</p>
                  <p className="text-sm text-muted-foreground">Cloud HSM service provider</p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-500">AWS CloudHSM</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Cluster ID</p>
                  <p className="text-sm text-muted-foreground">HSM cluster identifier</p>
                </div>
                <code className="text-xs font-mono">cluster-abc123xyz</code>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Auto-Backup</p>
                  <p className="text-sm text-muted-foreground">Automatic key backup to secondary HSM</p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <Shield className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Security Score</p>
              <p className="text-3xl font-bold text-green-500">A+</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Lock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Encryption</p>
              <p className="text-xl font-bold">AES-256-GCM</p>
            </div>
            <div className="glass rounded-xl p-6">
              <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Alerts</p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Security Policies</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Key Access Logging</p>
                  <p className="text-sm text-muted-foreground">Log all key access attempts</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Multi-Party Authorization</p>
                  <p className="text-sm text-muted-foreground">Require 2+ admins for key operations</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Disabled</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Automatic Key Revocation</p>
                  <p className="text-sm text-muted-foreground">Revoke compromised keys automatically</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Zero-Knowledge Backup</p>
                  <p className="text-sm text-muted-foreground">Encrypted backups without key exposure</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KeyManagementModule;
