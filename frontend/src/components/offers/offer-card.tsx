'use client';

import { Badge } from '@/components/ui/badge';
import type { Offer } from '@/lib/types/database';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/utils/image';
import { Eye, Clock, Package } from 'lucide-react';
import { LiveCountdown } from './live-countdown';

interface OfferCardProps {
  offer: Offer;
}

function getCountdown(expiresAt: string): { text: string; urgent: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: 'মেয়াদ শেষ', urgent: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return { text: `${days}d ${hours}h বাকি`, urgent: days <= 2 };
  if (hours > 0) return { text: `${hours}h ${mins}m বাকি`, urgent: true };

  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (mins > 0) return { text: `${mins}m ${secs}s বাকি`, urgent: true };
  return { text: `${secs}s বাকি`, urgent: true };
}

function formatViews(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export function OfferCard({ offer }: OfferCardProps) {
  const countdown = getCountdown(offer.expires_at);
  const coverImage = offer.image_urls?.[0];
  const savings = Number(offer.regular_price) - Number(offer.offer_price);
  const isNew = (Date.now() - new Date(offer.created_at).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <Link href={`/offers/${offer.id}`} className="block group">
      <div className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Image section */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {coverImage ? (
            <img
              src={resolveImageUrl(coverImage)}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Discount badge - top right */}
          <div className="absolute top-1.5 right-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            {Number(offer.discount_pct).toFixed(0)}% OFF
          </div>

          {/* New badge - corner ribbon */}
          {isNew && !countdown.urgent && (
            <div className="absolute top-0 left-0 overflow-hidden w-20 h-20 z-10">
              <div className="absolute top-3 -left-8 w-28 bg-linear-to-r from-violet-500 to-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest text-center py-1 -rotate-45 shadow-md">
                New
              </div>
            </div>
          )}

          {/* Countdown - top left */}
          <div className={`absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md ${
            countdown.urgent
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-black/40 text-white/90 backdrop-blur-sm'
          }`}>
            <Clock className={`h-2.5 w-2.5 ${countdown.urgent ? 'animate-spin' : ''}`} style={countdown.urgent ? { animationDuration: '3s' } : undefined} />
            <LiveCountdown expiresAt={offer.expires_at} short />
          </div>

          {/* Multiple images indicator */}
          {offer.image_urls?.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
              1/{offer.image_urls.length}
            </div>
          )}

          {/* Savings strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-5 pb-1.5 px-2">
            <span className="text-white/90 text-[9px]">
              Save &#2547;{savings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-xs line-clamp-2 leading-snug min-h-[2lh]">{offer.title}</h3>


          {/* Price section */}
          <div className="mt-auto pt-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-primary">
                &#2547;{Number(offer.offer_price).toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground line-through">
                &#2547;{Number(offer.regular_price).toLocaleString()}
              </span>
            </div>

            {/* Bottom row - category + views */}
            <div className="flex items-center justify-between mt-1.5">
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                {offer.category}
              </Badge>
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <Eye className="h-2.5 w-2.5" />
                <span className="text-[10px]">{formatViews(offer.view_count || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
