'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getToken } from '@/lib/api/auth';
import { api } from '@/lib/api/client';
import { Tag } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setChecking(false);
      return;
    }

    const token = getToken()!;
    api<{ profile: { is_admin: boolean } }>('/profile', { token })
      .then((data) => {
        if (data.profile.is_admin) {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      })
      .catch(() => {
        if (!window.location.pathname.includes('complete-profile')) {
          router.replace('/complete-profile');
        } else {
          setChecking(false);
        }
      });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 auth-pattern">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 auth-pattern px-4 py-8">
      {/* Floating logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <Tag className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">
          Offer<span className="text-primary">HUB</span>
        </span>
      </div>

      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="text-[11px] text-muted-foreground/50 mt-6">
        বাংলাদেশের প্রথম F-Commerce ডিসকাউন্ট মার্কেটপ্লেস
      </p>
    </div>
  );
}
