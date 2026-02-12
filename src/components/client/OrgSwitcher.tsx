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
          className="w-full justify-between px-3 h-14 hover:bg-neutral-800"
        >
          <div className="flex items-center gap-3 min-w-0">
            {currentOrg.logo_url ? (
              <img
                src={currentOrg.logo_url}
                alt={currentOrg.name}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-neutral-400" />
              </div>
            )}
            <div className="text-left min-w-0 flex-1">
              <div className="font-semibold text-sm truncate text-white">{currentOrg.name}</div>
              <div className="text-xs text-neutral-500 truncate">
                {currentOrg.plan_type} plan
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-neutral-500 flex-shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 bg-neutral-900 border-neutral-800">
        <DropdownMenuLabel className="text-xs text-neutral-500 uppercase">
          Your Organizations
        </DropdownMenuLabel>
        
        {allOrgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrg(org.id)}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-800"
          >
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-neutral-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate text-white">{org.name}</div>
              <div className="text-xs text-neutral-500 capitalize truncate">
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
