'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Store, ArrowUpRight } from 'lucide-react';
import { isAuthenticated } from '@/lib/api/auth';
import { FacebookIcon } from '@/components/icons/facebook';
import { WhatsAppIcon } from '@/components/icons/whatsapp';

export function Footer() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  return (
    <footer className="mt-16 md:mt-20 mb-14 md:mb-0">
      {/* Seller CTA - only for non-logged-in users */}
      {!loggedIn && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 py-5 md:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">আপনার শপের অফার পোস্ট করুন</p>
                  <p className="text-xs text-muted-foreground">রেজিস্ট্রেশন করলেই ৫টি ফ্রি ক্রেডিট পাবেন</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/login">
                  <span className="inline-flex items-center gap-1.5 text-xs border border-primary/20 text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                    লগইন
                  </span>
                </Link>
                <Link href="/signup">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    ফ্রিতে শুরু করুন
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Tag className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold">
                  Offer<span className="text-primary">HUB</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                বাংলাদেশের প্রথম F-Commerce ডিসকাউন্ট মার্কেটপ্লেস।
                সেলার ও ক্রেতাদের মধ্যে সংযোগ স্থাপন করি।
              </p>
              {/* Social */}
              <div className="flex items-center gap-3 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                  <FacebookIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center hover:bg-green-500/10 transition-colors">
                  <WhatsAppIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-primary/30 after:rounded-full">
                গুরুত্বপূর্ণ লিংক
              </h4>
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  সব অফার দেখুন
                </Link>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  সেলার লগইন
                </Link>
                <Link href="/signup" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  সেলার রেজিস্ট্রেশন
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-primary/30 after:rounded-full">
                নীতিমালা
              </h4>
              <div className="flex flex-col space-y-2">
                <Link href="/policies/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  শর্তাবলী
                </Link>
                <Link href="/policies/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  গোপনীয়তা নীতি
                </Link>
                <Link href="/policies/refund" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  রিফান্ড নীতি
                </Link>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="border-t mt-8 pt-5">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Payment Partner</span>
              <div className="bg-white px-3 py-1.5 rounded-lg border">
                <img src="/bkash_footer_logo.png" alt="bKash" className="h-5 object-contain" />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground/50">
              &copy; {new Date().getFullYear()} Offer HUB. All rights reserved.
            </p>
            <p className="text-[11px] text-muted-foreground/40">
              Made in Bangladesh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
