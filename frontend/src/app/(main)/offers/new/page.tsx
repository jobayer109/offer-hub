'use client';

import { OfferForm } from '@/components/offers/offer-form';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function NewOfferPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 pb-20 md:py-6 md:pb-6">
        <OfferForm />
      </div>
    </AuthGuard>
  );
}
