// Fusion Admin Dashboard - Cryptographic Control Plane
// Modular dashboard with role-based access control

import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  ChevronRight,
  Database,
  FileAudio,
  FileText,
  Home,
  Key,
  Lock,
  LogOut,
  Menu,
  Music,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clearSession, getSession } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";

const AuditLogModule = lazy(() => import("@/components/admin/AuditLogModule"));
const KeyManagementModule = lazy(() => import("@/components/admin/KeyManagementModule"));
const AudioProvenanceModule = lazy(() => import("@/components/admin/AudioProvenanceModule"));
const ClientManagementModule = lazy(() => import("@/components/admin/ClientManagementModule"));
const IncidentMonitoringModule = lazy(() => import("@/components/admin/IncidentMonitoringModule"));
const AnalyticsDashboard = lazy(() => import("@/components/admin/AnalyticsDashboard"));
const VerificationPolicyModule = lazy(() => import("@/components/admin/VerificationPolicyModule"));
const ComplianceModule = lazy(() => import("@/components/admin/ComplianceModule"));
const SystemControlModule = lazy(() => import("@/components/admin/SystemControlModule"));
const WaitlistModule = lazy(() => import("@/components/admin/WaitlistModule"));
const UserAudioManagementModule = lazy(() => import("@/components/admin/UserAudioManagementModule"));
const UserManagementModule = lazy(() => import("@/components/admin/UserManagementModule"));
const SecurityMonitoringModule = lazy(() => import("@/components/admin/SecurityMonitoringModule"));
const BusinessApprovalModule = lazy(() => import("@/components/admin/BusinessApprovalModule"));

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

const ACTIVE_MODULE_STORAGE_KEY = "fusion_admin_active_module";

const NAVIGATION_ITEMS: NavigationItem[] = [
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

const MODULE_DESCRIPTIONS: Record<Module, string> = {
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

const isModule = (value: string | null): value is Module => {
  if (!value) return false;
  return NAVIGATION_ITEMS.some((item) => item.id === value);
};

const formatSessionTimeLeft = (expiresAt?: string): string | null => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";

  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m left`;
};

const getInitialActiveModule = (): Module => {
  if (typeof window === "undefined") return "overview";
  const stored = window.localStorage.getItem(ACTIVE_MODULE_STORAGE_KEY);
  return isModule(stored) ? stored : "overview";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeModule, setActiveModule] = useState<Module>(getInitialActiveModule);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate("/admin");
      return;
    }

    setAdmin(session.admin);
    setSessionTimeLeft(formatSessionTimeLeft(session.expiresAt));
  }, [navigate]);

  useEffect(() => {
    const tick = () => {
      const session = getSession();
      if (!session) {
        setSessionTimeLeft(null);
        return;
      }
      setSessionTimeLeft(formatSessionTimeLeft(session.expiresAt));
    };

    tick();
    const timer = window.setInterval(tick, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_MODULE_STORAGE_KEY, activeModule);
  }, [activeModule]);

  const visibleNavItems = useMemo(() => {
    const permissions = admin?.role?.permissions ?? [];
    const hasAllPermissions = permissions.includes("*");

    return NAVIGATION_ITEMS.filter(
      (item) => !item.permission || hasAllPermissions || permissions.includes(item.permission),
    );
  }, [admin?.role?.permissions]);

  const filteredNavItems = useMemo(() => {
    const query = navQuery.trim().toLowerCase();
    if (!query) return visibleNavItems;
    return visibleNavItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [visibleNavItems, navQuery]);

  useEffect(() => {
    if (visibleNavItems.length === 0) return;
    if (!visibleNavItems.some((item) => item.id === activeModule)) {
      setActiveModule(visibleNavItems[0].id);
    }
  }, [activeModule, visibleNavItems]);

  const activeModuleItem = visibleNavItems.find((item) => item.id === activeModule);

  const permissionSummary = useMemo(() => {
    const permissions = admin?.role?.permissions ?? [];
    if (permissions.includes("*")) return "All permissions";
    return `${permissions.length} permission${permissions.length === 1 ? "" : "s"}`;
  }, [admin?.role?.permissions]);

  const handleLogout = () => {
    clearSession();
    navigate("/admin");
  };

  const setModule = (module: Module, closeMobile = false) => {
    setActiveModule(module);
    if (closeMobile) {
      setMobileMenuOpen(false);
    }
  };

  const renderModule = () => (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-secondary/50 px-6">
          <p className="text-sm text-muted-foreground">Loading module...</p>
        </div>
      }
    >
      {activeModule === "overview" && <AnalyticsDashboard />}
      {activeModule === "audit-log" && <AuditLogModule />}
      {activeModule === "key-management" && <KeyManagementModule />}
      {activeModule === "audio-provenance" && <AudioProvenanceModule />}
      {activeModule === "user-audio" && <UserAudioManagementModule />}
      {activeModule === "users" && <UserManagementModule />}
      {activeModule === "clients" && <ClientManagementModule />}
      {activeModule === "business-approvals" && <BusinessApprovalModule />}
      {activeModule === "incidents" && <IncidentMonitoringModule />}
      {activeModule === "security" && <SecurityMonitoringModule />}
      {activeModule === "analytics" && <AnalyticsDashboard />}
      {activeModule === "verification-policy" && <VerificationPolicyModule />}
      {activeModule === "compliance" && <ComplianceModule />}
      {activeModule === "system-control" && <SystemControlModule />}
      {activeModule === "waitlist" && <WaitlistModule />}
    </Suspense>
  );

  if (!admin) return null;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("space-y-3", mobile ? "p-4" : "p-4 md:p-5")}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={navQuery}
          onChange={(e) => setNavQuery(e.target.value)}
          placeholder="Search modules..."
          className="h-10 pl-9 text-sm"
        />
      </div>

      <nav className="space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setModule(item.id, mobile)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                isActive
                  ? "border-primary/45 bg-primary/15 text-foreground shadow-[0_0_24px_-16px_rgba(182,255,0,0.85)]"
                  : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-secondary/75 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronRight
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  isActive ? "translate-x-0 text-primary" : "-translate-x-1 text-muted-foreground/60",
                )}
              />
            </button>
          );
        })}
      </nav>

      {filteredNavItems.length === 0 && (
        <div className="rounded-xl border border-border/80 bg-secondary/60 px-3.5 py-3 text-sm text-muted-foreground">
          No modules match "{navQuery}".
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-animated-grid opacity-15" />
        <div className="absolute left-[-120px] top-[16%] h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-160px] right-[-40px] h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden border-r border-border/80 bg-card/70 backdrop-blur-xl lg:flex lg:w-[300px] lg:flex-col xl:w-[320px]">
          <div className="border-b border-border/75 px-6 py-6">
            <img src="/Logo-01-transparent.png" alt="Fusion Logo" className="fusion-logo-lockup h-auto w-[150px]" />
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
            <Button onClick={handleLogout} variant="outline" className="mt-3 h-10 w-full" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

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

              <div className="hidden items-center gap-2 xl:flex">
                <Badge variant="secondary">{permissionSummary}</Badge>
                <Badge variant={admin.totp_enabled ? "default" : "outline"}>
                  {admin.totp_enabled ? "MFA Enabled" : "MFA Recommended"}
                </Badge>
                {sessionTimeLeft && <Badge variant="outline">Session {sessionTimeLeft}</Badge>}
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" size="sm" className="h-10" onClick={() => navigate("/")}>
                  <Home className="mr-2 h-4 w-4" />
                  Site
                </Button>
                <Badge className="hidden md:inline-flex">{admin.role?.name || "User"}</Badge>
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">Secure session active</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="h-10" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              <div className="mb-5 rounded-2xl border border-border/80 bg-secondary/45 px-4 py-3 sm:px-5">
                <p className="text-sm text-muted-foreground">{MODULE_DESCRIPTIONS[activeModule]}</p>
              </div>

              <section className="surface-panel p-3 sm:p-4 lg:p-6">{renderModule()}</section>
            </div>
          </main>
        </div>

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
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Admin Control Plane
                      </p>
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
                  <Button onClick={handleLogout} variant="outline" className="mt-3 h-10 w-full" size="sm">
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
