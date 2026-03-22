'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';

export function useCredits() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api<{ profile: { credits_balance: number } }>('/profile', { token });
      setCredits(data.profile.credits_balance);
    } catch {
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return { credits, loading, refetch: fetchCredits };
}
