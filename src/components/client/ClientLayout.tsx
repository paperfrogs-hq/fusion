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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <img 
              src="/Fusion_Icon-No-BG-01.png" 
              alt="Fusion" 
              className="h-10 w-auto object-contain"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">Fusion</span>
          </div>

          {/* Org Switcher */}
          <div className="border-b border-gray-200">
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
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
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
            <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-amber-900">Quota Warning</div>
                  <div className="text-amber-700 mt-0.5">
                    {quotaPercent}% of monthly quota used
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trial Banner */}
          {onTrial && (
            <div className="mx-3 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-xs">
                <div className="font-medium text-blue-900">Trial Active</div>
                <div className="text-blue-700 mt-0.5">
                  {trialDays} days remaining
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 text-xs h-7"
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
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <EnvironmentSwitcher />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/client/settings/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/client/settings/security')}>
                  <Key className="h-4 w-4 mr-2" />
                  Security & 2FA
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
