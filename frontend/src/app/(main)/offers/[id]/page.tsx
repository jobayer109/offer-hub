'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { Offer } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/utils/image';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Clock,
  Store,
  Tag,
  Share2,
  Package,
  TrendingDown,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { SellerModal } from '@/components/offers/seller-modal';
import { LiveCountdown } from '@/components/offers/live-countdown';
import { WhatsAppIcon } from '@/components/icons/whatsapp';

function getTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'মেয়াদ শেষ';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (days > 0) return `${days} দিন ${hours} ঘণ্টা বাকি`;
  if (hours > 0) return `${hours} ঘণ্টা ${mins} মিনিট বাকি`;
  if (mins > 0) return `${mins} মিনিট ${secs} সেকেন্ড বাকি`;
  return `${secs} সেকেন্ড বাকি`;
}


export default function OfferDetailPage() {
  const params = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const viewTracked = useRef(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const data = await api<{ offer: Offer }>(`/offers/${params.id}`);
        setOffer(data.offer);

        if (!viewTracked.current) {
          viewTracked.current = true;
          api(`/offers/${params.id}/view`, { method: 'PUT' }).catch(() => {});
        }
      } catch {
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [params.id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    // Mobile: native share, Desktop: copy URL
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    try {
      if (isMobile && navigator.share) {
        await navigator.share({
          title: offer?.title || 'Offer HUB',
          text: offer
            ? `${offer.title} - ৳${Number(offer.offer_price).toLocaleString()} (${Number(offer.discount_pct).toFixed(0)}% OFF)`
            : '',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="h-8 w-16 bg-muted rounded mb-4 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-24 bg-muted rounded-xl animate-pulse" />
            <div className="h-10 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-semibold">অফার পাওয়া যায়নি</h2>
        <p className="text-sm text-muted-foreground mt-1">এই অফারটি মুছে ফেলা হয়েছে অথবা মেয়াদ শেষ হয়ে গেছে।</p>
        <Link href="/">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
          </Button>
        </Link>
      </div>
    );
  }

  const images = offer.image_urls?.length ? offer.image_urls : [];
  const activeImage = images[activeImageIndex];
  const savings = Number(offer.regular_price) - Number(offer.offer_price);
  const timeLeft = getTimeLeft(offer.expires_at);
  const isExpired = timeLeft === 'মেয়াদ শেষ';
  const daysLeft = Math.ceil((new Date(offer.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 2 && !isExpired;

  return (
    <div className="container mx-auto max-w-5xl pb-20 md:pb-6">
      {/* Top bar */}
      <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-muted rounded-full transition-colors text-sm text-muted-foreground">
          {copied ? (
            <>
              <span className="text-green-500 text-xs font-medium">কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">শেয়ার</span>
            </>
          )}
        </button>
      </div>

      {/* Main layout: stacked on mobile, side-by-side on desktop */}
      <div className="grid md:grid-cols-2 gap-0 md:gap-8 md:px-4 md:pt-6">
        {/* LEFT: Images */}
        <div>
          {images.length > 0 ? (
            <div className="md:sticky md:top-24">
              {/* Main image with hover zoom (desktop only) */}
              <div
                className="relative aspect-square md:rounded-2xl bg-muted overflow-hidden md:cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => { setIsZoomed(false); setZoomPos({ x: 50, y: 50 }); }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomPos({ x, y });
                }}
              >
                <img
                  src={resolveImageUrl(activeImage)}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-200 ease-out"
                  style={{
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />

                {/* Discount badge */}
                <div className="absolute top-3 right-3 bg-green-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-lg text-sm">
                  {Number(offer.discount_pct).toFixed(0)}% OFF
                </div>

                {/* Urgency badge */}
                {isUrgent && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 animate-pulse">
                    <Clock className="h-3 w-3" />
                    <LiveCountdown expiresAt={offer.expires_at} />
                  </div>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {activeImageIndex + 1}/{images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 px-4 md:px-1 py-3 overflow-x-auto overflow-y-visible">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        index === activeImageIndex
                          ? 'border-primary ring-2 ring-primary/20 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`${offer.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square md:rounded-2xl bg-muted flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="px-4 md:px-0 py-4 md:py-0 space-y-4">
          {/* Category + Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Tag className="h-3 w-3" />
              {offer.category}
            </Badge>
            <div className="flex items-center gap-1 bg-muted/60 rounded-full px-2.5 py-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">
                {(offer.view_count || 0).toLocaleString('bn-BD')} views
              </span>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 rounded-full px-2.5 py-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {new Date(offer.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold leading-snug">{offer.title}</h1>

          {/* Countdown timer */}
          <div className={`rounded-xl p-3 flex items-center gap-3 ${
            isExpired
              ? 'bg-muted/50 border'
              : isUrgent
                ? 'bg-red-50 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isExpired
                ? 'bg-muted'
                : isUrgent
                  ? 'bg-red-100'
                  : 'bg-amber-100'
            }`}>
              <Clock className={`h-4 w-4 ${
                isExpired
                  ? 'text-muted-foreground'
                  : isUrgent
                    ? 'text-red-500 animate-pulse'
                    : 'text-amber-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                isExpired
                  ? 'text-muted-foreground'
                  : isUrgent
                    ? 'text-red-600'
                    : 'text-amber-700'
              }`}>
                <LiveCountdown expiresAt={offer.expires_at} />
              </p>
              {!isExpired && (
                <p className="text-[11px] text-muted-foreground">
                  মেয়াদ: {new Date(offer.expires_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Price card */}
          <div className="bg-linear-to-r from-primary/5 to-green-500/5 rounded-2xl p-4 border">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">অফার প্রাইস</p>
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  &#2547;{Number(offer.offer_price).toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground line-through block">
                  &#2547;{Number(offer.regular_price).toLocaleString('bn-BD')}
                </span>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-0.5">
                  <TrendingDown className="h-3.5 w-3.5" />
                  &#2547;{savings.toLocaleString('bn-BD')} সেভ
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <a href={offer.target_link} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full h-12 gap-2 text-base font-semibold rounded-xl">
                <ExternalLink className="h-4 w-4" />
                অফার দেখুন
              </Button>
            </a>
            {offer.whatsapp_number && (
              <a
                href={`https://wa.me/88${offer.whatsapp_number}?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি Offer HUB থেকে "${offer.title}" অফারটি দেখেছি। এটি কি এখনো available আছে?`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="h-12 px-4 rounded-xl gap-2">
                  <WhatsAppIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm">WhatsApp</span>
                </Button>
              </a>
            )}
          </div>

          {/* Description */}
          {offer.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1.5">বিবরণ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
            </div>
          )}

          {/* Seller info */}
          <button
            onClick={() => setSellerModalOpen(true)}
            className="w-full bg-muted/30 rounded-xl p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{offer.shop_name}</p>
              <p className="text-xs text-muted-foreground">বিক্রেতার তথ্য দেখুন</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>

          <SellerModal
            open={sellerModalOpen}
            onOpenChange={setSellerModalOpen}
            sellerId={offer.seller_id}
            shopName={offer.shop_name}
            fbPageLink={offer.fb_page_link}
            whatsappNumber={offer.whatsapp_number}
          />

          {/* Safety notice */}
          <p className="text-[11px] text-muted-foreground/60 text-center pt-2 pb-4">
            Offer HUB একটি প্ল্যাটফর্ম মাত্র। কেনাকাটার আগে বিক্রেতার সাথে যোগাযোগ করে নিশ্চিত হোন।
          </p>
        </div>
      </div>
    </div>
  );
}
