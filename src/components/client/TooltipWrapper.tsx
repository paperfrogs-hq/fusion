/**
 * Tooltip Wrapper Component
 * Provides consistent tooltips across the application
 */

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export default function TooltipWrapper({
  children,
  content,
  side = 'top',
  delayDuration = 300,
}: TooltipWrapperProps) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
