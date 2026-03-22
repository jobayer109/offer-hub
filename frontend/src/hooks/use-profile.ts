'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@/lib/types/database';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api<{ profile: Profile }>('/profile', { token });
      setProfile(data.profile);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, refetch: fetchProfile };
}
