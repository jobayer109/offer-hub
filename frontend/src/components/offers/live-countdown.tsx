'use client';

import { useEffect, useReducer } from 'react';

function calcTimeLeft(expiresAt: string, short = false): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return short ? 'Expired' : 'মেয়াদ শেষ';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (short) {
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  if (days > 0) return `${days} দিন ${hours} ঘণ্টা বাকি`;
  if (hours > 0) return `${hours} ঘণ্টা ${mins} মিনিট বাকি`;
  if (mins > 0) return `${mins} মিনিট ${secs} সেকেন্ড বাকি`;
  return `${secs} সেকেন্ড বাকি`;
}

interface LiveCountdownProps {
  expiresAt: string;
  short?: boolean;
}

export function LiveCountdown({ expiresAt, short = false }: LiveCountdownProps) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return;

    const ms = diff < 60 * 60 * 1000 ? 1000 : 60000;

    const id = window.setInterval(() => {
      forceUpdate();
      const remaining = new Date(expiresAt).getTime() - Date.now();
      if (remaining <= 0) window.clearInterval(id);
    }, ms);

    return () => window.clearInterval(id);
  }, [expiresAt]);

  return <>{calcTimeLeft(expiresAt, short)}</>;
}
