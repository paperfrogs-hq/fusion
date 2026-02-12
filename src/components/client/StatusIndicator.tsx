/**
 * Status Indicator Component
 * Visual status badges with consistent colors and animations
 */

import { Circle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning';
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig = {
  active: {
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    dotColor: 'text-green-400',
    label: 'Active',
  },
  success: {
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    dotColor: 'text-green-400',
    label: 'Success',
  },
  inactive: {
    color: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
    dotColor: 'text-neutral-400',
    label: 'Inactive',
  },
  pending: {
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    dotColor: 'text-blue-400',
    label: 'Pending',
  },
  warning: {
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dotColor: 'text-amber-400',
    label: 'Warning',
  },
  error: {
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    dotColor: 'text-red-400',
    label: 'Error',
  },
};

export default function StatusIndicator({
  status,
  label,
  showDot = true,
  size = 'md',
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <Badge className={`${config.color} ${size === 'sm' ? 'text-xs py-0' : ''}`}>
      {showDot && (
        <Circle
          className={`${config.dotColor} ${size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'} mr-1.5 fill-current ${
            status === 'active' || status === 'pending' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {displayLabel}
    </Badge>
  );
}
