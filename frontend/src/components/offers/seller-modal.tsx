'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import type { Offer } from '@/lib/types/database';
import { resolveImageUrl } from '@/lib/utils/image';
import Link from 'next/link';
import {
  Store,
  Package,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp';
import { FacebookIcon } from '@/components/icons/facebook';

interface SellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string;
  shopName?: string;
  fbPageLink?: string;
  whatsappNumber?: string;
}

export function SellerModal({
  open,
  onOpenChange,
  sellerId,
  shopName,
  fbPageLink,
  whatsappNumber,
}: SellerModalProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !sellerId) return;

    const fetchSellerOffers = async () => {
      setLoading(true);
      try {
        const data = await api<{ offers: Offer[] }>(`/offers/seller/${sellerId}`);
        setOffers(data.offers);
      } catch {
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerOffers();
  }, [open, sellerId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary/5 px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogHeader>
                <DialogTitle className="text-base text-left truncate">{shopName}</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground">বিক্রেতা</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {fbPageLink && (
              <a href={fbPageLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8 rounded-lg">
                  <FacebookIcon className="h-3 w-3 text-blue-600" />
                  Facebook Page
                </Button>
              </a>
            )}
            {whatsappNumber && (
              <a href={`https://wa.me/88${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8 rounded-lg">
                  <WhatsAppIcon className="h-3 w-3 text-green-600" />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Seller's offers */}
        <div className="px-5 pb-5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-3 pt-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              এই সেলারের অফার
            </h4>
            <span className="text-[10px] text-muted-foreground">{offers.length}টি</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">কোনো active অফার নেই</p>
            </div>
          ) : (
            <div className="space-y-2">
              {offers.slice(0, 5).map((offer) => (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl border hover:bg-muted/30 transition-colors"
                >
                  {/* Image */}
                  {offer.image_urls?.[0] ? (
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={resolveImageUrl(offer.image_urls[0])}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Tag className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{offer.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-bold text-primary">
                        &#2547;{Number(offer.offer_price).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        &#2547;{Number(offer.regular_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                </Link>
              ))}

              {offers.length > 5 && (
                <Link
                  href={`/seller/${sellerId}`}
                  onClick={() => onOpenChange(false)}
                  className="block mt-2"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-lg">
                    সব {offers.length}টি অফার দেখুন →
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
