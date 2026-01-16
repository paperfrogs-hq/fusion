/**
 * Enhanced Toast Notifications
 * Provides consistent styling and positioning for all toasts
 */

import React from 'react';
import { toast as sonnerToast, ExternalToast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const defaultOptions: ExternalToast = {
  duration: 4000,
};

export const toast = {
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(CheckCircle2, { className: "h-5 w-5" }),
    });
  },

  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      ...defaultOptions,
      ...options,
      duration: 6000,
      icon: React.createElement(AlertCircle, { className: "h-5 w-5" }),
    });
  },

  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(Info, { className: "h-5 w-5" }),
    });
  },

  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(AlertTriangle, { className: "h-5 w-5" }),
    });
  },

  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },
};
