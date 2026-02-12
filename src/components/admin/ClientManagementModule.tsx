// Client & Organization Management Module
// Shows registered business accounts with usage statistics

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Building2, Activity, Ban, CheckCircle, RefreshCw, 
  FileAudio, Shield, Key, Clock, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { logAdminAction } from "@/lib/admin-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrganizationStats {
  members: number;
  audioFiles: number;
  verifications: number;
  apiKeys: number;
  quotaUsed: number;
  quotaLimit: number;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  account_status: string;
  plan_type: string;
  billing_status: string;
  quota_verifications_monthly: number;
  quota_used_current_month: number;
  created_at: string;
  contact_email?: string;
  stats: OrganizationStats;
}

const ClientManagementModule = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/client-management", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organizations");
      }

      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registered clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (orgId: string, action: "suspend" | "activate" | "delete", orgName: string) => {
    const actionText = action === "suspend" ? "suspend" : action === "activate" ? "activate" : "delete";
    if (!confirm(`Are you sure you want to ${actionText} "${orgName}"?`)) return;

    setProcessingId(orgId);
    try {
      const response = await fetch("/.netlify/functions/client-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, organizationId: orgId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${actionText} organization`);
      }

      await logAdminAction(`organization_${action}d`, "organization", orgId, { name: orgName });

      toast({
        title: `Organization ${actionText}d`,
        description: `${orgName} has been ${actionText}d successfully`,
      });

      fetchOrganizations();
    } catch (error) {
      console.error(`Error ${actionText}ing organization:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionText} organization`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/50", icon: CheckCircle };
      case "suspended":
        return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50", icon: Ban };
      case "pending_approval":
        return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50", icon: Clock };
      case "pending_verification":
        return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50", icon: Clock };
      default:
        return { bg: "bg-neutral-500/20", text: "text-neutral-400", border: "border-neutral-500/50", icon: Activity };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOrgs = organizations.filter((org) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return org.account_status === "active";
    if (activeTab === "suspended") return org.account_status === "suspended";
    if (activeTab === "pending") return org.account_status.includes("pending");
    return true;
  });

  // Calculate totals
  const totalMembers = organizations.reduce((sum, org) => sum + (org.stats?.members || 0), 0);
  const totalAudioFiles = organizations.reduce((sum, org) => sum + (org.stats?.audioFiles || 0), 0);
  const totalVerifications = organizations.reduce((sum, org) => sum + (org.stats?.verifications || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Registered Clients
          </h2>
          <p className="text-neutral-400 mt-1">
            View and manage all registered business accounts and their usage
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrganizations}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Total Orgs</p>
                <p className="text-2xl font-bold text-white">{organizations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Active</p>
                <p className="text-2xl font-bold text-white">
                  {organizations.filter((o) => o.account_status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FileAudio className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Audio Files</p>
                <p className="text-2xl font-bold text-white">{totalAudioFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Verifications</p>
                <p className="text-2xl font-bold text-white">{totalVerifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-neutral-800/50">
          <TabsTrigger value="all">All ({organizations.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({organizations.filter((o) => o.account_status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({organizations.filter((o) => o.account_status.includes("pending")).length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({organizations.filter((o) => o.account_status === "suspended").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Organizations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredOrgs.length === 0 ? (
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">No Organizations Found</h3>
            <p className="text-neutral-400 mt-2">
              No registered clients match the current filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrgs.map((org) => {
            const statusBadge = getStatusBadge(org.account_status);
            const StatusIcon = statusBadge.icon;
            const quotaPercent = org.stats?.quotaLimit 
              ? Math.min(100, (org.stats.quotaUsed / org.stats.quotaLimit) * 100) 
              : 0;

            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-neutral-800/50 border-neutral-700 hover:border-neutral-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{org.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3" />
                            Registered {formatDate(org.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {org.account_status.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="bg-neutral-700/50 text-neutral-300 border-neutral-600">
                          {org.plan_type || "trial"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-neutral-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                          <Users className="w-4 h-4" />
                          Members
                        </div>
                        <p className="text-xl font-semibold text-white">{org.stats?.members || 0}</p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                          <FileAudio className="w-4 h-4" />
                          Audio Files
                        </div>
                        <p className="text-xl font-semibold text-white">{org.stats?.audioFiles || 0}</p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                          <Shield className="w-4 h-4" />
                          Verifications
                        </div>
                        <p className="text-xl font-semibold text-white">{org.stats?.verifications || 0}</p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                          <Key className="w-4 h-4" />
                          API Keys
                        </div>
                        <p className="text-xl font-semibold text-white">{org.stats?.apiKeys || 0}</p>
                      </div>
                    </div>

                    {/* Quota Usage */}
                    <div className="bg-neutral-900/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Monthly Quota Usage</span>
                        <span className="text-sm text-neutral-300">
                          {org.stats?.quotaUsed || 0} / {org.stats?.quotaLimit || 1000}
                        </span>
                      </div>
                      <Progress value={quotaPercent} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-700">
                      {org.account_status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                          onClick={() => handleAction(org.id, "suspend", org.name)}
                          disabled={processingId === org.id}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          {processingId === org.id ? "Processing..." : "Suspend"}
                        </Button>
                      ) : org.account_status === "suspended" ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(org.id, "activate", org.name)}
                          disabled={processingId === org.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {processingId === org.id ? "Processing..." : "Activate"}
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={() => handleAction(org.id, "delete", org.name)}
                        disabled={processingId === org.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientManagementModule;
