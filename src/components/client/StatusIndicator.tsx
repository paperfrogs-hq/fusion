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
    color: 'bg-green-100 text-green-800 border-green-300',
    dotColor: 'text-green-600',
    label: 'Active',
  },
  success: {
    color: 'bg-green-100 text-green-800 border-green-300',
    dotColor: 'text-green-600',
    label: 'Success',
  },
  inactive: {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    dotColor: 'text-gray-600',
    label: 'Inactive',
  },
  pending: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    dotColor: 'text-blue-600',
    label: 'Pending',
  },
  warning: {
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'text-amber-600',
    label: 'Warning',
  },
  error: {
    color: 'bg-red-100 text-red-800 border-red-300',
    dotColor: 'text-red-600',
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
