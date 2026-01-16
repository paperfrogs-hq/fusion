// Waitlist Module - Manage early access signups

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { motion } from "framer-motion";

interface WaitlistUser {
  id: number;
  email: string;
  confirmed: boolean;
  created_at: string;
}

const WaitlistModule = () => {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WaitlistModule;
