import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  FileText,
  Key,
  Webhook,
  BarChart3,
  Users,
  Settings,
  AlertCircle,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import OrgSwitcher from './OrgSwitcher';
import EnvironmentSwitcher from './EnvironmentSwitcher';
import NotificationsDropdown from './NotificationsDropdown';
import TrialExpiredModal from './TrialExpiredModal';
import SubscriptionRequiredModal from './SubscriptionRequiredModal';
import {
  validateSession,
  getCurrentUser,
  getCurrentOrganization,
  logout,
  isOnTrial,
  isTrialExpired,
  needsSubscription,
  getTrialDaysRemaining,
  getQuotaUsagePercent
} from '../../lib/client-auth';

interface ClientLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { name: 'Verify Audio', href: '/client/verify', icon: Shield },
  { name: 'Verification Activity', href: '/client/activity', icon: Activity },
  { name: 'Reports & Exports', href: '/client/reports', icon: FileText },
  { name: 'API Keys', href: '/client/api-keys', icon: Key },
  { name: 'Webhooks', href: '/client/webhooks', icon: Webhook },
  { name: 'Analytics', href: '/client/analytics', icon: BarChart3 },
  { name: 'Team & Roles', href: '/client/team', icon: Users },
  { name: 'Settings', href: '/client/settings', icon: Settings },
  { name: 'Status & Incidents', href: '/client/status', icon: AlertCircle },
];

export default function ClientLayout({ children }: ClientLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const org = getCurrentOrganization();

  useEffect(() => {
    if (!validateSession()) {
      navigate('/client/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/client/login');
  };

  const isActive = (href: string) => location.pathname === href;

  const quotaPercent = getQuotaUsagePercent(org);
  const trialDays = getTrialDaysRemaining(org);
  const onTrial = isOnTrial(org);
  const trialExpired = isTrialExpired(org);
  const subscriptionRequired = needsSubscription(org);

  const isBillingPage =
    location.pathname === '/client/billing' ||
    location.pathname === '/client/settings/billing' ||
    location.pathname === '/client/checkout' ||
    location.pathname.includes('/pricing');

  if (!user || !org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TrialExpiredModal
        open={trialExpired && !isBillingPage}
        organizationName={org.name}
      />

      <SubscriptionRequiredModal
        open={subscriptionRequired && !trialExpired && !isBillingPage}
        organizationName={org.name}
      />

      <div className="fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card/90 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-5">
            <img
              src="/Logo-01-transparent.png"
              alt="Fusion"
              className="fusion-logo-lockup h-12 w-[180px]"
            />
          </div>

          <div className="border-b border-border">
            <OrgSwitcher />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-[0_0_24px_-10px_rgba(182,255,0,0.85)]'
                      : 'text-muted-foreground hover:bg-secondary/85 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {quotaPercent >= 80 && (
            <div className="mx-3 mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                <div className="text-xs">
                  <div className="font-medium text-amber-300">Quota Warning</div>
                  <div className="mt-0.5 text-amber-200">{quotaPercent}% of monthly quota used</div>
                </div>
              </div>
            </div>
          )}

          {onTrial && (
            <div className="mx-3 mb-3 rounded-xl border border-primary/35 bg-primary/10 p-3">
              <div className="text-xs">
                <div className="font-medium text-primary">Trial Active</div>
                <div className="mt-0.5 text-muted-foreground">{trialDays} days remaining</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 w-full text-xs"
                  onClick={() => navigate('/client/settings/billing')}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/82 px-6 backdrop-blur-xl">
          <EnvironmentSwitcher />

          <div className="flex items-center gap-3">
            <NotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-card">
                <DropdownMenuLabel className="text-muted-foreground">
                  <div className="text-xs">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => navigate('/client/settings/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/client/settings/security')}>
                  <Key className="mr-2 h-4 w-4" />
                  Security & 2FA
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <main className="p-6">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
