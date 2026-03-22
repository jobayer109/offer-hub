'use client';

import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface FormAlertProps {
  type: 'error' | 'success';
  message: string;
  onDismiss?: () => void;
}

export function FormAlert({ type, message, onDismiss }: FormAlertProps) {
  if (type === 'success') {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 animate-in slide-in-from-top-2 fade-in duration-300">
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        <p className="text-sm text-green-600 dark:text-green-400 flex-1">{message}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 animate-in slide-in-from-top-2 fade-in duration-300">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <p className="text-sm text-destructive flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-destructive/60 hover:text-destructive transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
