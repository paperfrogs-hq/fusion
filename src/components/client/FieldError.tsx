/**
 * Form Field Error Display Component
 * Shows validation errors with consistent styling
 */

import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  error?: string;
}

export default function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className="flex items-start gap-2 mt-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );
}
