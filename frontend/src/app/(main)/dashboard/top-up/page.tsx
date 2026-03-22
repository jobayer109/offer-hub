'use client';

import { TopUpForm } from '@/components/dashboard/top-up-form';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function TopUpPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 pb-20 md:py-6 md:pb-6 max-w-4xl">
        <TopUpForm />
      </div>
    </AuthGuard>
  );
}
