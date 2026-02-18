// System & Protocol Control Module

import { useState } from "react";
import { Database, Info, Server, AlertTriangle, Shield, Settings, Power, RotateCcw, HardDrive, Clock, CheckCircle, XCircle, Wrench, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SystemControlModule = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System & Protocol Control</h2>
        <p className="text-muted-foreground mt-1">Protocol versioning, emergency controls, and system integrity monitoring</p>
      </div>

      <Tabs defaultValue="protocol" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="protocol" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Protocol
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="integrity" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Integrity
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocol" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <Server className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Protocol Version</p>
              <p className="text-3xl font-bold">v1.0.0</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Database className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">Schema Version</p>
              <p className="text-3xl font-bold">v2.1</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-xl font-bold text-green-500">Online</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Clock className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-xl font-bold">Today</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">API Version</p>
                  <p className="text-sm text-muted-foreground">Current REST API version</p>
                </div>
                <span className="text-sm font-mono">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Verification Protocol</p>
                  <p className="text-sm text-muted-foreground">Audio verification protocol</p>
                </div>
                <span className="text-sm font-mono">Fusion-VP-1.0</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Encryption Standard</p>
                  <p className="text-sm text-muted-foreground">Data encryption algorithm</p>
                </div>
                <span className="text-sm font-mono">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Hash Algorithm</p>
                  <p className="text-sm text-muted-foreground">Audio fingerprinting hash</p>
                </div>
                <span className="text-sm font-mono">SHA-256</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6 border-l-4 border-yellow-500">
              <Wrench className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Maintenance Mode</p>
              <p className="text-xl font-bold">{maintenanceMode ? "Active" : "Inactive"}</p>
            </div>
            <div className="glass rounded-xl p-6 border-l-4 border-red-500">
              <XCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">Emergency Stops</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="glass rounded-xl p-6 border-l-4 border-green-500">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="text-xl font-bold text-green-500">Healthy</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Emergency Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Disable all user operations temporarily</p>
                </div>
                <Button 
                  variant={maintenanceMode ? "destructive" : "outline"}
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  {maintenanceMode ? "Disable" : "Enable"}
                </Button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <div>
                  <p className="font-medium">Emergency Stop</p>
                  <p className="text-sm text-muted-foreground">Immediately halt all verification operations</p>
                </div>
                <Button variant="destructive" disabled>
                  <Power className="w-4 h-4 mr-2" />
                  Emergency Stop
                </Button>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">System Restart</p>
                  <p className="text-sm text-muted-foreground">Graceful restart of verification services</p>
                </div>
                <Button variant="outline" disabled>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-yellow-500/50 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400">Warning</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Emergency controls affect all users and services. Use with caution. All actions are logged in the audit trail.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Database</p>
              <p className="text-xl font-bold text-green-500">Healthy</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="text-xl font-bold text-green-500">Healthy</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Auth System</p>
              <p className="text-xl font-bold text-green-500">Healthy</p>
            </div>
            <div className="glass rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Audit Log</p>
              <p className="text-xl font-bold text-green-500">Healthy</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">System Integrity Checks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Database connection pool</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Operational</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Supabase Storage</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Operational</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Netlify Functions</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Operational</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Cryptographic Keys</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Valid</span>
              </div>
            </div>
            <Button className="mt-4" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Run Full Integrity Check
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <Archive className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Total Backups</p>
              <p className="text-3xl font-bold">7</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Clock className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Last Backup</p>
              <p className="text-xl font-bold">2h ago</p>
            </div>
            <div className="glass rounded-xl p-6">
              <HardDrive className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">Backup Size</p>
              <p className="text-xl font-bold">2.4 GB</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Backup Configuration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Automatic Backups</p>
                  <p className="text-sm text-muted-foreground">Daily database backups</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Retention Period</p>
                  <p className="text-sm text-muted-foreground">Keep backups for</p>
                </div>
                <span className="text-sm font-medium">7 days</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="font-medium">Point-in-Time Recovery</p>
                  <p className="text-sm text-muted-foreground">Restore to specific timestamp</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Available</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Encrypted Backups</p>
                  <p className="text-sm text-muted-foreground">AES-256 encryption at rest</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Enabled</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button disabled>
                <Archive className="w-4 h-4 mr-2" />
                Create Backup Now
              </Button>
              <Button variant="outline" disabled>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore from Backup
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="glass rounded-xl p-8 text-center">
        <div className="p-4 bg-accent rounded-lg inline-block">
          <p className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Full system control requires: protocol_versions, emergency_controls, system_integrity_log tables</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemControlModule;
