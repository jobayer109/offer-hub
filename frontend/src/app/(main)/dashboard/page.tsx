'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { useProfile } from '@/hooks/use-profile';
import type { Offer, Transaction } from '@/lib/types/database';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  TrendingUp,
  Package,
  Clock,
  XCircle,
  ArrowUpRight,
  Coins,
  Store,
  Pencil,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { OfferImage } from '@/components/offers/offer-image';

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()!;
      try {
        const [offersData, txData] = await Promise.all([
          api<{ offers: Offer[] }>('/offers/my', { token }),
          api<{ transactions: Transaction[] }>('/transactions/my', { token }),
        ]);
        setOffers(offersData.offers);
        setTransactions(txData.transactions);
      } catch {
        setOffers([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeOffers = offers.filter((o) => o.status === 'active').length;
  const pendingOffers = offers.filter((o) => o.status === 'pending').length;
  const rejectedOffers = offers.filter((o) => o.status === 'rejected').length;
  const totalOffers = offers.length;

  if (profileLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Credits Available', value: profile?.credits_balance ?? 0, icon: Coins, color: 'text-primary', bg: 'bg-primary/10', link: '/dashboard/top-up' },
    { label: 'Total Offers', value: totalOffers, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Offers', value: activeOffers, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Pending Request', value: pendingOffers, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <AuthGuard>
    <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 truncate">
            <Store className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">{profile?.shop_name || 'Dashboard'}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">আপনার শপের overview</p>
        </div>
        <Link href="/offers/new" className="shrink-0">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post Offer</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </Link>
      </div>

      {/* Stats - 2x2 grid on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 bg-card border rounded-xl p-3 md:p-4"
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold leading-none">{stat.value}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
                  {stat.link && (
                    <Link href={stat.link}>
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected warning */}
      {rejectedOffers > 0 && (
        <div className="flex items-start gap-2.5 bg-red-50/80 border border-red-200 rounded-xl p-3">
          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">{rejectedOffers}টি offer rejected</p>
            <p className="text-xs text-red-500/70 mt-0.5">pricing সঠিক দিয়ে আবার post করুন।</p>
          </div>
        </div>
      )}

      {/* Quick Actions - mobile */}
      <div className="flex gap-2 md:hidden">
        <Link href="/offers/new" className="flex-1">
          <Button className="w-full gap-2 h-10 rounded-xl text-xs bg-primary hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            Post Offer
          </Button>
        </Link>
        <Link href="/dashboard/top-up" className="flex-1">
          <Button className="w-full gap-2 h-10 rounded-xl text-xs bg-[#E2136E] hover:bg-[#C8115F] text-white">
            <img src="/bkash_footer_logo.png" alt="bKash" className="h-4 brightness-0 invert" />
            Buy Credit
          </Button>
        </Link>
      </div>

      {/* My Offers + Transactions */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6 w-full min-w-0">
        {/* Offers */}
        <div className="md:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              My Offers
            </h3>
            <span className="text-[10px] text-muted-foreground">{totalOffers} total</span>
          </div>

          {offers.length === 0 ? (
            <Card className="border shadow-none">
              <div className="text-center py-10 px-4">
                <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">কোনো offer নেই</p>
                <Link href="/offers/new">
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Post Offer
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {offers.map((offer) => {
                const daysLeft = Math.ceil(
                  (new Date(offer.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isExpiringSoon = daysLeft <= 2 && daysLeft > 0 && offer.status === 'active';

                return (
                  <div
                    key={offer.id}
                    className="flex items-center gap-2.5 md:gap-3 p-2 md:p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors overflow-hidden"
                  >
                    <OfferImage imageUrls={offer.image_urls} alt={offer.title} size="sm" />

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm leading-tight">{offer.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          &#2547;{Number(offer.offer_price).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground/40">&middot;</span>
                        <span className="text-[11px] text-muted-foreground">{offer.category}</span>
                        {isExpiringSoon && (
                          <span className="text-[10px] text-orange-500 font-medium ml-0.5">{daysLeft}d</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {offer.status !== 'expired' && (
                        <Link href={`/offers/${offer.id}/edit`}>
                          <button className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors">
                            <Pencil className="h-3 w-3" />
                          </button>
                        </Link>
                      )}
                      <StatusBadge status={offer.status as 'active' | 'pending' | 'rejected' | 'expired'} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 min-w-0">
          {/* Quick Actions - desktop */}
          <Card className="shadow-none hidden md:block">
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="flex gap-2">
                <Link href="/offers/new" className="flex-1">
                  <Button className="w-full gap-2 h-10 text-sm bg-primary hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" />
                    Post Offer
                  </Button>
                </Link>
                <Link href="/dashboard/top-up" className="flex-1">
                  <Button className="w-full gap-2 h-10 text-sm bg-[#E2136E] hover:bg-[#C8115F] text-white">
                    <img src="/bkash_footer_logo.png" alt="bKash" className="h-4 brightness-0 invert" />
                    Buy Credit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Transactions */}
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-2 md:mb-3">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              Transactions
            </h3>

            {transactions.length === 0 ? (
              <Card className="shadow-none">
                <div className="text-center py-8 px-4">
                  <CreditCard className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">কোনো transaction নেই</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 md:p-3 rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.status === 'success' ? 'bg-green-50' : 'bg-yellow-50'
                      }`}>
                        <Coins className={`h-3.5 w-3.5 ${
                          tx.status === 'success' ? 'text-green-500' : 'text-yellow-500'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">&#2547;{Number(tx.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{tx.bkash_trx_id}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        tx.status === 'success'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                      }`}
                    >
                      {tx.status === 'success' ? 'Done' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
