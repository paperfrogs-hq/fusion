// Fusion Admin Dashboard - Cryptographic Control Plane
// Modular dashboard with role-based access control

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Key, FileAudio, Users, AlertTriangle, BarChart3, 
  Settings, LogOut, Menu, X, Database, Lock, Activity, FileText, Music
} from "lucide-react";
import { getSession, clearSession, hasPermission } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types/admin";

// Import dashboard modules
import AuditLogModule from "@/components/admin/AuditLogModule";
import KeyManagementModule from "@/components/admin/KeyManagementModule";
import AudioProvenanceModule from "@/components/admin/AudioProvenanceModule";
import ClientManagementModule from "@/components/admin/ClientManagementModule";
import IncidentMonitoringModule from "@/components/admin/IncidentMonitoringModule";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import VerificationPolicyModule from "@/components/admin/VerificationPolicyModule";
import ComplianceModule from "@/components/admin/ComplianceModule";
import SystemControlModule from "@/components/admin/SystemControlModule";
import WaitlistModule from "@/components/admin/WaitlistModule";
import UserAudioManagementModule from "@/components/admin/UserAudioManagementModule";

type Module = 
  | "overview"
  | "audit-log"
  | "key-management"
  | "audio-provenance"
  | "user-audio"
  | "clients"
  | "incidents"
  | "analytics"
  | "verification-policy"
  | "compliance"
  | "system-control"
  | "waitlist";

interface NavigationItem {
  id: Module;
  label: string;
  icon: any;
  permission?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeModule, setActiveModule] = useState<Module>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate("/admin");
      return;
    }
    setAdmin(session.admin);
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/admin");
  };

  const navigationItems: NavigationItem[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "audit-log", label: "Audit Log", icon: FileText, permission: "read_audit_log" },
    { id: "key-management", label: "Key Management", icon: Key, permission: "key_management" },
    { id: "audio-provenance", label: "Audio Provenance", icon: FileAudio, permission: "provenance_management" },
    { id: "user-audio", label: "User Audio Files", icon: Music, permission: "read_analytics" },
    { id: "clients", label: "Clients", icon: Users, permission: "client_management" },
    { id: "verification-policy", label: "Verification Policy", icon: Shield, permission: "verification_control" },
    { id: "incidents", label: "Incidents", icon: AlertTriangle, permission: "security_incidents" },
    { id: "analytics", label: "Analytics", icon: Activity, permission: "read_analytics" },
    { id: "compliance", label: "Compliance", icon: Lock, permission: "compliance" },
    { id: "system-control", label: "System Control", icon: Database, permission: "system_control" },
    { id: "waitlist", label: "Waitlist", icon: Users },
  ];

  const visibleNavItems = navigationItems.filter(
    item => !item.permission || hasPermission(item.permission) || hasPermission("*")
  );

  const renderModule = () => {
    switch (activeModule) {
      case "overview":
        return <AnalyticsDashboard />;
      case "audit-log":
        return <AuditLogModule />;
      case "key-management":
        return <KeyManagementModule />;
      case "audio-provenance":
        return <AudioProvenanceModule />;
      case "user-audio":
        return <UserAudioManagementModule />;
      case "clients":
        return <ClientManagementModule />;
      case "incidents":
        return <IncidentMonitoringModule />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "verification-policy":
        return <VerificationPolicyModule />;
      case "compliance":
        return <ComplianceModule />;
      case "system-control":
        return <SystemControlModule />;
      case "waitlist":
        return <WaitlistModule />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img 
              src="/Fusion_Icon-No-BG-01.png" 
              alt="Fusion Logo" 
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">Fusion</h1>
              <p className="text-xs text-muted-foreground">Control Plane</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-3 bg-accent rounded-lg mb-3">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium truncate">{admin.email}</p>
            <p className="text-xs text-muted-foreground mt-1">{admin.role?.name || "User"}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 400 400" fill="none">
              <defs>
                <linearGradient id="fusionGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
              <path d="M200 80 L280 160 L240 160 L240 240 L280 240 L200 320 L120 240 L160 240 L160 160 L120 160 Z" 
                    fill="url(#fusionGradientMobile)"/>
            </svg>
            <h1 className="font-display text-lg font-bold gradient-text">Fusion</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <nav className="p-4 space-y-1">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-border">
                <div className="px-4 py-3 bg-accent rounded-lg mb-3">
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-medium truncate">{admin.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{admin.role?.name || "User"}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:mt-0 mt-16">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
