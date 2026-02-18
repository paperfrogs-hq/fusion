import { Building2, Check, ChevronDown, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { getCurrentOrganization, getOrganizations, switchOrganization } from '../../lib/client-auth';

export default function OrgSwitcher() {
  const navigate = useNavigate();
  const currentOrg = getCurrentOrganization();
  const allOrgs = getOrganizations();

  const handleSwitchOrg = (orgId: string) => {
    const switched = switchOrganization(orgId);
    if (switched) {
      // Reload to reset context
      window.location.href = '/client/dashboard';
    }
  };

  if (!currentOrg) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-14 w-full justify-between px-3 hover:bg-secondary/85"
        >
          <div className="flex items-center gap-3 min-w-0">
            {currentOrg.logo_url ? (
              <img
                src={currentOrg.logo_url}
                alt={currentOrg.name}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-secondary">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="text-left min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{currentOrg.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {currentOrg.plan_type} plan
              </div>
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 border-border bg-card/95">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
          Your Organizations
        </DropdownMenuLabel>
        
        {allOrgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrg(org.id)}
            className="flex cursor-pointer items-center gap-3 p-3 hover:bg-secondary/80"
          >
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-secondary">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{org.name}</div>
              <div className="truncate text-xs capitalize text-muted-foreground">
                {org.role || 'member'} · {org.plan_type}
              </div>
            </div>
            {currentOrg.id === org.id && (
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/client/create-organization')}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
