// Fusion Admin Dashboard - Cryptographic Control Plane
// Modular dashboard with role-based access control

import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { clearSession, getSession } from "@/lib/admin-auth";
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
  permission?: string;
}

const ACTIVE_MODULE_STORAGE_KEY = "fusion_admin_active_module";

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "overview", label: "Overview" },
  { id: "audit-log", label: "Audit log", permission: "read_audit_log" },
  { id: "key-management", label: "Key management", permission: "key_management" },
  { id: "audio-provenance", label: "Audio provenance", permission: "provenance_management" },
  { id: "user-audio", label: "User audio files", permission: "read_analytics" },
  { id: "users", label: "User management", permission: "client_management" },
  { id: "clients", label: "Clients", permission: "client_management" },
  { id: "business-approvals", label: "Business approvals", permission: "client_management" },
  { id: "verification-policy", label: "Verification policy", permission: "verification_control" },
  { id: "security", label: "Security monitor", permission: "security_incidents" },
  { id: "incidents", label: "Incidents", permission: "security_incidents" },
  { id: "analytics", label: "Analytics", permission: "read_analytics" },
  { id: "compliance", label: "Compliance", permission: "compliance" },
  { id: "system-control", label: "System control", permission: "system_control" },
  { id: "waitlist", label: "Waitlist" },
];

const MODULE_DESCRIPTIONS: Record<Module, string> = {
  overview: "Platform health, recent events, and system-wide status.",
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
  const activeIndex = filteredNavItems.findIndex((item) => item.id === activeModule);

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
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-rule bg-card/60 px-6">
          <p className="font-serif text-sm italic text-muted-foreground">Loading module...</p>
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
    <div className={cn("flex h-full flex-col", mobile ? "p-5" : "")}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70"
          aria-hidden="true"
        />
        <Input
          value={navQuery}
          onChange={(e) => setNavQuery(e.target.value)}
          placeholder="Search modules"
          className="h-9 rounded-lg border border-rule bg-card/40 pl-9 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <nav className="mt-6 flex-1 space-y-px">
        {filteredNavItems.map((item, index) => {
          const isActive = activeModule === item.id;
          const num = String(index + 1).padStart(2, "0");

          return (
            <button
              key={item.id}
              onClick={() => setModule(item.id, mobile)}
              className={cn(
                "group relative flex w-full items-baseline gap-3 border-l py-2.5 pl-4 pr-3 text-left transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-rule hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.18em] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-muted-foreground",
                )}
              >
                {num}
              </span>
              <span className="font-serif text-sm italic leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {filteredNavItems.length === 0 && (
        <div className="rounded-lg border border-rule bg-card/40 px-3.5 py-3 font-serif text-xs italic text-muted-foreground">
          No modules match "{navQuery}".
        </div>
      )}

      {mobile && (
        <div className="mt-6 border-t border-rule pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Signed in as
          </p>
          <p className="mt-1 truncate font-serif text-sm italic text-foreground">{admin.email}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{admin.role?.name || "User"}</p>
          <Button onClick={handleLogout} variant="outline" size="sm" className="mt-4 w-full">
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-radial-gradient opacity-40" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-rule bg-card/40 backdrop-blur-md lg:flex">
          <div className="flex h-16 items-baseline gap-3 border-b border-rule px-5">
            <span className="font-serif text-lg italic text-foreground">Fusion</span>
            <span aria-hidden="true" className="block h-3 w-px bg-rule" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Admin
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <NavLinks />
          </div>

          <div className="border-t border-rule p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Signed in as
            </p>
            <p className="mt-1 truncate font-serif text-sm italic text-foreground">{admin.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{admin.role?.name || "User"}</p>
            <button
              onClick={handleLogout}
              className="link-underline mt-3 inline-flex items-baseline gap-1.5 font-serif text-xs italic text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3 w-3 self-center" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-rule bg-background/85 backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rule bg-card/40 text-foreground transition-colors hover:bg-secondary lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex min-w-0 flex-1 items-baseline gap-3">
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 sm:inline">
                  Admin /
                </span>
                <h1 className="truncate font-serif text-lg italic text-foreground sm:text-xl">
                  {activeModuleItem?.label || "Overview"}
                </h1>
                <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted-foreground/60 sm:inline">
                  {String((activeIndex ?? 0) + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="hidden items-baseline gap-4 lg:flex">
                {sessionTimeLeft && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Session · {sessionTimeLeft}
                  </span>
                )}
                {admin.totp_enabled && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    MFA on
                  </span>
                )}
                <span className="font-serif text-sm italic text-muted-foreground">
                  {admin.email}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
              <p className="max-w-measure-64 font-serif text-base italic leading-snug text-muted-foreground">
                {MODULE_DESCRIPTIONS[activeModule]}
              </p>

              <div className="mt-6 hairline" />

              <section className="mt-6 surface-panel p-4 sm:p-5 lg:p-6">{renderModule()}</section>
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
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -16, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative flex h-full w-[88%] max-w-[360px] flex-col border-r border-rule bg-card"
              >
                <div className="flex h-16 items-center justify-between border-b border-rule px-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-lg italic text-foreground">Fusion</span>
                    <span aria-hidden="true" className="block h-3 w-px bg-rule" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                      Admin
                    </span>
                  </div>
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rule bg-card/40 text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto py-5">
                  <NavLinks mobile />
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