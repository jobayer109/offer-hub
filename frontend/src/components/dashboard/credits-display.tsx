'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/use-credits';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';

export function CreditsDisplay() {
  const { credits, loading } = useCredits();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{loading ? '...' : credits}</div>
        <p className="text-xs text-muted-foreground mt-1">1 credit = 1 offer post</p>
        <Link href="/dashboard/top-up">
          <Button variant="outline" size="sm" className="mt-3 w-full">
            ক্রেডিট কিনুন
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
