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
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
};

const bgColorClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  yellow: 'bg-yellow-100',
  red: 'bg-red-100',
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
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${bgColorClasses[color]}`}>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {total !== undefined && (
          <span className="text-sm text-gray-500">/ {total}</span>
        )}
      </div>
      
      {change !== undefined && changeLabel && (
        <div className="flex items-center gap-1 mt-2">
          {change > 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">+{change}</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600 font-medium">{change}</span>
            </>
          ) : (
            <span className="text-xs text-gray-500 font-medium">0</span>
          )}
          <span className="text-xs text-gray-500">{changeLabel}</span>
        </div>
      )}
    </Card>
  );
}
