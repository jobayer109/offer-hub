'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import type { Offer } from '@/lib/types/database';
import { OfferReviewCard } from '@/components/admin/offer-review-card';
import { FileText, PackageOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const token = getToken()!;
      const data = await api<{ offers: Offer[] }>('/admin/offers/pending', { token });
      setOffers(data.offers);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">পেন্ডিং অফার</h1>
              {!loading && (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  {offers.length}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">রিভিউ এর অপেক্ষায় থাকা অফারসমূহ</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-4 w-1/3 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white border rounded-lg flex flex-col items-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PackageOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">কোনো পেন্ডিং অফার নেই</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            সব অফার রিভিউ করা হয়ে গেছে। নতুন অফার আসলে এখানে দেখা যাবে।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <OfferReviewCard key={offer.id} offer={offer} onAction={fetchPending} />
          ))}
        </div>
      )}
    </div>
  );
}
