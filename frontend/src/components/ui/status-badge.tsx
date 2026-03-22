'use client';

import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'rejected' | 'expired';
  showLabel?: boolean;
}

const statusConfig = {
  active: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border border-green-200', label: 'Active' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border border-yellow-200', label: 'Pending' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border border-red-200', label: 'Rejected' },
  expired: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50 border border-gray-200', label: 'Expired' },
};

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-medium shrink-0 ${config.bg} ${config.color}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className={showLabel ? 'hidden sm:inline' : 'hidden'}>{config.label}</span>
    </span>
  );
}
