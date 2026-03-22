'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isAuthenticated, clearAuth, getToken } from '@/lib/api/auth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import {
  LogOut,
  Plus,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Tag,
  Home,
  Search,
  Store,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const authed = isAuthenticated();
    setLoggedIn(authed);
    if (authed) {
      const token = getToken();
      api<{ profile: { is_admin: boolean } }>('/profile', { token: token! })
        .then((data) => setIsAdmin(data.profile.is_admin))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Sync search from URL
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleLogout = () => {
    clearAuth();
    setLoggedIn(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Tag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">
              Offer<span className="text-primary">HUB</span>
            </span>
          </Link>

          {/* Search bar - center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="অফার বা শপ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); router.push('/'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {loggedIn ? (
              <>
                {isAdmin ? (
                  <Link href="/admin">
                    <Button size="sm" className="gap-1.5 rounded-lg">
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/">
                      <Button
                        variant={pathname === '/' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="gap-1.5 rounded-lg"
                      >
                        <Home className="h-4 w-4" />
                        Home
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button
                        variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="gap-1.5 rounded-lg"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/offers/new">
                      <Button size="sm" className="gap-1.5 rounded-lg ml-1">
                        <Plus className="h-4 w-4" />
                        Post
                      </Button>
                    </Link>
                  </>
                )}
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                সেলার? <span className="font-semibold text-primary underline underline-offset-2">লগইন করুন</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-72 h-full bg-background shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 border-b">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <Tag className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold">
                  Offer<span className="text-primary">HUB</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="p-4 space-y-1">
              {loggedIn ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin" className="block">
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Admin Panel</p>
                          <p className="text-[11px] text-muted-foreground">ম্যানেজ করুন</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <Link href="/" className="block">
                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                          pathname === '/' ? 'bg-primary/5' : 'hover:bg-muted'
                        }`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            pathname === '/' ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <Home className={`h-4 w-4 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${pathname === '/' ? 'text-primary' : ''}`}>Home</p>
                            <p className="text-[11px] text-muted-foreground">অফার ব্রাউজ করুন</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/dashboard" className="block">
                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                          pathname === '/dashboard' ? 'bg-primary/5' : 'hover:bg-muted'
                        }`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            pathname === '/dashboard' ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <LayoutDashboard className={`h-4 w-4 ${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : ''}`}>Dashboard</p>
                            <p className="text-[11px] text-muted-foreground">আপনার অফার ও ক্রেডিট</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/offers/new" className="block">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                            <Plus className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Post Offer</p>
                            <p className="text-[11px] text-muted-foreground">নতুন অফার পোস্ট করুন</p>
                          </div>
                        </div>
                      </Link>
                    </>
                  )}

                  <div className="border-t my-3 mx-3" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/5 transition-colors w-full"
                  >
                    <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-destructive">Logout</p>
                      <p className="text-[11px] text-muted-foreground">সাইন আউট করুন</p>
                    </div>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="block">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">সেলার লগইন</p>
                        <p className="text-[11px] text-muted-foreground">আপনার শপে প্রবেশ করুন</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/signup" className="block">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">নতুন সেলার?</p>
                        <p className="text-[11px] text-muted-foreground">ফ্রিতে অ্যাকাউন্ট খুলুন</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-muted/30">
              <p className="text-[10px] text-muted-foreground text-center">
                Offer HUB &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav (only for logged-in sellers) */}
      {loggedIn && !isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            <Link href="/" className="flex flex-col items-center gap-0.5 py-1">
              <Home className={`h-5 w-5 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Home
              </span>
            </Link>
            <Link href="/offers/new" className="flex flex-col items-center gap-0.5 py-1">
              <div className="w-10 h-10 -mt-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] text-primary font-medium -mt-0.5">Post</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-1">
              <LayoutDashboard className={`h-5 w-5 ${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${pathname === '/dashboard' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
