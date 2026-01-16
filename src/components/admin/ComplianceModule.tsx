// Compliance & Regulation Module

import { Lock, Info } from "lucide-react";

const ComplianceModule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Compliance & Regulation</h2>
        <p className="text-muted-foreground mt-1">EU AI Act compliance, audit reports, and data retention policies</p>
      </div>

      <div className="glass rounded-xl p-8 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Compliance Tools Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Generate compliance reports, manage data retention, and export proof-of-origin documentation.
        </p>
        <div className="mt-6 p-4 bg-accent rounded-lg inline-block">
          <p className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Requires: compliance_reports, data_retention_policies tables</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplianceModule;
