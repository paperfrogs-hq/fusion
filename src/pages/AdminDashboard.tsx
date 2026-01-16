import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Mail, LogOut, Trash2, Download } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface WaitlistUser {
  id: number;
  email: string;
  confirmed: boolean;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"waitlist" | "contacts">("waitlist");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const authData = localStorage.getItem("adminAuth");
    if (!authData) {
      navigate("/admin");
      return;
    }

    const { email, timestamp } = JSON.parse(authData);
    
    // Check if session is still valid (24 hours)
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      handleLogout();
      return;
    }

    if (!email.endsWith("@paperfrogs.dev")) {
      handleLogout();
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch waitlist users
      const { data: waitlistData, error: waitlistError } = await supabase
        .from("early_access_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (waitlistError) throw waitlistError;
      setWaitlistUsers(waitlistData || []);

      // Fetch contact messages
      const { data: contactData, error: contactError } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactError) throw contactError;
      setContactMessages(contactData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin");
  };

  const handleDeleteWaitlistUser = async (id: number) => {
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
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Message deleted",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = (type: "waitlist" | "contacts") => {
    let csv = "";
    let filename = "";

    if (type === "waitlist") {
      csv = "Email,Confirmed,Created At\n";
      waitlistUsers.forEach((user) => {
        csv += `${user.email},${user.confirmed},${new Date(user.created_at).toLocaleString()}\n`;
      });
      filename = "waitlist-export.csv";
    } else {
      csv = "Name,Email,Subject,Message,Created At\n";
      contactMessages.forEach((msg) => {
        csv += `"${msg.name}","${msg.email}","${msg.subject}","${msg.message}","${new Date(msg.created_at).toLocaleString()}"\n`;
      });
      filename = "contacts-export.csv";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="font-display text-xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Fusion by Paperfrogs HQ</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Waitlist Users</p>
                <p className="text-3xl font-bold mt-1">{waitlistUsers.length}</p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Contact Messages</p>
                <p className="text-3xl font-bold mt-1">{contactMessages.length}</p>
              </div>
              <Mail className="w-10 h-10 text-accent" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "waitlist" ? "hero" : "outline"}
            onClick={() => setActiveTab("waitlist")}
          >
            Waitlist
          </Button>
          <Button
            variant={activeTab === "contacts" ? "hero" : "outline"}
            onClick={() => setActiveTab("contacts")}
          >
            Contact Messages
          </Button>
        </div>

        {/* Waitlist Tab */}
        {activeTab === "waitlist" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Waitlist Users</h2>
              <Button size="sm" variant="outline" onClick={() => exportToCSV("waitlist")}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/50">
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.confirmed ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {user.confirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWaitlistUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Contact Messages</h2>
              <Button size="sm" variant="outline" onClick={() => exportToCSV("contacts")}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {contactMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{msg.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      From: {msg.name} ({msg.email})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMessage(msg.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{msg.message}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
