// Waitlist Module - Manage early access signups

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, Users, CheckCircle, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WaitlistUser {
  id: number;
  email: string;
  confirmed: boolean;
  created_at: string;
  invite_sent_at?: string;
  invite_used_at?: string;
}

const WaitlistModule = () => {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WaitlistUser | null>(null);
  const [signupType, setSignupType] = useState<"user" | "client">("client");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("early_access_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch waitlist users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (id: number, email: string) => {
    if (!confirm(`Confirm ${email} and send welcome email?`)) return;

    try {
      const response = await fetch("/.netlify/functions/confirm-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm user");
      }

      toast({
        title: "Confirmed",
        description: "Welcome email sent to " + email,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm user",
        variant: "destructive",
      });
    }
  };

  const handleSendEarlyAccess = async (id: number, email: string) => {
    if (!confirm(`Send early access credentials to ${email}?`)) return;

    try {
      const response = await fetch("/.netlify/functions/send-early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send early access");
      }

      toast({
        title: "Early Access Sent",
        description: "API credentials sent to " + email,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send early access",
        variant: "destructive",
      });
    }
  };

  const openInviteModal = (user: WaitlistUser) => {
    setSelectedUser(user);
    setSignupType("client");
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedUser) return;
    setIsSending(true);

    try {
      const response = await fetch("/.netlify/functions/send-waitlist-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          email: selectedUser.email,
          signupType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      toast({
        title: "Invitation Sent",
        description: `Signup invitation sent to ${selectedUser.email}`,
      });
      setInviteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from("early_access_signups")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "User removed from waitlist",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    let csv = "Email,Confirmed,Created At\n";
    users.forEach((user) => {
      csv += `${user.email},${user.confirmed},${new Date(user.created_at).toLocaleString()}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Waitlist Management</h2>
          <p className="text-muted-foreground mt-1">Manage early access signups</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-xl p-6">
          <Users className="w-8 h-8 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <Users className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm text-muted-foreground">Confirmed</p>
          <p className="text-3xl font-bold">{users.filter(u => u.confirmed).length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <Users className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold">{users.filter(u => !u.confirmed).length}</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border/30 hover:bg-muted/20"
                >
                  <td className="py-3 px-4 text-sm font-medium">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.confirmed 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {user.confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.confirmed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleConfirm(user.id, user.email)}
                          title="Confirm and send welcome email"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openInviteModal(user)}
                        title={user.invite_sent_at ? "Resend signup invitation" : "Send signup invitation"}
                        className={user.invite_sent_at ? "text-purple-600" : "text-cyan-600"}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendEarlyAccess(user.id, user.email)}
                        title="Send early access credentials"
                      >
                        <Mail className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Signup Invitation</DialogTitle>
            <DialogDescription>
              Send a direct signup link to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={signupType}
                onValueChange={(value: "user" | "client") => setSignupType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">
                    Business Account (Client Portal)
                  </SelectItem>
                  <SelectItem value="user">
                    Individual Account (User Portal)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {signupType === "client"
                  ? "Invites to create an organization with API access"
                  : "Invites to create a personal user account"}
              </p>
            </div>

            {selectedUser?.invite_sent_at && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ An invitation was sent on{" "}
                {new Date(selectedUser.invite_sent_at).toLocaleDateString()}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button onClick={handleSendInvite} disabled={isSending}>
                {isSending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitlistModule;
