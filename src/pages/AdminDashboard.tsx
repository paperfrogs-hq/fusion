// Fusion Admin Dashboard - Cryptographic Control Plane
// Modular dashboard with role-based access control

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Key, FileAudio, Users, AlertTriangle, BarChart3, 
  LogOut, Menu, X, Database, Lock, Activity, FileText, Music, Building2, ChevronRight
} from "lucide-react";
import { getSession, clearSession, hasPermission } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";
import type { LucideIcon } from "lucide-react";

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
import UserManagementModule from "@/components/admin/UserManagementModule";
import SecurityMonitoringModule from "@/components/admin/SecurityMonitoringModule";
import BusinessApprovalModule from "@/components/admin/BusinessApprovalModule";

type Module = 
  | "overview"
  | "audit-log"
  | "key-management"
  | "audio-provenance"
  | "user-audio"
  | "users"
  | "clients"
  | "business-approvals"
  | "incidents"
  | "security"
  | "analytics"
  | "verification-policy"
  | "compliance"
  | "system-control"
  | "waitlist";

interface NavigationItem {
  id: Module;
  label: string;
  icon: LucideIcon;
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
    { id: "users", label: "User Management", icon: Users, permission: "client_management" },
    { id: "clients", label: "Clients", icon: Users, permission: "client_management" },
    { id: "business-approvals", label: "Business Approvals", icon: Building2, permission: "client_management" },
    { id: "verification-policy", label: "Verification Policy", icon: Shield, permission: "verification_control" },
    { id: "security", label: "Security Monitor", icon: Shield, permission: "security_incidents" },
    { id: "incidents", label: "Incidents", icon: AlertTriangle, permission: "security_incidents" },
    { id: "analytics", label: "Analytics", icon: Activity, permission: "read_analytics" },
    { id: "compliance", label: "Compliance", icon: Lock, permission: "compliance" },
    { id: "system-control", label: "System Control", icon: Database, permission: "system_control" },
    { id: "waitlist", label: "Waitlist", icon: Users },
  ];

  const visibleNavItems = navigationItems.filter(
    item => !item.permission || hasPermission(item.permission) || hasPermission("*")
  );

  const activeModuleItem = visibleNavItems.find((item) => item.id === activeModule);
  const moduleDescriptions: Record<Module, string> = {
    overview: "Platform health, events, and system-wide status.",
    "audit-log": "Immutable timeline of administrative actions and operations.",
    "key-management": "Manage cryptographic keys, lifecycle, and policy controls.",
    "audio-provenance": "Track provenance records and verification artifacts.",
    "user-audio": "Inspect and govern uploaded audio assets from users.",
    users: "Manage user accounts, roles, and account actions.",
    clients: "Control client organizations and access posture.",
    "business-approvals": "Review pending business approvals and decisions.",
    incidents: "Monitor and investigate active incident records.",
    security: "Security posture, alerts, and continuous monitoring.",
    analytics: "Telemetry, usage analytics, and trend visibility.",
    "verification-policy": "Configure trust and verification policy behavior.",
    compliance: "Compliance and standards reporting visibility.",
    "system-control": "Infrastructure-level controls and operational tools.",
    waitlist: "Track inbound waitlist entries and qualification flow.",
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-1", mobile ? "p-4" : "p-4 md:p-5")}>
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveModule(item.id);
              if (mobile) {
                setMobileMenuOpen(false);
              }
            }}
            className={cn(
              "group w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
              "flex items-center gap-3",
              isActive
                ? "border-primary/45 bg-primary/15 text-foreground shadow-[0_0_24px_-16px_rgba(182,255,0,0.85)]"
                : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-secondary/75 hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span className="text-sm font-medium">{item.label}</span>
            <ChevronRight
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isActive ? "translate-x-0 text-primary" : "-translate-x-1 text-muted-foreground/60"
              )}
            />
          </button>
        );
      })}
    </nav>
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
      case "users":
        return <UserManagementModule />;
      case "clients":
        return <ClientManagementModule />;
      case "business-approvals":
        return <BusinessApprovalModule />;
      case "incidents":
        return <IncidentMonitoringModule />;
      case "security":
        return <SecurityMonitoringModule />;
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[-120px] top-[16%] h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-160px] right-[-40px] h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:w-[300px] xl:w-[320px] lg:flex-col border-r border-border/80 bg-card/70 backdrop-blur-xl">
          <div className="border-b border-border/75 px-6 py-6">
            <img 
              src="/Logo-01-transparent.png" 
              alt="Fusion Logo" 
              className="fusion-logo-lockup h-auto w-[150px]"
            />
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Admin Control Plane</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <NavLinks />
          </div>

          <div className="border-t border-border/75 p-5">
            <div className="rounded-2xl border border-border/80 bg-secondary/65 px-4 py-3.5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Signed in as</p>
              <p className="mt-1.5 truncate text-sm font-medium text-foreground">{admin.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{admin.role?.name || "User"}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="mt-3 h-10 w-full"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/78 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/85 bg-secondary/60 text-foreground transition-colors hover:bg-secondary lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Admin Workspace</p>
                <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                  {activeModuleItem?.label || "Overview"}
                </h1>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <Badge className="hidden md:inline-flex">{admin.role?.name || "User"}</Badge>
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">Secure session active</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-10"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              <div className="mb-5 rounded-2xl border border-border/80 bg-secondary/45 px-4 py-3 sm:px-5">
                <p className="text-sm text-muted-foreground">
                  {moduleDescriptions[activeModule]}
                </p>
              </div>
              <section className="surface-panel p-3 sm:p-4 lg:p-6">
                {renderModule()}
              </section>
            </div>
          </main>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu overlay"
              />
              <motion.aside
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative flex h-full w-[86%] max-w-[340px] flex-col border-r border-border bg-card"
              >
                <div className="border-b border-border px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <img 
                        src="/Logo-01-transparent.png" 
                        alt="Fusion Logo" 
                        className="fusion-logo-lockup h-auto w-[150px]"
                      />
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Admin Control Plane</p>
                    </div>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <NavLinks mobile />
                </div>

                <div className="border-t border-border p-4">
                  <div className="rounded-xl border border-border/80 bg-secondary/60 px-3.5 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Signed in as</p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">{admin.role?.name || "User"}</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="mt-3 h-10 w-full"
                    size="sm"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
