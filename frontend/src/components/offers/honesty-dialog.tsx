'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldAlert, Ban, CheckCircle2 } from 'lucide-react';

interface HonestyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function HonestyDialog({ open, onOpenChange, onConfirm }: HonestyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-xl">
        {/* Top warning banner */}
        <div className="bg-destructive/10 px-6 py-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogHeader className="space-y-1 text-left">
            <AlertDialogTitle className="text-lg">সতর্কতা: সঠিক মূল্য দিন</AlertDialogTitle>
            <p className="text-sm text-muted-foreground">
              অফার জমা দেওয়ার আগে নিচের বিষয়গুলো ভালোভাবে পড়ুন।
            </p>
          </AlertDialogHeader>
        </div>

        {/* Rules */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p>
              <strong className="text-foreground">ভুয়া দাম দেওয়া নিষিদ্ধ।</strong>{' '}
              <span className="text-muted-foreground">
                Regular Price বাড়িয়ে দেখিয়ে ভুয়া ডিসকাউন্ট দেখালে তা প্রতারণা হিসেবে গণ্য হবে।
              </span>
            </p>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p>
              <strong className="text-foreground">কাস্টমার রিপোর্ট করলে ব্যান।</strong>{' '}
              <span className="text-muted-foreground">
                কোনো ক্রেতা যদি আপনার মূল্য নিয়ে অভিযোগ করেন এবং তা সত্য প্রমাণিত হয়, তাহলে আপনার অ্যাকাউন্ট
                স্থায়ীভাবে বন্ধ করে দেওয়া হবে।
              </span>
            </p>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Ban className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p>
              <strong className="text-foreground">ক্রেডিট ফেরত হবে না।</strong>{' '}
              <span className="text-muted-foreground">
                ব্যান হলে আপনার বাকি ক্রেডিট ফেরত পাবেন না।
              </span>
            </p>
          </div>
        </div>

        {/* Confirm area */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <p className="text-xs text-muted-foreground mb-4 text-center">
            &ldquo;নিশ্চিত করুন&rdquo; বাটনে ক্লিক করলে আপনি স্বীকার করছেন যে আপনার দেওয়া সব তথ্য ও মূল্য সঠিক।
          </p>

          <AlertDialogFooter className="flex gap-3 sm:gap-3">
            <AlertDialogCancel className="flex-1 h-11">
              বাতিল করুন
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className="flex-1 h-11 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              নিশ্চিত করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
