// Verification Policy Control Module

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Settings, CheckCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";
import type { VerificationPolicy } from "@/types/admin";

const VerificationPolicyModule = () => {
  const [policies, setPolicies] = useState<VerificationPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    policy_mode: "permissive",
    confidence_threshold: 0.8,
    tamper_sensitivity: "medium",
    deterministic_mode: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("verification_policies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      // Deactivate all other policies if this is to be active
      const { error } = await supabase
        .from("verification_policies")
        .insert([{
          ...formData,
          version: 1,
          is_active: false,
          policy_config: {},
        }]);

      if (error) throw error;

      await logAdminAction("verification_policy_created", "verification_policy", formData.name);

      toast({
        title: "Policy Created",
        description: `${formData.name} has been created`,
      });

      fetchPolicies();
      setShowCreateForm(false);
      setFormData({
        name: "",
        policy_mode: "permissive",
        confidence_threshold: 0.8,
        tamper_sensitivity: "medium",
        deterministic_mode: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    }
  };

  const handleActivatePolicy = async (policyId: string) => {
    if (!confirm("Are you sure you want to activate this policy? This will deactivate all other policies.")) return;

    try {
      // Deactivate all policies
      await supabase
        .from("verification_policies")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all

      // Activate selected policy
      const { error } = await supabase
        .from("verification_policies")
        .update({ is_active: true })
        .eq("id", policyId);

      if (error) throw error;

      await logAdminAction("verification_policy_activated", "verification_policy", policyId);

      toast({
        title: "Policy Activated",
        description: "The verification policy is now active",
      });

      fetchPolicies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate policy",
        variant: "destructive",
      });
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "strict": return "bg-red-500/20 text-red-600 dark:text-red-400";
      case "permissive": return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "experimental": return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verification Engine Control</h2>
          <p className="text-muted-foreground mt-1">Configure verification policies, confidence thresholds, and tamper sensitivity</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <Shield className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">Total Policies</p>
          <p className="text-3xl font-bold">{policies.length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm text-muted-foreground">Active Policy</p>
          <p className="text-2xl font-bold">{policies.find(p => p.is_active)?.name || "None"}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <History className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm text-muted-foreground">Total Versions</p>
          <p className="text-3xl font-bold">{policies.reduce((acc, p) => acc + p.version, 0)}</p>
        </div>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Policy</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Policy Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production Policy"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mode</label>
              <select
                value={formData.policy_mode}
                onChange={(e) => setFormData({ ...formData, policy_mode: e.target.value as any })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="strict">Strict</option>
                <option value="permissive">Permissive</option>
                <option value="experimental">Experimental</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confidence Threshold ({formData.confidence_threshold})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.confidence_threshold}
                onChange={(e) => setFormData({ ...formData, confidence_threshold: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tamper Sensitivity</label>
              <select
                value={formData.tamper_sensitivity}
                onChange={(e) => setFormData({ ...formData, tamper_sensitivity: e.target.value as any })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="deterministic"
              checked={formData.deterministic_mode}
              onChange={(e) => setFormData({ ...formData, deterministic_mode: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="deterministic" className="text-sm">Enable Deterministic Mode</label>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreatePolicy} disabled={!formData.name}>
              Create Policy
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {policies.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No policies found. Create your first policy to get started.</p>
          </div>
        ) : (
          policies.map((policy, index) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`glass rounded-xl p-6 ${
                policy.is_active ? "border-2 border-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{policy.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getModeColor(policy.policy_mode)}`}>
                      {policy.policy_mode}
                    </span>
                    {policy.is_active && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary/20 text-primary flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">v{policy.version}</span>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Confidence Threshold</p>
                      <p className="font-medium">{(policy.confidence_threshold * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tamper Sensitivity</p>
                      <p className="font-medium capitalize">{policy.tamper_sensitivity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deterministic</p>
                      <p className="font-medium">{policy.deterministic_mode ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
                {!policy.is_active && (
                  <Button
                    size="sm"
                    onClick={() => handleActivatePolicy(policy.id)}
                  >
                    Activate
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default VerificationPolicyModule;
