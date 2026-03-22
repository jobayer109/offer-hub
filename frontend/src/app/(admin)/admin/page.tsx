'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { FileText, CreditCard, Users, ShoppingBag, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  pendingOffers: number;
  pendingTrx: number;
  totalSellers: number;
  totalActiveOffers: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingOffers: 0,
    pendingTrx: 0,
    totalSellers: 0,
    totalActiveOffers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken()!;

    Promise.allSettled([
      api<{ offers: any[] }>('/admin/offers/pending', { token }),
      api<{ transactions: any[] }>('/admin/transactions/pending', { token }),
      api<{ sellers: any[] }>('/admin/sellers', { token }),
    ]).then(([offersResult, trxResult, sellersResult]) => {
      const offers = offersResult.status === 'fulfilled' ? offersResult.value.offers : [];
      const transactions = trxResult.status === 'fulfilled' ? trxResult.value.transactions : [];
      const sellers = sellersResult.status === 'fulfilled' ? sellersResult.value.sellers : [];

      setStats({
        pendingOffers: offers.length,
        pendingTrx: transactions.length,
        totalSellers: sellers.length,
        totalActiveOffers: 0,
      });
      setLoading(false);
    });
  }, []);

  const statCards = [
    {
      label: 'পেন্ডিং অফার',
      labelEn: 'Pending Offers',
      value: stats.pendingOffers,
      icon: FileText,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      href: '/admin/offers',
    },
    {
      label: 'পেন্ডিং লেনদেন',
      labelEn: 'Pending Transactions',
      value: stats.pendingTrx,
      icon: CreditCard,
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      href: '/admin/transactions',
    },
    {
      label: 'মোট সেলার',
      labelEn: 'Total Sellers',
      value: stats.totalSellers,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      href: '/admin/sellers',
    },
    {
      label: 'অ্যাক্টিভ অফার',
      labelEn: 'Active Offers',
      value: stats.totalActiveOffers,
      icon: ShoppingBag,
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      href: '/admin/offers',
    },
  ];

  const quickActions = [
    { label: 'অফার রিভিউ করুন', href: '/admin/offers', icon: FileText },
    { label: 'লেনদেন অনুমোদন করুন', href: '/admin/transactions', icon: CreditCard },
    { label: 'ব্যানার ব্যবস্থাপনা', href: '/admin/banners', icon: TrendingUp },
    { label: 'সেলার তালিকা', href: '/admin/sellers', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">স্বাগতম, Admin</h1>
        <p className="text-muted-foreground mt-1">Offer HUB ম্যানেজমেন্ট ড্যাশবোর্ড</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.href + card.labelEn} href={card.href}>
            <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {loading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              )}
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              <p className="text-xs text-muted-foreground/70">{card.labelEn}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">দ্রুত অ্যাকশন</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href + action.label} href={action.href}>
              <div className="bg-white border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all text-center group">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
                  <action.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-700">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
