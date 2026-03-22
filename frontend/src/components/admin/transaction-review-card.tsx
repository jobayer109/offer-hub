'use client';

import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/types/database';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Check, Loader2, ArrowRight, Store, Hash } from 'lucide-react';

interface TransactionReviewCardProps {
  transaction: Transaction;
  onAction: () => void;
}

export function TransactionReviewCard({ transaction, onAction }: TransactionReviewCardProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = getToken()!;
      await api(`/admin/transactions/${transaction.id}/approve`, { method: 'PUT', token });
      toast.success('লেনদেন অনুমোদিত হয়েছে!');
      onAction();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* bKash accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-pink-600" />

      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Shop name */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <Store className="h-4 w-4" />
              </div>
              <p className="font-semibold text-gray-900 truncate">{transaction.shop_name || 'Unknown Seller'}</p>
            </div>

            {/* TrxID */}
            <div className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                <Hash className="h-3.5 w-3.5" />
              </div>
              <span className="text-muted-foreground">bKash TrxID:</span>
              <code className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded font-mono text-sm font-medium">
                {transaction.bkash_trx_id}
              </code>
            </div>

            {/* Amount and Credits */}
            <div className="flex items-center gap-3 mt-1">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <p className="text-xs text-green-600 font-medium">পরিমাণ</p>
                <p className="text-lg font-bold text-green-700">
                  &#2547;{Number(transaction.amount).toLocaleString()}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                <p className="text-xs text-blue-600 font-medium">ক্রেডিট</p>
                <p className="text-lg font-bold text-blue-700">
                  {transaction.credits_added}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Approve button */}
          <div className="shrink-0">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              size="lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {loading ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন করুন'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
