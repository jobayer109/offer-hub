'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { Offer } from '@/lib/types/database';
import { OfferCard } from '@/components/offers/offer-card';
import { CategoryTabs } from '@/components/offers/category-tabs';
import { CategorySidebar } from '@/components/offers/category-sidebar';
import { PackageOpen, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BannerCarousel } from '@/components/offers/banner-carousel';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/api/auth';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('q') || '';
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [trendingOffers, setTrendingOffers] = useState<Offer[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  // Re-render every 30s to update countdowns on cards
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [offersData, trendingData] = await Promise.all([
          api<{ offers: Offer[] }>('/offers?limit=100'),
          api<{ offers: Offer[] }>('/offers/trending?limit=6'),
        ]);
        setAllOffers(offersData.offers);
        setTrendingOffers(trendingData.offers);
      } catch {
        setAllOffers([]);
        setTrendingOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const offerCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allOffers.length };
    allOffers.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return counts;
  }, [allOffers]);

  const categoryFiltered = category === 'all'
    ? allOffers
    : allOffers.filter((o) => o.category === category);

  const filteredOffers = search.trim()
    ? categoryFiltered.filter(
        (o) =>
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.shop_name?.toLowerCase().includes(search.toLowerCase())
      )
    : categoryFiltered;

  const hasActiveFilters = category !== 'all' || search.trim();

  return (
    <div className="min-h-screen pb-16 md:pb-0 mt-3 lg:mt-4">
      {/* Mobile: Banner + Category */}
      <div className="lg:hidden container mx-auto px-4 space-y-4 mb-4">
        <BannerCarousel />
        <CategoryTabs selected={category} onSelect={setCategory} offerCounts={offerCounts} />
        {/* Seller CTA - mobile, only for non-logged-in */}
        {!loggedIn && (
          <Link href="/signup" className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5">
            <span className="text-xs text-muted-foreground">আপনি কি সেলার? <span className="text-primary font-medium">ফ্রিতে শুরু করুন →</span></span>
          </Link>
        )}
      </div>

      <div className="mx-auto px-4 lg:px-8">
        {/* Main layout */}
        <div className="flex gap-6">
          {/* Desktop: Left sidebar - Categories */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-[4.5rem] space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
              <div className="bg-card rounded-xl border p-4 shadow-sm">
                <CategorySidebar
                  selected={category}
                  onSelect={setCategory}
                  offerCounts={offerCounts}
                />
              </div>

              {/* Seller CTA - desktop, only for non-logged-in */}
              {!loggedIn && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">আপনি কি সেলার?</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    আপনার প্রোডাক্টের অফার পোস্ট করুন এবং হাজারো কাস্টমারের কাছে পৌঁছান।
                  </p>
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-lg">লগইন</Button>
                    </Link>
                    <Link href="/signup" className="flex-1">
                      <Button size="sm" className="w-full text-xs h-8 rounded-lg">শুরু করুন</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop: Banner above offers */}
            <div className="hidden lg:block mb-4">
              <BannerCarousel />
            </div>

            {/* Trending section */}
            {!hasActiveFilters && trendingOffers.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">ট্রেন্ডিং অফার</h2>
                </div>
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1 items-stretch">
                  {trendingOffers.map((offer) => (
                    <div key={offer.id} className="w-40 shrink-0">
                      <OfferCard offer={offer} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter bar */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-3 bg-muted/40 rounded-lg px-3 py-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 text-sm text-muted-foreground truncate">
                  {category !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-md mr-1.5">
                      {category}
                    </span>
                  )}
                  {search && (
                    <span className="text-xs">
                      &ldquo;<span className="font-medium text-foreground">{search}</span>&rdquo;
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/60 ml-1">
                    — {filteredOffers.length}টি পাওয়া গেছে
                  </span>
                </div>
                <button
                  onClick={() => { setCategory('all'); router.push('/'); }}
                  className="text-xs text-primary hover:underline shrink-0"
                >
                  রিসেট
                </button>
              </div>
            )}

            {/* Section heading */}
            {!hasActiveFilters && !loading && filteredOffers.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <PackageOpen className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">সব অফার</h2>
                <span className="text-[10px] text-muted-foreground/60">({filteredOffers.length}টি)</span>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border bg-card">
                    <div className="aspect-[4/3] bg-muted animate-pulse" />
                    <div className="p-3 space-y-2.5">
                      <div className="h-4 bg-muted rounded-md animate-pulse w-4/5" />
                      <div className="h-3 bg-muted rounded-md animate-pulse w-1/2" />
                      <div className="flex justify-between">
                        <div className="h-5 bg-muted rounded-md animate-pulse w-1/3" />
                        <div className="h-4 bg-muted rounded-full animate-pulse w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center mb-4">
                  <PackageOpen className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h2 className="text-lg font-semibold">
                  {search ? 'কোনো ফলাফল পাওয়া যায়নি' : 'এখনো কোনো অফার নেই'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {search
                    ? `"${search}" দিয়ে কোনো অফার খুঁজে পাওয়া যায়নি।`
                    : 'পরে আবার দেখুন অথবা নিজের অফার পোস্ট করুন!'}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-lg"
                    onClick={() => { setCategory('all'); router.push('/'); }}
                  >
                    সব অফার দেখুন
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {filteredOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
