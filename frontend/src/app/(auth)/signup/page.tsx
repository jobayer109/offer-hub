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
import { SignupMascot } from '@/components/auth/signup-mascot';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { FormAlert } from '@/components/ui/form-alert';

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'idle' | 'phone' | 'password'>('idle');
  const [mood, setMood] = useState<'neutral' | 'happy' | 'sad'>('neutral');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const step = password.length >= 6 ? 2 : phone.length >= 11 ? 1 : 0;
  const isTyping = focusedField !== 'idle';

  const phoneValid = /^\d{11}$/.test(phone);
  const passwordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMood('neutral');
    setError('');
    setSuccess('');

    try {
      const data = await api<{
        user: { id: string; phone: string };
        token: string;
      }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      setAuth(data.token, { id: data.user.id, email: data.user.phone });
      setMood('happy');
      setSuccess('Account created! Redirecting to profile setup...');
      setTimeout(() => router.push('/complete-profile'), 1500);
    } catch (err: any) {
      setMood('sad');
      setError(err.message || 'Something went wrong. Please try again.');
      setTimeout(() => setMood('neutral'), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg border-0">
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-6 pb-2 px-6">
        <SignupMascot step={step} typing={isTyping} mood={mood} />
        <h2 className="text-2xl font-bold text-center">সেলার রেজিস্ট্রেশন</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">
          আপনার শপের অফার পোস্ট করুন — ৫টি ফ্রি ক্রেডিট পান!
        </p>
      </div>

      <CardContent className="px-6 pt-4">
        {/* Success message */}
        {success && (
          <FormAlert type="success" message={success} />
        )}

        {/* Error message */}
        {error && (
          <FormAlert type="error" message={error} onDismiss={() => { setError(''); setMood('neutral'); }} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center justify-between">
              <span>ফোন নম্বর</span>
              {phone.length > 0 && (
                <span className={`text-xs ${phoneValid ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {phone.length}/11
                </span>
              )}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 11) setPhone(val);
                  setError('');
                }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField('idle')}
                required
                className={`h-11 pl-10 transition-all duration-200 ${
                  focusedField === 'phone' ? 'ring-2 ring-primary/30' : ''
                } ${phone.length > 0 && phoneValid ? 'border-green-400' : ''} ${error ? 'border-destructive/50' : ''}`}
              />
              {phoneValid && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">&#10003;</span>
              )}
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center justify-between">
              <span>পাসওয়ার্ড</span>
              {password.length > 0 && (
                <span className={`text-xs ${passwordValid ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {passwordValid ? 'যথেষ্ট শক্তিশালী' : `আরো ${6 - password.length}টি`}
                </span>
              )}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('idle')}
                required
                minLength={6}
                className={`h-11 pl-10 pr-10 transition-all duration-200 ${
                  focusedField === 'password' ? 'ring-2 ring-primary/30' : ''
                } ${password.length > 0 && passwordValid ? 'border-green-400' : ''} ${error ? 'border-destructive/50' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length >= i * 2
                        ? i === 1
                          ? 'bg-rose-400'
                          : i === 2
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={loading || !phoneValid || !passwordValid}
          >
            {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'সেলার অ্যাকাউন্ট খুলুন'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2 pb-6">
        <p className="text-sm text-muted-foreground">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            লগইন করুন
          </Link>
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          এই পেজটি শুধুমাত্র সেলারদের জন্য। কাস্টমারদের অ্যাকাউন্ট খোলার প্রয়োজন নেই।
        </p>
      </CardFooter>
    </Card>
  );
}
