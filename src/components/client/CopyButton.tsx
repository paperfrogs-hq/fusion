/**
 * Copy to Clipboard Button Component
 * Reusable component for copying text with visual feedback
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '../../lib/toast';

interface CopyButtonProps {
  value: string;
  label?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  showToast?: boolean;
}

export default function CopyButton({
  value,
  label = 'Copy',
  size = 'sm',
  variant = 'ghost',
  showToast = true,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (showToast) {
        toast.success('Copied to clipboard');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      if (showToast) {
        toast.error('Failed to copy');
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className="transition-all"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">{label}</span>}
        </>
      )}
    </Button>
  );
}
