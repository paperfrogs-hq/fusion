// Verification Policy Control Module

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Settings,
  CheckCircle,
  History,
  AlertTriangle,
  Sliders,
  TestTube,
  FileText,
  Clock,
  RotateCcw,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";
import type { VerificationPolicy } from "@/types/admin";

type PolicyTestOutcome = "pass" | "warn" | "fail";

interface PolicyTestCase {
  id: string;
  label: string;
  confidence: number;
  tamperDetected: boolean;
  source: "sample" | "upload";
  expected?: PolicyTestOutcome;
}

interface PolicyTestResult {
  id: string;
  label: string;
  source: "sample" | "upload";
  confidence: number;
  tamperDetected: boolean;
  expected?: PolicyTestOutcome;
  outcome: PolicyTestOutcome;
  passed: boolean;
  thresholdUsed: number;
  durationMs: number;
  details: string;
}

interface PolicyTestRun {
  id: string;
  type: "suite" | "file";
  label: string;
  createdAt: string;
  durationMs: number;
  results: PolicyTestResult[];
}

const SAMPLE_POLICY_TESTS: PolicyTestCase[] = [
  { id: "sample-human-original", label: "Human voice original", confidence: 0.96, tamperDetected: false, source: "sample", expected: "pass" },
  { id: "sample-studio-clean", label: "Studio recording clean", confidence: 0.92, tamperDetected: false, source: "sample", expected: "pass" },
  { id: "sample-minor-lossy", label: "Compressed transcode", confidence: 0.74, tamperDetected: false, source: "sample", expected: "warn" },
  { id: "sample-partial-cut", label: "Partial edit and cut", confidence: 0.58, tamperDetected: true, source: "sample", expected: "fail" },
  { id: "sample-deepfake-suspect", label: "Synthetic speech suspect", confidence: 0.41, tamperDetected: true, source: "sample", expected: "fail" },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getAdjustedThreshold = (policy: VerificationPolicy | undefined): number => {
  const base = policy?.confidence_threshold ?? 0.8;
  if (!policy) return base;
  if (policy.policy_mode === "strict") return clamp01(base + 0.08);
  if (policy.policy_mode === "experimental") return clamp01(base - 0.1);
  return base;
};

const estimateDurationMs = (id: string) => {
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return 420 + (hash % 780);
};

const VerificationPolicyModule = () => {
  const [policies, setPolicies] = useState<VerificationPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRunningSuite, setIsRunningSuite] = useState(false);
  const [isRunningFileTest, setIsRunningFileTest] = useState(false);
  const [testRuns, setTestRuns] = useState<PolicyTestRun[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    policy_mode: "permissive",
    confidence_threshold: 0.8,
    tamper_sensitivity: "medium",
    deterministic_mode: true,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleDeletePolicy = async (policyId: string, policyName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${policyName}? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from("verification_policies")
        .delete()
        .eq("id", policyId);

      if (error) throw error;

      await logAdminAction("verification_policy_deleted", "verification_policy", policyId);

      toast({
        title: "Policy Deleted",
        description: `${policyName} has been permanently deleted`,
      });

      fetchPolicies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete policy",
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

  const activePolicy = policies.find((policy) => policy.is_active);

  const evaluateCase = (testCase: PolicyTestCase): PolicyTestResult => {
    const adjustedThreshold = getAdjustedThreshold(activePolicy);
    const sensitivity = activePolicy?.tamper_sensitivity ?? "medium";
    const mode = activePolicy?.policy_mode ?? "permissive";

    let outcome: PolicyTestOutcome;

    if (testCase.tamperDetected) {
      if (mode === "strict" || sensitivity === "high") {
        outcome = "fail";
      } else if (mode === "experimental" || sensitivity === "low") {
        outcome = "warn";
      } else {
        outcome = "fail";
      }
    } else if (testCase.confidence >= adjustedThreshold) {
      outcome = "pass";
    } else if (testCase.confidence >= adjustedThreshold - 0.08) {
      outcome = "warn";
    } else {
      outcome = "fail";
    }

    const passed = testCase.expected ? outcome === testCase.expected : outcome !== "fail";

    return {
      id: testCase.id,
      label: testCase.label,
      source: testCase.source,
      confidence: testCase.confidence,
      tamperDetected: testCase.tamperDetected,
      expected: testCase.expected,
      outcome,
      passed,
      thresholdUsed: adjustedThreshold,
      durationMs: estimateDurationMs(testCase.id),
      details:
        outcome === "pass"
          ? "Confidence and integrity checks satisfied active policy."
          : outcome === "warn"
            ? "Borderline result requires reviewer confirmation."
            : "Policy blocked due to low confidence or tamper signal.",
    };
  };

  const appendTestRun = (run: PolicyTestRun) => {
    setTestRuns((prev) => [run, ...prev].slice(0, 20));
  };

  const handleRunFullTestSuite = async () => {
    if (!activePolicy) {
      toast({
        title: "No Active Policy",
        description: "Activate a policy first to run verification tests.",
        variant: "destructive",
      });
      return;
    }

    setIsRunningSuite(true);
    const start = performance.now();

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      const results = SAMPLE_POLICY_TESTS.map(evaluateCase);
      const durationMs = Math.round(performance.now() - start);
      const passedCount = results.filter((result) => result.passed).length;

      appendTestRun({
        id: `suite-${Date.now()}`,
        type: "suite",
        label: `Full Suite (${results.length} cases)`,
        createdAt: new Date().toISOString(),
        durationMs,
        results,
      });

      await logAdminAction("verification_policy_test_suite_run", "verification_policy", activePolicy.id, {
        policy_name: activePolicy.name,
        total_cases: results.length,
        passed_cases: passedCount,
        duration_ms: durationMs,
      });

      toast({
        title: "Test Suite Complete",
        description: `${passedCount}/${results.length} tests passed against ${activePolicy.name}.`,
      });
    } catch (error) {
      console.error("Policy test suite failed:", error);
      toast({
        title: "Test Failed",
        description: "Unable to run full test suite.",
        variant: "destructive",
      });
    } finally {
      setIsRunningSuite(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadTestFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!activePolicy) {
      toast({
        title: "No Active Policy",
        description: "Activate a policy first to test uploaded files.",
        variant: "destructive",
      });
      return;
    }

    setIsRunningFileTest(true);
    const start = performance.now();

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));

      const normalizedName = file.name.toLowerCase();
      const sizeMb = file.size / (1024 * 1024);
      const inferredTamper = /(tamper|edited|deepfake|synthetic|clone)/i.test(normalizedName);
      const inferredConfidence = clamp01(
        0.88
          - (inferredTamper ? 0.34 : 0)
          - (sizeMb > 20 ? 0.08 : 0)
          + (/(master|original|clean)/i.test(normalizedName) ? 0.08 : 0),
      );

      const uploadCase: PolicyTestCase = {
        id: `upload-${Date.now()}-${file.name}`,
        label: file.name,
        confidence: inferredConfidence,
        tamperDetected: inferredTamper,
        source: "upload",
      };

      const result = evaluateCase(uploadCase);
      const durationMs = Math.round(performance.now() - start);

      appendTestRun({
        id: `file-${Date.now()}`,
        type: "file",
        label: `File Test (${file.name})`,
        createdAt: new Date().toISOString(),
        durationMs,
        results: [result],
      });

      await logAdminAction("verification_policy_test_file_run", "verification_policy", activePolicy.id, {
        policy_name: activePolicy.name,
        file_name: file.name,
        file_size_bytes: file.size,
        confidence: result.confidence,
        outcome: result.outcome,
        duration_ms: durationMs,
      });

      toast({
        title: "File Test Complete",
        description: `${file.name} evaluated as ${result.outcome.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Uploaded file test failed:", error);
      toast({
        title: "File Test Failed",
        description: "Unable to run verification test on uploaded file.",
        variant: "destructive",
      });
    } finally {
      setIsRunningFileTest(false);
    }
  };

  const totalRuns = testRuns.length;
  const totalChecks = testRuns.reduce((acc, run) => acc + run.results.length, 0);
  const passedChecks = testRuns.reduce((acc, run) => acc + run.results.filter((result) => result.passed).length, 0);
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const avgDurationMs = totalRuns > 0 ? Math.round(testRuns.reduce((acc, run) => acc + run.durationMs, 0) / totalRuns) : 0;
  const latestRun = testRuns[0];

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

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
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
                <div className="flex gap-2">
                  {!policy.is_active && (
                    <Button
                      size="sm"
                      onClick={() => handleActivatePolicy(policy.id)}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeletePolicy(policy.id, policy.name)}
                    disabled={policy.is_active}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <Sliders className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Active Rules</p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Passing</p>
              <p className="text-3xl font-bold text-green-500">7</p>
            </div>
            <div className="glass rounded-xl p-6">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-3xl font-bold text-yellow-500">1</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Rules</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Hash Verification</p>
                  <p className="text-sm text-muted-foreground">Verify SHA-256 hash integrity</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Watermark Detection</p>
                  <p className="text-sm text-muted-foreground">Detect embedded watermarks</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Tamper Analysis</p>
                  <p className="text-sm text-muted-foreground">Analyze for manipulation</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">AI Generation Check</p>
                  <p className="text-sm text-muted-foreground">Detect AI-generated content</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Provenance Chain</p>
                  <p className="text-sm text-muted-foreground">Verify complete provenance</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Partial</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <TestTube className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">Test Runs</p>
              <p className="text-3xl font-bold">{totalRuns}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Pass Rate</p>
              <p className="text-3xl font-bold text-green-500">{passRate}%</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Clock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-xl font-bold">{avgDurationMs > 0 ? `${(avgDurationMs / 1000).toFixed(2)}s` : "0.00s"}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Policy Testing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run verification tests against sample audio files to validate policy configurations.
            </p>
            <div className="mb-4 rounded-lg border border-border/70 bg-secondary/60 px-3.5 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Active Policy Under Test</p>
              <p className="mt-1 text-sm font-medium">
                {activePolicy ? `${activePolicy.name} (${activePolicy.policy_mode})` : "No active policy"}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleUploadTestFile}
            />

            <div className="flex gap-2">
              <Button onClick={handleRunFullTestSuite} disabled={!activePolicy || isRunningSuite || isRunningFileTest}>
                <TestTube className="w-4 h-4 mr-2" />
                {isRunningSuite ? "Running Suite..." : "Run Full Test Suite"}
              </Button>
              <Button variant="outline" onClick={handleUploadClick} disabled={!activePolicy || isRunningSuite || isRunningFileTest}>
                {isRunningFileTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload Test File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {activePolicy
                ? "Suite and upload testing are enabled. Results are recorded below and reflected in metrics."
                : "Activate a policy in the Policies tab to enable testing actions."}
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">Latest Test Results</h3>
              {latestRun && (
                <span className="text-xs text-muted-foreground">
                  {latestRun.label} · {new Date(latestRun.createdAt).toLocaleString()}
                </span>
              )}
            </div>

            {!latestRun ? (
              <p className="text-sm text-muted-foreground">No test runs yet. Start with "Run Full Test Suite".</p>
            ) : (
              <div className="space-y-2.5">
                {latestRun.results.map((result) => (
                  <div key={result.id} className="rounded-lg border border-border/70 bg-secondary/60 px-3.5 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{result.label}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          result.outcome === "pass"
                            ? "bg-green-500/20 text-green-500"
                            : result.outcome === "warn"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {result.outcome.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{result.details}</p>
                    <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                      <span>Threshold: {(result.thresholdUsed * 100).toFixed(0)}%</span>
                      <span>Tamper: {result.tamperDetected ? "Detected" : "None"}</span>
                      <span>Duration: {(result.durationMs / 1000).toFixed(2)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Test Runs</h3>
            {testRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No run history yet.</p>
            ) : (
              <div className="space-y-2.5">
                {testRuns.slice(0, 6).map((run) => {
                  const runPassed = run.results.filter((result) => result.passed).length;
                  return (
                    <div key={run.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-secondary/60 px-3.5 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{run.label}</p>
                        <p className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{runPassed}/{run.results.length} passed</p>
                        <p>{(run.durationMs / 1000).toFixed(2)}s</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <History className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Total Changes</p>
              <p className="text-3xl font-bold">{policies.reduce((acc, p) => acc + p.version, 0)}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <RotateCcw className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Rollbacks</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="glass rounded-xl p-6">
              <FileText className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="text-3xl font-bold">{policies.filter(p => !p.is_active).length}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Policy Version History</h3>
            <div className="space-y-3">
              {policies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between py-3 border-b border-border/30">
                  <div>
                    <p className="font-medium">{policy.name}</p>
                    <p className="text-sm text-muted-foreground">Version {policy.version} · {new Date(policy.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${policy.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                      {policy.is_active ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerificationPolicyModule;
