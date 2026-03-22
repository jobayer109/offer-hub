import { z } from 'zod';

export const profileSchema = z.object({
  email: z
    .string()
    .min(1, 'ইমেইল দিতে হবে')
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'সঠিক ইমেইল দিন (যেমন: you@example.com)',
    ),
  shop_name: z
    .string()
    .min(2, 'শপের নাম কমপক্ষে ২ অক্ষরের হতে হবে')
    .max(100, 'শপের নাম ১০০ অক্ষরের বেশি হতে পারবে না')
    .refine(
      (val) => /^[a-zA-Z\u0980-\u09FF]/.test(val),
      'শপের নাম অক্ষর দিয়ে শুরু হতে হবে, সংখ্যা দিয়ে নয়',
    ),
  fb_page_link: z
    .string()
    .min(1, 'Facebook Page এর লিংক দিতে হবে')
    .refine(
      (url) => /^(https?:\/\/)?(www\.|web\.|m\.)?(facebook\.com|fb\.com|fb\.me)\/.+/.test(url),
      'সঠিক Facebook Page লিংক দিন (https://facebook.com/yourpage)',
    ),
  whatsapp_number: z
    .string()
    .refine(
      (val) => val === '' || /^01\d{9}$/.test(val),
      'সঠিক ১১ সংখ্যার নম্বর দিন (01 দিয়ে শুরু)',
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
