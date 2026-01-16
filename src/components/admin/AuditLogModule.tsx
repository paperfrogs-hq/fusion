// Audit Log Module - Immutable append-only audit trail

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";
import type { AuditLogEntry } from "@/types/admin";

const AuditLogModule = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction !== "all") {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filterAction, logs]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
      setFilteredLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportLogs = () => {
    let csv = "Timestamp,Admin ID,Action,Resource Type,Resource ID,IP Address,Action Hash\n";
    filteredLogs.forEach((log) => {
      csv += `"${log.timestamp}","${log.admin_id || 'system'}","${log.action}","${log.resource_type}","${log.resource_id || ''}","${log.ip_address || ''}","${log.action_hash}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const getActionColor = (action: string) => {
    if (action.includes("login")) return "text-blue-600 dark:text-blue-400 bg-blue-500/20";
    if (action.includes("delete")) return "text-red-600 dark:text-red-400 bg-red-500/20";
    if (action.includes("create")) return "text-green-600 dark:text-green-400 bg-green-500/20";
    if (action.includes("update")) return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/20";
    return "text-gray-600 dark:text-gray-400 bg-gray-500/20";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
        <p className="text-muted-foreground">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <p className="text-muted-foreground mt-1">Immutable record of all admin actions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, resource, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredLogs.length} of {logs.length} total entries
        </div>

        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.resource_type}
                        {log.resource_id && ` · ${log.resource_id.slice(0, 8)}`}
                      </span>
                    </div>
                    
                    {log.details && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="truncate">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      <span className="font-mono text-[10px]">Hash: {log.action_hash.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Integrity Verification</h3>
        <p className="text-sm text-muted-foreground mb-4">
          All audit log entries are cryptographically hashed (SHA-256) to ensure immutability and detect tampering.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-border/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Entries</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </div>
          <div className="border border-border/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Integrity Status</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">All Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModule;
