import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  total?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
}

const colorClasses = {
  blue: 'text-primary',
  green: 'text-green-400',
  purple: 'text-primary',
  yellow: 'text-amber-400',
  red: 'text-red-400',
};

const bgColorClasses = {
  blue: 'bg-primary/18',
  green: 'bg-green-500/20',
  purple: 'bg-primary/18',
  yellow: 'bg-amber-500/20',
  red: 'bg-red-500/20',
};

export default function QuickStatsCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  total,
  icon: Icon, 
  color 
}: QuickStatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`rounded-lg border border-border p-2 ${bgColorClasses[color]}`}>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {total !== undefined && (
          <span className="text-sm text-muted-foreground">/ {total}</span>
        )}
      </div>
      
      {change !== undefined && changeLabel && (
        <div className="flex items-center gap-1 mt-2">
          {change > 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+{change}</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="h-3 w-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">{change}</span>
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">0</span>
          )}
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </Card>
  );
}
