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
  Bell,
  User,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
import { 
  validateSession, 
  getCurrentUser, 
  getCurrentOrganization,
  logout,
  isOnTrial,
  getTrialDaysRemaining,
  getQuotaUsagePercent
} from '../../lib/client-auth';

interface ClientLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
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

  if (!user || !org) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-neutral-900 border-r border-neutral-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-neutral-800">
            <img 
              src="/Fusion_Icon-No-BG-01.png" 
              alt="Fusion" 
              className="h-10 w-auto object-contain"
            />
            <span className="ml-2 text-xl font-bold text-white">Fusion</span>
          </div>

          {/* Org Switcher */}
          <div className="border-b border-neutral-800">
            <OrgSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
                    ${active 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quota Warning */}
          {quotaPercent >= 80 && (
            <div className="mx-3 mb-3 p-3 bg-amber-500/20 border border-amber-500/50 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-amber-400">Quota Warning</div>
                  <div className="text-amber-300 mt-0.5">
                    {quotaPercent}% of monthly quota used
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trial Banner */}
          {onTrial && (
            <div className="mx-3 mb-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-md">
              <div className="text-xs">
                <div className="font-medium text-blue-400">Trial Active</div>
                <div className="text-blue-300 mt-0.5">
                  {trialDays} days remaining
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 text-xs h-7 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                  onClick={() => navigate('/client/settings/billing')}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <div className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <EnvironmentSwitcher />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-neutral-400 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-neutral-300 hover:text-white">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-neutral-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-700">
                <DropdownMenuLabel className="text-neutral-400">
                  <div className="text-xs">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem onClick={() => navigate('/client/settings/profile')} className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/client/settings/security')} className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                  <Key className="h-4 w-4 mr-2" />
                  Security & 2FA
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
