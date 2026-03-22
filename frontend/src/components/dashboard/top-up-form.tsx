'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { useProfile } from '@/hooks/use-profile';
import { FormAlert } from '@/components/ui/form-alert';
import Link from 'next/link';
import { Coins, ArrowLeft } from 'lucide-react';

export function TopUpForm() {
  const { profile, loading: profileLoading } = useProfile();
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const creditsToAdd = amount ? Math.floor(Number(amount) / 50) : 0;
  const hasProfile = !profileLoading && profile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken()!;
      await api('/transactions/top-up', {
        method: 'POST',
        token,
        body: JSON.stringify({
          amount: Number(amount),
          bkash_trx_id: trxId,
        }),
      });
      setSuccess('আপনার request জমা হয়েছে! Admin approve করলে credit যোগ হবে।');
      setAmount('');
      setTrxId('');
    } catch (err: any) {
      setError(err.message || 'কিছু একটা সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  // Profile না থাকলে force complete profile
  if (!hasProfile) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-amber-500/10 px-5 pt-6 pb-4 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Coins className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-bold">প্রোফাইল সম্পূর্ণ করুন</h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
              ক্রেডিট কেনার আগে আপনার শপের তথ্য দিন। প্রোফাইল সম্পূর্ণ করলেই পাবেন —
            </p>
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full mt-2">
              <Coins className="h-3.5 w-3.5" />
              ৫টি ফ্রি ক্রেডিট!
            </div>
          </div>
          <div className="p-5">
            <Link href="/complete-profile">
              <Button className="w-full h-11 font-semibold gap-2 rounded-xl">
                প্রোফাইল সম্পূর্ণ করুন →
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center p-1.5">
              <img src="/bkash_logo.png" alt="bKash" className="h-full object-contain" />
            </div>
            <div>
              <h2 className="font-semibold">bKash দিয়ে Credit কিনুন</h2>
              <p className="text-xs text-muted-foreground">প্রতি ৫০ টাকায় ১ credit</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT: Info */}
            <div className="space-y-5">
              {/* Current balance */}
              <div className="flex items-center gap-3 bg-primary/5 rounded-xl p-3 border border-primary/10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">বর্তমান ব্যালেন্স</p>
                  <p className="text-xl font-bold">{profile.credits_balance} <span className="text-sm font-normal text-muted-foreground">credits</span></p>
                </div>
              </div>

              {/* Pricing table */}
              <div className="rounded-xl border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5">
                  <p className="text-xs font-semibold">ক্রেডিট প্রাইসিং</p>
                </div>
                <div className="divide-y">
                  {[
                    { amount: 50, credits: 1 },
                    { amount: 100, credits: 2 },
                    { amount: 250, credits: 5 },
                    { amount: 500, credits: 10 },
                  ].map((tier) => (
                    <button
                      key={tier.amount}
                      type="button"
                      onClick={() => setAmount(String(tier.amount))}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/5 transition-colors ${
                        amount === String(tier.amount) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className="text-muted-foreground">৳{tier.amount}</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5 text-primary" />
                        {tier.credits} credit{tier.credits > 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                  <div className="px-4 py-2 bg-muted/20">
                    <p className="text-[10px] text-muted-foreground text-center">প্রতি ৫০ টাকায় ১ credit | কাস্টম পরিমাণও দিতে পারবেন</p>
                  </div>
                </div>
              </div>

              {/* bKash steps */}
              <div className="bg-[#E2136E]/5 border border-[#E2136E]/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img src="/bkash_logo.png" alt="bKash" className="h-5 shrink-0" />
                  <p className="text-xs font-semibold text-[#E2136E]">কিভাবে ক্রেডিট কিনবেন?</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#E2136E]/10 text-[#E2136E] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">১</span>
                    <p className="text-xs text-[#E2136E]/70">bKash অ্যাপ থেকে <strong>Send Money</strong> করুন</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#E2136E]/10 text-[#E2136E] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">২</span>
                    <p className="text-xs text-[#E2136E]/70">নম্বর: <strong>01XXXXXXXXX</strong> (Personal)</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#E2136E]/10 text-[#E2136E] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">৩</span>
                    <p className="text-xs text-[#E2136E]/70">Transaction ID নিচে দিন ও সাবমিট করুন</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className="space-y-5">
              {success && <FormAlert type="success" message={success} />}
              {error && <FormAlert type="error" message={error} onDismiss={() => setError('')} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">টাকার পরিমাণ (BDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    placeholder="সর্বনিম্ন ৫০ টাকা"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="h-11"
                  />
                  {creditsToAdd > 0 && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <span className="text-xs text-green-700">আপনি পাবেন</span>
                      <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        {creditsToAdd} credits
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trxId">bKash Transaction ID</Label>
                  <Input
                    id="trxId"
                    placeholder="যেমন: TRX1234ABCD"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto md:px-12 h-11 font-semibold" disabled={loading}>
                  {loading ? 'জমা হচ্ছে...' : 'ক্রেডিট কেনার রিকোয়েস্ট জমা দিন'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
