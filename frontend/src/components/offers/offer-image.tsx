'use client';

import { Package } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils/image';

interface OfferImageProps {
  imageUrls?: string[];
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-full aspect-video',
};

const iconSizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function OfferImage({ imageUrls, alt, size = 'md' }: OfferImageProps) {
  const sizeClass = sizeClasses[size];
  const coverImage = imageUrls?.[0];

  if (coverImage) {
    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden bg-muted shrink-0`}>
        <img
          src={resolveImageUrl(coverImage)}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-lg bg-muted flex items-center justify-center shrink-0`}>
      <Package className={`${iconSizes[size]} text-muted-foreground/40`} />
    </div>
  );
}
