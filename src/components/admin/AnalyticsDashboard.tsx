// Analytics Dashboard Overview Module

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, TrendingUp, Users, FileAudio, AlertTriangle, BarChart3, PieChart, Clock, Server, Database, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TOTPSetup from "./TOTPSetup";

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalWaitlist: 0,
    totalMessages: 0,
    totalUsers: 0,
    totalAudioFiles: 0,
    verifiedFiles: 0,
    pendingFiles: 0,
    activeClients: 0,
    tamperDetections: 0,
    successRate: "0%"
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: waitlistCount } = await supabase
        .from("early_access_signups")
        .select("*", { count: "exact", head: true });

      const { count: messagesCount } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true });

      // Fetch total users count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Fetch clients count separately (assuming clients have user_type='client')
      const { count: clientsCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("user_type", "client");

      // Fetch audio files count
      const { count: audioCount } = await supabase
        .from("user_audio_files")
        .select("*", { count: "exact", head: true });

      // Fetch verified audio count
      const { count: verifiedCount } = await supabase
        .from("user_audio_files")
        .select("*", { count: "exact", head: true })
        .eq("provenance_status", "verified");

      // Fetch pending audio count
      const { count: pendingCount } = await supabase
        .from("user_audio_files")
        .select("*", { count: "exact", head: true })
        .eq("provenance_status", "pending");

      // Fetch tamper detections
      const { count: tamperCount } = await supabase
        .from("audio_registry")
        .select("*", { count: "exact", head: true })
        .eq("provenance_status", "tampered");

      // Calculate success rate
      const successRate = audioCount && verifiedCount 
        ? Math.round((verifiedCount / audioCount) * 100) 
        : 0;

      setStats({
        totalWaitlist: waitlistCount || 0,
        totalMessages: messagesCount || 0,
        totalUsers: (usersCount || 0) - (clientsCount || 0), // Users only (excluding clients)
        totalAudioFiles: audioCount || 0,
        verifiedFiles: verifiedCount || 0,
        activeClients: clientsCount || 0,
        tamperDetections: tamperCount || 0,
        successRate: `${successRate}%`,
        pendingFiles: pendingCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    { label: "Registered Users", value: stats.totalUsers, icon: Users, color: "text-indigo-500", description: "Individual users (creators)" },
    { label: "Active Clients", value: stats.activeClients, icon: Activity, color: "text-orange-500", description: "Business clients" },
    { label: "Total Audio Files", value: stats.totalAudioFiles, icon: FileAudio, color: "text-purple-500", description: "Songs uploaded" },
    { label: "Verified Files", value: stats.verifiedFiles, icon: Shield, color: "text-green-500", description: "Successfully verified" },
    { label: "Pending Verification", value: stats.pendingFiles, icon: AlertTriangle, color: "text-yellow-500", description: "Awaiting verification" },
    { label: "Tamper Detections", value: stats.tamperDetections, icon: AlertTriangle, color: "text-red-500", description: "Hack attempts detected" },
    { label: "Verification Success", value: stats.successRate, icon: TrendingUp, color: "text-teal-500", description: "Success rate" },
    { label: "Waitlist", value: stats.totalWaitlist, icon: Users, color: "text-blue-500", description: "Early access signups" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Fusion Control Plane</h2>
        <p className="text-muted-foreground mt-2">
          Cryptographic infrastructure for audio provenance and verification
        </p>
      </div>

      {/* 2FA Setup Section */}
      <TOTPSetup />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <FileAudio className="w-4 h-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm">Database Connection</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm">Verification Engine</span>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">
                  Pending Setup
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm">Cryptographic Keys</span>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">
                  Pending Setup
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Audit Logging</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <Users className="w-8 h-8 text-indigo-500 mb-2" />
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Activity className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-3xl font-bold">{stats.activeClients}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Waitlist</p>
              <p className="text-3xl font-bold">{stats.totalWaitlist}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Clock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Messages</p>
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span>Individual Creators</span>
                <span className="text-lg font-bold">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span>Business Clients</span>
                <span className="text-lg font-bold">{stats.activeClients}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span>Pending Signups (Waitlist)</span>
                <span className="text-lg font-bold">{stats.totalWaitlist}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <FileAudio className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">Total Audio Files</p>
              <p className="text-3xl font-bold">{stats.totalAudioFiles}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Shield className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-3xl font-bold">{stats.verifiedFiles}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">{stats.pendingFiles}</p>
            </div>
            <div className="glass rounded-xl p-6">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">Tampered</p>
              <p className="text-3xl font-bold">{stats.tamperDetections}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Pipeline</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Success Rate</span>
                <span className="text-2xl font-bold text-green-500">{stats.successRate}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: stats.successRate }}></div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-3xl font-bold">45ms</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Server className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-3xl font-bold text-green-500">99.9%</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Database className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">DB Connections</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="glass rounded-xl p-6">
              <Activity className="w-8 h-8 text-teal-500 mb-2" />
              <p className="text-sm text-muted-foreground">API Requests/hr</p>
              <p className="text-3xl font-bold">1.2K</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span>CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                  <span className="text-sm">23%</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <span>Memory Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span>Storage Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <span className="text-sm">67%</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          Activity log will show recent admin actions, system events, and security incidents.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
