'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Offer, OfferEditHistory } from '@/lib/types/database';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Check, X, History, ChevronDown, ChevronUp, Store, ExternalLink, MessageCircle } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils/image';

interface OfferReviewCardProps {
  offer: Offer;
  onAction: () => void;
}

export function OfferReviewCard({ offer, onAction }: OfferReviewCardProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<OfferEditHistory[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const token = getToken()!;
      await api(`/admin/offers/${offer.id}/${action}`, { method: 'PUT', token });
      toast.success(`অফার ${action === 'approve' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে`);
      onAction();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (historyLoaded) return;
    try {
      const token = getToken()!;
      const data = await api<{ history: OfferEditHistory[] }>(
        `/admin/offers/${offer.id}/history`,
        { token },
      );
      setHistory(data.history);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const toggleHistory = () => {
    if (!historyOpen) {
      fetchHistory();
    }
    setHistoryOpen(!historyOpen);
  };

  const images = offer.image_urls?.length ? offer.image_urls : [];

  const formatFieldName = (field: string) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4">
        {/* Main layout: two columns on desktop */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: Images */}
          {images.length > 0 && (
            <div className="flex md:flex-col gap-2 shrink-0">
              {images.map((url, index) => (
                <img
                  key={index}
                  src={resolveImageUrl(url)}
                  alt={`${offer.title} - ${index + 1}`}
                  className={`rounded-lg object-cover border ${
                    index === 0 ? 'w-24 h-24 md:w-32 md:h-32' : 'w-16 h-16 md:w-20 md:h-20 opacity-80'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Right: Info + Actions */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">{offer.title}</h3>

              {/* Price info */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-gray-900">
                  &#2547;{Number(offer.offer_price).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  &#2547;{Number(offer.regular_price).toLocaleString()}
                </span>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs font-semibold">
                  {Number(offer.discount_pct).toFixed(0)}% OFF
                </Badge>
              </div>

              {/* Seller info section */}
              {(offer.shop_name || offer.fb_page_link || offer.whatsapp_number) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">সেলার তথ্য</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    {offer.shop_name && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <div className="h-5 w-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Store className="h-3 w-3" />
                        </div>
                        {offer.shop_name}
                      </span>
                    )}
                    {offer.fb_page_link && (
                      <a
                        href={offer.fb_page_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <div className="h-5 w-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                          <ExternalLink className="h-3 w-3" />
                        </div>
                        FB Page
                      </a>
                    )}
                    {offer.whatsapp_number && (
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <div className="h-5 w-5 rounded bg-green-100 text-green-600 flex items-center justify-center">
                          <MessageCircle className="h-3 w-3" />
                        </div>
                        {offer.whatsapp_number}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
                অনুমোদন
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                প্রত্যাখ্যান
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit History - collapsible */}
      <div className="border-t">
        <button
          onClick={toggleHistory}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <History className="h-4 w-4" />
            এডিট হিস্ট্রি
          </span>
          {historyOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {historyOpen && (
          <div className="px-4 pb-4 space-y-2">
            {!historyLoaded ? (
              <div className="h-8 bg-muted rounded animate-pulse" />
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 italic py-2">
                কোনো এডিট হিস্ট্রি পাওয়া যায়নি।
              </p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg bg-gray-50 border px-3 py-2.5 text-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-gray-900">
                      {formatFieldName(entry.field_name)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(entry.edited_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="text-red-500 line-through break-all">
                      {entry.old_value || '(empty)'}
                    </span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span className="text-green-600 font-medium break-all">
                      {entry.new_value || '(empty)'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
