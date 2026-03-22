'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { offerSchema, type OfferFormValues } from '@/lib/validators/offer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HonestyDialog } from './honesty-dialog';
import { api, apiFormData } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCredits } from '@/hooks/use-credits';
import {
  Tag,
  ImagePlus,
  X,
  AlertCircle,
  Coins,
  ArrowLeft,
  Sparkles,
  TrendingDown,
  Star,
} from 'lucide-react';
import { FormAlert } from '@/components/ui/form-alert';
import Link from 'next/link';
import { offerCategories } from '@/lib/categories';

const MAX_IMAGES = 3;

export function OfferForm() {
  const router = useRouter();
  const { credits, loading: creditsLoading } = useCredits();
  const [loading, setLoading] = useState(false);
  const [honestyOpen, setHonestyOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
  });

  const regularPrice = watch('regular_price');
  const offerPrice = watch('offer_price');
  const titleLength = watch('title')?.length || 0;
  const descLength = watch('description')?.length || 0;

  const discountPct =
    regularPrice && offerPrice && regularPrice > 0
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

  const discountValid = discountPct >= 15;
  const savings = regularPrice && offerPrice ? regularPrice - offerPrice : 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setError('Image size must be under 1MB.');
      return;
    }

    if (imageFiles.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    setImageFiles((prev) => [...prev, file]);
    setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
    setError('');

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const onFormSubmit = () => {
    setHonestyOpen(true);
  };

  const onConfirmSubmit = async () => {
    setHonestyOpen(false);
    setLoading(true);
    setError('');

    try {
      const token = getToken()!;
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
        const uploadRes = await apiFormData<{ urls: string[] }>('/upload/images', formData, token);
        imageUrls = uploadRes.urls;
      }

      const formValues = watch();
      await api('/offers', {
        method: 'POST',
        token,
        body: JSON.stringify({
          ...formValues,
          image_urls: imageUrls,
        }),
      });

      setSuccess('Offer submitted! Admin review এর পর publish হবে।');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'কিছু একটা সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const insufficientCredits = !creditsLoading && credits < 1;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Post New Offer
              </h1>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5 py-1">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">{creditsLoading ? '...' : credits}</span> credits
          </Badge>
        </div>

        {/* Insufficient Credits Warning */}
        {insufficientCredits && (
          <Card className="border-0 shadow-sm overflow-hidden bg-amber-50/50 border-amber-200">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Coins className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">অফার পোস্ট করতে ক্রেডিট দরকার</p>
                <p className="text-xs text-amber-600/80 mt-0.5">
                  প্রতিটি অফার পোস্টে ১ ক্রেডিট খরচ হয়। bKash দিয়ে সহজেই ক্রেডিট কিনুন!
                </p>
              </div>
              <Link href="/dashboard/top-up" className="shrink-0">
                <Button size="sm" className="rounded-lg gap-1.5 text-xs h-8">
                  <Coins className="h-3 w-3" />
                  কিনুন
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Success / Error */}
        {success && (
          <FormAlert type="success" message={success} />
        )}
        {error && (
          <FormAlert type="error" message={error} onDismiss={() => setError('')} />
        )}

        {/* Form Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-amber-50/60 px-4 md:px-6 py-3 md:py-4 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs md:text-sm text-muted-foreground">
                সব তথ্য সঠিকভাবে পূরণ করুন। Admin approve করলে ১ credit কেটে নেওয়া হবে।
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 md:p-6">
            <div className="grid md:grid-cols-2 gap-5 md:gap-8">
            {/* LEFT column */}
            <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center justify-between">
                <span>Product Title</span>
                <span className={`text-xs ${titleLength > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {titleLength}/60
                </span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Premium Cotton T-Shirt - Summer Sale"
                {...register('title')}
                className="h-11"
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.title.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(val) => setValue('category', val as any)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {offerCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.value}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.category.message}
                </p>
              )}
            </div>

            {/* Price Section */}
            <div className="space-y-3">
              <Label>Pricing</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Regular Price (BDT)</span>
                  <Input
                    id="regular_price"
                    type="number"
                    placeholder="0"
                    {...register('regular_price', { valueAsNumber: true })}
                    className="h-11"
                  />
                  {errors.regular_price && (
                    <p className="text-xs text-destructive">{errors.regular_price.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Offer Price (BDT)</span>
                  <Input
                    id="offer_price"
                    type="number"
                    placeholder="0"
                    {...register('offer_price', { valueAsNumber: true })}
                    className="h-11"
                  />
                  {errors.offer_price && (
                    <p className="text-xs text-destructive">{errors.offer_price.message}</p>
                  )}
                </div>
              </div>

              {/* Discount indicator */}
              {regularPrice > 0 && offerPrice > 0 && (
                <div className={`rounded-lg p-3 flex items-center justify-between ${
                  discountValid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-destructive/5 border border-destructive/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <TrendingDown className={`h-4 w-4 ${discountValid ? 'text-green-600' : 'text-destructive'}`} />
                    <span className={`text-sm font-semibold ${discountValid ? 'text-green-700' : 'text-destructive'}`}>
                      {discountPct}% OFF
                    </span>
                  </div>
                  <div className="text-right">
                    {discountValid ? (
                      <span className="text-xs text-green-600">Save &#2547;{savings.toLocaleString()}</span>
                    ) : (
                      <span className="text-xs text-destructive">Minimum 15% discount required</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center justify-between">
                <span>Description</span>
                <span className={`text-xs ${descLength > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {descLength}/1000
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your offer, features, and why it's a great deal..."
                {...register('description')}
                className="h-32 resize-none overflow-y-auto"
              />
              {errors.description && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.description.message}
                </p>
              )}
            </div>

            </div>

            {/* RIGHT column */}
            <div className="space-y-5">
            {/* Target Link */}
            <div className="space-y-2">
              <Label htmlFor="target_link">Facebook Page Link</Label>
              <Input
                id="target_link"
                placeholder="https://facebook.com/your-post or m.me/your-page"
                {...register('target_link')}
                className="h-11"
              />
              {errors.target_link && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.target_link.message}
                </p>
              )}
            </div>

            {/* Image Upload - Multiple (up to 3) */}
            <div className="space-y-2">
              <Label>
                Images <span className="text-xs text-muted-foreground font-normal">(Max {MAX_IMAGES}, each under 1MB)</span>
              </Label>

              <div className="grid grid-cols-3 gap-3">
                {/* Render image slots */}
                {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                  const preview = imagePreviews[index];
                  const isCover = index === 0 && imagePreviews.length > 0;

                  if (preview) {
                    return (
                      <div key={index} className="relative rounded-xl overflow-hidden border bg-muted aspect-square">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        {isCover && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                            <Star className="h-2.5 w-2.5" />
                            Cover
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    );
                  }

                  // Empty slot - only show the next available one as clickable
                  const isNextSlot = index === imagePreviews.length;
                  if (isNextSlot) {
                    return (
                      <label
                        key={index}
                        htmlFor={`image-upload-${index}`}
                        className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <ImagePlus className="h-6 w-6 text-muted-foreground/40 mb-1" />
                        <span className="text-[10px] text-muted-foreground text-center px-1">
                          {index === 0 ? 'Add cover image' : `Add image ${index + 1}`}
                        </span>
                        <input
                          id={`image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    );
                  }

                  // Inactive slot
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted rounded-xl opacity-40"
                    >
                      <ImagePlus className="h-6 w-6 text-muted-foreground/30 mb-1" />
                      <span className="text-[10px] text-muted-foreground/50">Image {index + 1}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground/60">
                PNG, JPG, WEBP up to 1MB each. First image will be the cover.
              </p>
            </div>
            </div>
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-2 md:flex md:justify-end">
              <div className="relative group md:w-auto">
                <Button
                  type="submit"
                  className="w-full md:w-auto md:px-12 h-12 text-base font-semibold gap-2"
                  disabled={loading || insufficientCredits}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      জমা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4" />
                      অফার জমা দিন
                    </>
                  )}
                </Button>
                {/* Tooltip when no credits */}
                {insufficientCredits && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    আপনার credit নেই। আগে ক্রেডিট কিনুন।
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                  </div>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>

      <HonestyDialog open={honestyOpen} onOpenChange={setHonestyOpen} onConfirm={onConfirmSubmit} />
    </>
  );
}
