// Analytics Dashboard Overview Module

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, TrendingUp, Users, FileAudio, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
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
