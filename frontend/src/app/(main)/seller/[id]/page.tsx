'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { Offer } from '@/lib/types/database';
import { OfferCard } from '@/components/offers/offer-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  ExternalLink,
  MessageCircle,
  Package,
} from 'lucide-react';

export default function SellerPage() {
  const params = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const shopName = offers[0]?.shop_name || 'Shop';
  const fbPageLink = offers[0]?.fb_page_link;
  const whatsappNumber = offers[0]?.whatsapp_number;

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await api<{ offers: Offer[] }>(`/offers/seller/${params.id}`);
        setOffers(data.offers);
      } catch {
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [params.id]);

  return (
    <div className="container mx-auto px-4 py-4 pb-20 md:pb-6">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Seller info */}
      <div className="bg-card border rounded-xl p-4 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Store className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{shopName}</h1>
          <p className="text-xs text-muted-foreground">{offers.length}টি active অফার</p>
          <div className="flex gap-2 mt-2">
            {fbPageLink && (
              <a href={fbPageLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 rounded-lg">
                  <ExternalLink className="h-3 w-3" />
                  Facebook
                </Button>
              </a>
            )}
            {whatsappNumber && (
              <a href={`https://wa.me/88${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 rounded-lg">
                  <MessageCircle className="h-3 w-3 text-green-600" />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Offers grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-2 space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">এই সেলারের কোনো active অফার নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
