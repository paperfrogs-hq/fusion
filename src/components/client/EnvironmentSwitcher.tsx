import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { getCurrentOrganization, getCurrentEnvironment, setCurrentEnvironment, Environment } from '../../lib/client-auth';
import { toast } from 'sonner';

export default function EnvironmentSwitcher() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [currentEnv, setCurrentEnv] = useState<Environment | null>(null);
  const [loading, setLoading] = useState(true);

  const org = getCurrentOrganization();

  useEffect(() => {
    loadEnvironments();
  }, [org?.id]);

  const loadEnvironments = async () => {
    if (!org) return;

    try {
      const response = await fetch('/.netlify/functions/get-environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setEnvironments(data.environments || []);
        
        // Set default environment if none selected
        const savedEnv = getCurrentEnvironment();
        if (savedEnv && data.environments.find((e: Environment) => e.id === savedEnv.id)) {
          setCurrentEnv(savedEnv);
        } else if (data.environments.length > 0) {
          // Default to sandbox if available, otherwise first env
          const defaultEnv = data.environments.find((e: Environment) => !e.is_production) || data.environments[0];
          setCurrentEnv(defaultEnv);
          setCurrentEnvironment(defaultEnv);
        }
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
      toast.error('Failed to load environments');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchEnvironment = (env: Environment) => {
    setCurrentEnv(env);
    setCurrentEnvironment(env);
    toast.success(`Switched to ${env.display_name}`);
  };

  if (loading || !currentEnv) {
    return (
      <div className="h-9 w-32 bg-neutral-800 animate-pulse rounded-md"></div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-2"
        >
          {currentEnv.is_production ? (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="font-medium">Production</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="font-medium">Sandbox</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {environments.map((env) => (
          <DropdownMenuItem
            key={env.id}
            onClick={() => handleSwitchEnvironment(env)}
            className="flex items-start gap-3 p-3 cursor-pointer"
          >
            <div className="flex-shrink-0 mt-0.5">
              {env.is_production ? (
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{env.display_name}</span>
                {currentEnv?.id === env.id && (
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                )}
                {env.is_production && (
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                )}
              </div>
              {env.description && (
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {env.description}
                </p>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        {environments.length === 0 && (
          <div className="p-3 text-center text-sm text-neutral-500">
            No environments available
          </div>
        )}
        
        {currentEnv?.is_production && (
          <div className="border-t mt-1 pt-2 px-3 pb-2">
            <div className="flex items-start gap-2 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span>You're in production. Changes affect live data.</span>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
