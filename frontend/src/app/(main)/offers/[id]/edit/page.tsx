'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { offerSchema, type OfferFormValues } from '@/lib/validators/offer';
import { api } from '@/lib/api/client';
import { getToken, getUser, isAuthenticated } from '@/lib/api/auth';
import type { Offer } from '@/lib/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormAlert } from '@/components/ui/form-alert';
import Link from 'next/link';
import {
  ArrowLeft,
  Tag,
  Type,
  FileText,
  Grid3X3,
  BadgeDollarSign,
  Link2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Save,
  ImagePlus,
  X,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

const categories = [
  { value: 'Fashion', emoji: '\uD83D\uDC57' },
  { value: 'Gadget', emoji: '\uD83D\uDCF1' },
  { value: 'Electronics', emoji: '\uD83D\uDCBB' },
  { value: 'Beauty', emoji: '\uD83D\uDC84' },
  { value: 'Food', emoji: '\uD83C\uDF54' },
  { value: 'Others', emoji: '\uD83D\uDCE6' },
] as const;

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const fetchOffer = async () => {
      const token = getToken();
      const user = getUser();
      if (!token || !user) {
        router.push('/login');
        return;
      }

      try {
        const data = await api<{ offer: Offer }>(`/offers/${offerId}`, { token });
        const o = data.offer;

        if (o.seller_id !== user.id) {
          setAccessDenied(true);
          setPageLoading(false);
          return;
        }

        setOffer(o);
        setImageUrls(o.image_urls || []);
        reset({
          title: o.title,
          description: o.description,
          category: o.category,
          regular_price: Number(o.regular_price),
          offer_price: Number(o.offer_price),
          target_link: o.target_link,
        });
      } catch {
        setError('Offer load করা যায়নি।');
      } finally {
        setPageLoading(false);
      }
    };
    fetchOffer();
  }, [offerId, router, reset]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - imageUrls.length;
    if (remaining <= 0) {
      setError('Maximum 3 images allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    for (const file of filesToUpload) {
      if (file.size > 1 * 1024 * 1024) {
        setError(`"${file.name}" is larger than 1MB`);
        return;
      }
    }

    setUploadingImage(true);
    setError('');

    try {
      const token = getToken()!;
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('images', file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setImageUrls((prev) => [...prev, ...data.urls]);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: OfferFormValues) => {
    if (imageUrls.length === 0) {
      setError('At least 1 image is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken()!;
      await api(`/offers/${offerId}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({
          ...data,
          image_urls: imageUrls,
        }),
      });

      setSuccess('আপডেট হয়েছে! Admin review এর পর আবার publish হবে।');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'কিছু একটা সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <FormAlert type="error" message="এই offer টি আপনার নয়। আপনি শুধু নিজের offer edit করতে পারবেন।" />
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard এ ফিরে যান
          </Button>
        </Link>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <FormAlert type="error" message="Offer পাওয়া যায়নি।" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
      {/* Header */}
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
            Edit Offer
          </h1>
        </div>
      </div>

      {/* Alerts */}
      {success && <FormAlert type="success" message={success} />}
      {error && <FormAlert type="error" message={error} onDismiss={() => setError('')} />}

      {/* Form Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              পরিবর্তন করলে offer আবার Admin review তে যাবে।
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Product Title
              </span>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Description
              </span>
              <span className={`text-xs ${descLength > 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {descLength}/300
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your offer, features, and why it's a great deal..."
              {...register('description')}
              className="min-h-24 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
              Category
            </Label>
            <Select
              defaultValue={offer.category}
              onValueChange={(val) => setValue('category', val as any)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
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
            <Label className="flex items-center gap-2">
              <BadgeDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              Pricing
            </Label>
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

          {/* Target Link */}
          <div className="space-y-2">
            <Label htmlFor="target_link" className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              Facebook Page Link
            </Label>
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

          {/* Images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
              Product Images ({imageUrls.length}/3)
            </Label>

            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                  <Image
                    src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {imageUrls.length < 3 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  {uploadingImage ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Add Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Max 1MB per image. First image is the cover.</p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Offer
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
