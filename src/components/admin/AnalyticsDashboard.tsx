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

      setStats({
        totalWaitlist: waitlistCount || 0,
        totalMessages: messagesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    { label: "Waitlist Users", value: stats.totalWaitlist, icon: Users, color: "text-blue-500" },
    { label: "Contact Messages", value: stats.totalMessages, icon: FileAudio, color: "text-purple-500" },
    { label: "Audio Verified", value: "Coming Soon", icon: Shield, color: "text-green-500" },
    { label: "Active Clients", value: "Coming Soon", icon: Activity, color: "text-orange-500" },
    { label: "Tamper Detections", value: "Coming Soon", icon: AlertTriangle, color: "text-red-500" },
    { label: "Success Rate", value: "Coming Soon", icon: TrendingUp, color: "text-teal-500" },
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
