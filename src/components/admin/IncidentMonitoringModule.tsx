// Incident & Abuse Monitoring Module

import { AlertTriangle, Info } from "lucide-react";

const IncidentMonitoringModule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Incident & Abuse Monitoring</h2>
        <p className="text-muted-foreground mt-1">Track security incidents, replay attacks, forgery attempts, and key misuse</p>
      </div>

      <div className="glass rounded-xl p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Incident Monitoring Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Monitor suspicious patterns, investigate security incidents, and manage alert rules.
        </p>
        <div className="mt-6 p-4 bg-accent rounded-lg inline-block">
          <p className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Requires: security_incidents, alert_rules tables</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncidentMonitoringModule;
