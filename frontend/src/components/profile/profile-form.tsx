'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Store,
  Mail,
  Gift,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Pencil,
  Coins,
  PartyPopper,
} from 'lucide-react';
import { FacebookIcon } from '@/components/icons/facebook';
import { WhatsAppIcon } from '@/components/icons/whatsapp';
import { FormAlert } from '@/components/ui/form-alert';

const steps = [
  {
    key: 'email' as const,
    label: 'ইমেইল',
    sublabel: 'আপনার ইমেইল দিন',
    icon: Mail,
    placeholder: 'you@example.com',
    type: 'email',
  },
  {
    key: 'shop_name' as const,
    label: 'শপের নাম',
    sublabel: 'আপনার শপের নাম কী?',
    icon: Store,
    placeholder: 'যেমন: Fashion Hub BD',
    type: 'text',
  },
  {
    key: 'fb_page_link' as const,
    label: 'Facebook Page',
    sublabel: 'আপনার Facebook Page এর লিংক দিন',
    icon: FacebookIcon,
    placeholder: 'https://facebook.com/yourpage',
    type: 'url',
  },
  {
    key: 'whatsapp_number' as const,
    label: 'WhatsApp নম্বর',
    sublabel: 'আপনার WhatsApp নম্বর দিন',
    icon: WhatsAppIcon,
    placeholder: '01XXXXXXXXX (Optional)',
    type: 'tel',
    optional: true,
  },
];

export function ProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      shop_name: '',
      fb_page_link: '',
      whatsapp_number: '',
    },
  });

  const watchedFields = watch();
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const currentStepData = steps[currentStep] as typeof steps[number] & { optional?: boolean };
  const currentValue = watchedFields[currentStepData?.key] || '';
  const currentError = errors[currentStepData?.key];
  const isOptionalStep = currentStepData?.optional;

  const handleNext = async () => {
    const valid = await trigger(currentStepData.key);
    if (!valid) return;

    if (isLastStep) {
      setShowSummary(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleEditField = (fieldKey: string) => {
    const stepIndex = steps.findIndex((s) => s.key === fieldKey);
    if (stepIndex >= 0) {
      setEditingField(fieldKey);
      setShowSummary(false);
      setCurrentStep(stepIndex);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      await api('/profile/complete', {
        method: 'PUT',
        token: token!,
        body: JSON.stringify(data),
      });
      setSuccess('done');
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err: any) {
      setError(err.message || 'কিছু একটা সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Success celebration screen
  if (success === 'done') {
    return (
      <Card className="overflow-hidden shadow-lg border-0">
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <PartyPopper className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">অভিনন্দন! 🎉</h2>
          <p className="text-muted-foreground mt-2">আপনার প্রোফাইল তৈরি হয়েছে</p>
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 font-semibold px-4 py-2 rounded-full mt-4">
            <Coins className="h-4 w-4" />
            ৫টি ফ্রি ক্রেডিট পেয়েছেন!
          </div>
          <p className="text-xs text-muted-foreground mt-4">Dashboard এ নিয়ে যাচ্ছি...</p>
        </div>
      </Card>
    );
  }

  // Summary / Review screen
  if (showSummary) {
    return (
      <Card className="overflow-hidden shadow-lg border-0">
        <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 pt-6 pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <Check className="h-7 w-7 text-green-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center">সব তথ্য ঠিক আছে?</h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            ভুল থাকলে এডিট করুন, তারপর সাবমিট করুন
          </p>
        </div>

        <div className="px-6 py-4 space-y-2">
          {error && <FormAlert type="error" message={error} onDismiss={() => setError('')} />}

          {steps.map((step) => {
            const Icon = step.icon;
            const value = watchedFields[step.key] || '';
            return (
              <div
                key={step.key}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{step.label}</p>
                  <p className="text-sm font-medium truncate">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditField(step.key)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6 space-y-3">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  সেভ হচ্ছে...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  প্রোফাইল সম্পূর্ণ করুন
                </>
              )}
            </Button>
          </form>
          <button
            type="button"
            onClick={handleBack}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            ← পিছনে যান
          </button>
        </div>
      </Card>
    );
  }

  // Step-by-step form
  const StepIcon = currentStepData.icon;

  return (
    <Card className="overflow-hidden shadow-lg border-0">
      {/* Progress */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground font-medium">
            ধাপ {currentStep + 1}/{totalSteps}
          </span>
          <span className="text-[10px] text-primary font-medium">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div key={currentStepData.key} className="px-6 pt-8 pb-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center animate-in zoom-in duration-300">
            <StepIcon className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Label */}
        <h2 className="text-xl font-bold text-center animate-in fade-in slide-in-from-right-4 duration-300">
          {currentStepData.sublabel}
        </h2>

        {/* Input */}
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
          <Input
            key={currentStepData.key}
            {...register(currentStepData.key)}
            type={currentStepData.type}
            placeholder={currentStepData.placeholder}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`h-12 text-center text-base rounded-xl transition-all duration-200 ${
              currentError
                ? 'border-destructive ring-2 ring-destructive/20'
                : currentValue
                  ? 'border-green-400 ring-2 ring-green-400/20'
                  : 'focus:ring-2 focus:ring-primary/30'
            }`}
          />
          {currentError && (
            <p className="text-xs text-destructive flex items-center justify-center gap-1 mt-2 animate-in fade-in duration-200">
              <AlertCircle className="h-3 w-3" />
              {currentError.message}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex gap-3">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="h-11 px-4 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          onClick={() => {
            if (editingField) {
              trigger(currentStepData.key).then((valid) => {
                if (valid) {
                  setEditingField(null);
                  setShowSummary(true);
                }
              });
            } else {
              handleNext();
            }
          }}
          className="flex-1 h-11 font-semibold rounded-xl gap-2"
          disabled={!isOptionalStep && (!currentValue || !!currentError)}
        >
          {editingField ? (
            <>
              <Check className="h-4 w-4" />
              আপডেট করুন
            </>
          ) : isLastStep ? (
            <>
              {isOptionalStep && !currentValue ? 'স্কিপ করে রিভিউ করুন' : 'রিভিউ করুন'}
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              {isOptionalStep && !currentValue ? 'স্কিপ করুন' : 'পরবর্তী'}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Optional hint */}
      {isOptionalStep && (
        <div className="px-6 -mt-3 mb-1">
          <p className="text-[11px] text-muted-foreground/60 text-center">
            এটি ঐচ্ছিক। না দিলে স্কিপ করতে পারেন।
          </p>
        </div>
      )}

      {/* Free credits reminder */}
      <div className="px-6 pb-5">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
          <Gift className="h-3.5 w-3.5 text-primary" />
          <span>৫টি ফ্রি ক্রেডিট পাবেন!</span>
        </div>
      </div>
    </Card>
  );
}
