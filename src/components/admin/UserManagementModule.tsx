// User Management Module - Manage all registered users

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Download, MoreVertical, Ban, CheckCircle, Mail, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  account_status: string;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string;
  api_key?: string;
}

const UserManagementModule = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, statusFilter, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.account_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (userId: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "suspend" : "activate";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          account_status: currentStatus === "active" ? "suspended" : "active",
        })
        .eq("id", userId);

      if (error) throw error;

      await logAdminAction(`user_${action}ed`, "user", userId);

      toast({
        title: `User ${action}ed`,
        description: `The user account has been ${action}ed`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userEmail}? This will delete all their data including audio files, sessions, and verification history.`)) return;

    try {
      // Get admin token from session storage
      const adminToken = sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token");

      const response = await fetch("/.netlify/functions/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      await logAdminAction("user_deleted", "user", userId);

      toast({
        title: "User Deleted",
        description: `${userEmail} and all associated data have been permanently deleted`,
      });

      fetchUsers();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Delete user error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Name", "Type", "Status", "Verified", "Created"];
    const rows = filteredUsers.map((user) => [
      user.email,
      user.full_name || "",
      user.user_type,
      user.account_status,
      user.email_verified ? "Yes" : "No",
      new Date(user.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fusion-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.account_status === "active").length,
    suspended: users.filter((u) => u.account_status === "suspended").length,
    verified: users.filter((u) => u.email_verified).length,
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 text-foreground">User Management</h2>
        <p className="text-muted-foreground">Manage all registered users and their accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.suspended}</p>
            </div>
            <Ban className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.verified}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="glass rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending</option>
          </select>

          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button onClick={fetchUsers} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">{user.full_name || "No name"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 capitalize">
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.account_status)}`}>
                        {user.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant={user.account_status === "active" ? "destructive" : "default"}
                          onClick={() => handleSuspendUser(user.id, user.account_status)}
                        >
                          {user.account_status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedUser.full_name || "User Details"}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm font-mono mt-1 text-foreground">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Type</label>
                    <p className="text-sm capitalize mt-1 text-foreground">{selectedUser.user_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <p className="text-sm capitalize mt-1 text-foreground">{selectedUser.account_status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                    <p className="text-sm mt-1 text-foreground">{selectedUser.email_verified ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="text-sm mt-1 text-foreground">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  {selectedUser.last_login_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                      <p className="text-sm mt-1 text-foreground">{new Date(selectedUser.last_login_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {selectedUser.api_key && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">API Key</label>
                    <p className="text-xs font-mono mt-1 bg-muted/50 p-2 rounded break-all text-foreground">
                      {selectedUser.api_key}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                <Button
                  variant={selectedUser.account_status === "active" ? "destructive" : "default"}
                  onClick={() => {
                    handleSuspendUser(selectedUser.id, selectedUser.account_status);
                    setShowDetailModal(false);
                  }}
                >
                  {selectedUser.account_status === "active" ? "Suspend Account" : "Activate Account"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}
                >
                  Delete User
                </Button>
                <Button variant="outline" onClick={() => setShowDetailModal(false)} className="ml-auto">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagementModule;
