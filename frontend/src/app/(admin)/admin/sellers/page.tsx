'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import {
  Users,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  PackageOpen,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Seller {
  id: string;
  shop_name: string;
  fb_page_link: string;
  whatsapp_number: string;
  credits_balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string;
  total_offers: string;
  active_offers: string;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = getToken()!;
        const data = await api<{ sellers: Seller[] }>('/admin/sellers', { token });
        setSellers(data.sellers);
      } catch {
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const filteredSellers = useMemo(() => {
    if (!searchQuery.trim()) return sellers;
    const q = searchQuery.toLowerCase();
    return sellers.filter(
      (s) =>
        s.shop_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q),
    );
  }, [sellers, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">সেলার তালিকা</h1>
              {!loading && (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                  {sellers.length}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">সকল নিবন্ধিত সেলার</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="সেলার খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="bg-white border rounded-lg flex flex-col items-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PackageOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {searchQuery ? 'কোনো সেলার পাওয়া যায়নি' : 'কোনো সেলার নেই'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {searchQuery
              ? 'অন্য কিওয়ার্ড দিয়ে খুঁজে দেখুন'
              : 'এখনো কোনো সেলার নিবন্ধন করেননি'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSellers.map((seller) => (
            <div key={seller.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
              {/* Header with avatar */}
              <div className="flex items-start gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {getInitials(seller.shop_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {seller.shop_name || 'Unnamed Shop'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {seller.credits_balance} credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Inline stats */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-blue-700">{seller.total_offers}</p>
                  <p className="text-xs text-blue-600">মোট অফার</p>
                </div>
                <div className="flex-1 bg-green-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-green-700">{seller.active_offers}</p>
                  <p className="text-xs text-green-600">অ্যাক্টিভ</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-sm text-muted-foreground border-t pt-3">
                {seller.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{seller.email}</span>
                  </div>
                )}
                {seller.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{seller.phone}</span>
                  </div>
                )}
                {seller.whatsapp_number && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{seller.whatsapp_number}</span>
                  </div>
                )}
                {seller.fb_page_link && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <a
                      href={seller.fb_page_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium truncate"
                    >
                      FB Page
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>যোগদান: {formatDate(seller.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
