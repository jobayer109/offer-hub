'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { api } from '@/lib/api/client';
import { setAuth } from '@/lib/api/auth';
import { LoginMascot } from '@/components/auth/login-mascot';
import { FormAlert } from '@/components/ui/form-alert';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<'idle' | 'phone' | 'password'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api<{
        user: { id: string; phone: string };
        hasProfile: boolean;
        isAdmin: boolean;
        token: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      setAuth(data.token, { id: data.user.id, email: data.user.phone });

      if (!data.hasProfile) {
        router.push('/complete-profile');
      } else if (data.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg border-0">
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-6 pb-2 px-6">
        <LoginMascot watching={focusedField} phoneLength={phone.length} />
        <h2 className="text-2xl font-bold text-center">সেলার লগইন</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">
          আপনার শপে প্রবেশ করুন এবং অফার ম্যানেজ করুন
        </p>
      </div>

      <CardContent className="px-6 pt-4">
        {/* Inline error */}
        {error && (
          <FormAlert type="error" message={error} onDismiss={() => setError('')} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">ফোন নম্বর অথবা ইমেইল</Label>
            <Input
              id="phone"
              type="text"
              placeholder="01XXXXXXXXX অথবা ইমেইল"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField('idle')}
              required
              className={`h-11 ${error ? 'border-destructive/50' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input
              id="password"
              type="password"
              placeholder="আপনার পাসওয়ার্ড দিন"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('idle')}
              required
              className={`h-11 ${error ? 'border-destructive/50' : ''}`}
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
            {loading ? 'লগইন হচ্ছে...' : 'সেলার লগইন'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2 pb-6">
        <p className="text-sm text-muted-foreground">
          নতুন সেলার?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            ফ্রিতে রেজিস্ট্রেশন করুন
          </Link>
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          এই পেজটি শুধুমাত্র সেলারদের জন্য। কাস্টমারদের লগইন করার প্রয়োজন নেই।
        </p>
      </CardFooter>
    </Card>
  );
}
