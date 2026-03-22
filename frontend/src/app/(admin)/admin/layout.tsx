'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  FileText,
  CreditCard,
  LogOut,
  Image as ImageIcon,
  Users,
  Menu,
  X,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearAuth, isAuthenticated, getToken } from '@/lib/api/auth';
import { api } from '@/lib/api/client';
import { useState, useEffect } from 'react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', icon: LayoutDashboard, color: 'bg-blue-100 text-blue-600' },
  { href: '/admin/offers', label: 'Pending Offers', labelBn: 'পেন্ডিং অফার', icon: FileText, color: 'bg-amber-100 text-amber-600' },
  { href: '/admin/transactions', label: 'Transactions', labelBn: 'লেনদেন', icon: CreditCard, color: 'bg-green-100 text-green-600' },
  { href: '/admin/banners', label: 'Banners', labelBn: 'ব্যানার', icon: ImageIcon, color: 'bg-purple-100 text-purple-600' },
  { href: '/admin/sellers', label: 'Sellers', labelBn: 'সেলার', icon: Users, color: 'bg-rose-100 text-rose-600' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const token = getToken()!;
    api<{ profile: { is_admin: boolean } }>('/profile', { token })
      .then((data) => {
        if (data.profile.is_admin) {
          setAuthorized(true);
        } else {
          router.replace('/');
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => {
        setChecking(false);
      });
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  if (checking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600" />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Offer HUB</span>
                <span className="ml-1.5 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Admin</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              সাইটে ফিরুন
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed md:sticky top-[calc(3.25rem+4px)] z-30 h-[calc(100vh-3.25rem-4px)] w-64 bg-white border-r transition-transform duration-200 md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="p-3 space-y-1">
            {adminLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', active ? link.color : 'bg-gray-100 text-gray-500')}>
                    <link.icon className="h-4 w-4" />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-3 right-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-3">
              <p className="text-xs font-medium text-blue-800">Offer HUB Admin</p>
              <p className="text-xs text-blue-600/70 mt-0.5">ম্যানেজমেন্ট প্যানেল</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
