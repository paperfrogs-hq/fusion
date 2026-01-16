// Client & Platform Management Module

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Building2, Activity, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { logAdminAction } from "@/lib/admin-auth";
import type { Client } from "@/types/admin";

const ClientManagementModule = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    organization_type: "platform",
    compliance_region: "global",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      const { error } = await supabase
        .from("clients")
        .insert([{
          ...formData,
          client_status: "active",
          rate_limit_per_minute: 1000,
          rate_limit_per_day: 100000,
        }]);

      if (error) throw error;

      await logAdminAction("client_created", "client", formData.name, { email: formData.contact_email });

      toast({
        title: "Client Created",
        description: `${formData.name} has been added`,
      });

      fetchClients();
      setShowCreateForm(false);
      setFormData({ name: "", contact_email: "", organization_type: "platform", compliance_region: "global" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const handleSuspendClient = async (clientId: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "suspend" : "activate";
    if (!confirm(`Are you sure you want to ${action} this client?`)) return;

    try {
      const { error } = await supabase
        .from("clients")
        .update({
          client_status: currentStatus === "active" ? "suspended" : "active",
          suspended_at: currentStatus === "active" ? new Date().toISOString() : null,
        })
        .eq("id", clientId);

      if (error) throw error;

      await logAdminAction(`client_${action}ed`, "client", clientId);

      toast({
        title: `Client ${action}ed`,
        description: `The client has been ${action}ed`,
      });

      fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} client`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client & Platform Management</h2>
          <p className="text-muted-foreground mt-1">Manage platforms, AI companies, studios, and their API access</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-3xl font-bold">{clients.length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl font-bold">{clients.filter(c => c.client_status === "active").length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <Ban className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-muted-foreground">Suspended</p>
          <p className="text-3xl font-bold">{clients.filter(c => c.client_status === "suspended").length}</p>
        </div>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Add New Client</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Organization Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Contact Email</label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="contact@acme.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Organization Type</label>
              <select
                value={formData.organization_type}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="platform">Platform</option>
                <option value="ai_company">AI Company</option>
                <option value="studio">Studio</option>
                <option value="research">Research</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Compliance Region</label>
              <select
                value={formData.compliance_region}
                onChange={(e) => setFormData({ ...formData, compliance_region: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="global">Global</option>
                <option value="eu">EU</option>
                <option value="us">US</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateClient} disabled={!formData.name || !formData.contact_email}>
              Create Client
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No clients found. Add your first client to get started.</p>
          </div>
        ) : (
          clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{client.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      client.client_status === "active"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-red-500/20 text-red-600 dark:text-red-400"
                    }`}>
                      {client.client_status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                      {client.organization_type}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contact</p>
                      <p className="font-medium">{client.contact_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Region</p>
                      <p className="font-medium uppercase">{client.compliance_region}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate Limits</p>
                      <p className="font-medium">{client.rate_limit_per_minute}/min, {client.rate_limit_per_day}/day</p>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={client.client_status === "active" ? "destructive" : "default"}
                  onClick={() => handleSuspendClient(client.id, client.client_status)}
                >
                  {client.client_status === "active" ? "Suspend" : "Activate"}
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientManagementModule;
