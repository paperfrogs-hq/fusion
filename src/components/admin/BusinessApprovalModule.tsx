// Business Account Approval Module
// Admin module in "Business Approvals" category for approving/rejecting pending business accounts

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle, XCircle, Clock, RefreshCw, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { logAdminAction } from "@/lib/admin-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PendingBusiness {
  id: string;
  name: string;
  contact_email: string;
  account_status: string;
  created_at: string;
  organization_type: string;
  users: {
    id: string;
    email: string;
    full_name: string;
    account_status: string;
  }[];
}

const BusinessApprovalModule = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<PendingBusiness | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50", label: "Pending Approval" };
      case "pending_verification":
        return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50", label: "Pending Verification" };
      case "suspended":
        return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50", label: "Suspended" };
      default:
        return { bg: "bg-neutral-500/20", text: "text-neutral-400", border: "border-neutral-500/50", label: status };
    }
  };

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  const fetchPendingBusinesses = async () => {
    setIsLoading(true);
    try {
      // Use Netlify function with service role key to bypass RLS
      const response = await fetch("/.netlify/functions/business-approval", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("Business approval fetch response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch businesses");
      }

      setPendingBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending business accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (business: PendingBusiness) => {
    if (!confirm(`Are you sure you want to approve "${business.name}"?`)) return;

    setProcessingId(business.id);
    try {
      // Use Netlify function to approve
      const response = await fetch("/.netlify/functions/business-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          organizationId: business.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve business");
      }

      // Send approval emails to all users
      for (const user of data.users || []) {
        try {
          await fetch("/.netlify/functions/send-approval-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.full_name || user.email.split("@")[0],
              organizationName: business.name,
              approved: true,
            }),
          });
        } catch (emailError) {
          console.error("Error sending approval email:", emailError);
        }
      }

      // Log admin action
      await logAdminAction("business_approved", "organization", business.id, {
        name: business.name,
        users: (data.users || []).map((u: any) => u.email),
      });

      toast({
        title: "Business Approved",
        description: `${business.name} has been approved and notified via email`,
      });

      // Refresh the list
      fetchPendingBusinesses();
    } catch (error) {
      console.error("Error approving business:", error);
      toast({
        title: "Error",
        description: "Failed to approve business account",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (business: PendingBusiness) => {
    setSelectedBusiness(business);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedBusiness) return;

    setProcessingId(selectedBusiness.id);
    setRejectDialogOpen(false);

    try {
      // Use Netlify function to reject
      const response = await fetch("/.netlify/functions/business-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          organizationId: selectedBusiness.id,
          reason: rejectReason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject business");
      }

      // Send rejection emails to all users
      for (const user of data.users || []) {
        try {
          await fetch("/.netlify/functions/send-approval-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.full_name || user.email.split("@")[0],
              organizationName: selectedBusiness.name,
              approved: false,
              reason: rejectReason || undefined,
            }),
          });
        } catch (emailError) {
          console.error("Error sending rejection email:", emailError);
        }
      }

      // Log admin action
      await logAdminAction("business_rejected", "organization", selectedBusiness.id, {
        name: selectedBusiness.name,
        reason: rejectReason,
        users: (data.users || []).map((u: any) => u.email),
      });

      toast({
        title: "Business Rejected",
        description: `${selectedBusiness.name} has been rejected and notified via email`,
      });

      // Refresh the list
      fetchPendingBusinesses();
    } catch (error) {
      console.error("Error rejecting business:", error);
      toast({
        title: "Error",
        description: "Failed to reject business account",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
      setSelectedBusiness(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Business Account Approvals
          </h2>
          <p className="text-neutral-400 mt-1">
            Review and approve pending business account applications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingBusinesses}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Needs Review</p>
                <p className="text-2xl font-bold text-white">{pendingBusinesses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : pendingBusinesses.length === 0 ? (
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">All Caught Up!</h3>
            <p className="text-neutral-400 mt-2">
              No pending business account applications at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingBusinesses.map((business) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-neutral-800/50 border-neutral-700 hover:border-neutral-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{business.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3" />
                          {business.contact_email}
                        </CardDescription>
                      </div>
                    </div>
                    {(() => {
                      const badge = getStatusBadge(business.account_status);
                      return (
                        <Badge variant="outline" className={`${badge.bg} ${badge.text} ${badge.border}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {badge.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Organization Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Type</p>
                      <p className="text-neutral-200 capitalize">{business.organization_type || "Business"}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Applied</p>
                      <p className="text-neutral-200">{formatDate(business.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Users</p>
                      <p className="text-neutral-200">{business.users.length}</p>
                    </div>
                  </div>

                  {/* Users List */}
                  {business.users.length > 0 && (
                    <div className="border-t border-neutral-700 pt-4">
                      <p className="text-sm text-neutral-500 mb-2">Associated Users:</p>
                      <div className="space-y-2">
                        {business.users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 text-sm bg-neutral-900/50 rounded-lg px-3 py-2"
                          >
                            <User className="w-4 h-4 text-neutral-400" />
                            <span className="text-neutral-200">{user.full_name || "No name"}</span>
                            <span className="text-neutral-500">({user.email})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-700">
                    <Button
                      onClick={() => handleApprove(business)}
                      disabled={processingId === business.id}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processingId === business.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openRejectDialog(business)}
                      disabled={processingId === business.id}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20 gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Business Application</DialogTitle>
            <DialogDescription>
              Rejecting "{selectedBusiness?.name}". Optionally provide a reason that will be included in the rejection email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessApprovalModule;
