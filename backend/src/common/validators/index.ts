import { z } from 'zod';

export const profileCompletionSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  shop_name: z
    .string()
    .min(2, 'Shop name must be at least 2 characters')
    .max(100, 'Shop name must be at most 100 characters'),
  fb_page_link: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (url) => url.includes('facebook.com') || url.includes('fb.com'),
      'Must be a valid Facebook page link',
    ),
  whatsapp_number: z
    .string()
    .refine(
      (val) => val === '' || /^01\d{9}$/.test(val),
      'সঠিক ১১ সংখ্যার নম্বর দিন (01 দিয়ে শুরু)',
    ),
});

export const offerCreationSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(60, 'Title must be at most 60 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be at most 1000 characters'),
    category: z.enum([
      'Fashion',
      'Gadget',
      'Electronics',
      'Beauty',
      'Food',
      'Home & Living',
      'Baby & Kids',
      'Health & Fitness',
      'Books & Stationery',
      'Sports & Outdoor',
      'Grocery',
      'Jewelry & Accessories',
      'Bags & Luggage',
      'Automotive',
      'Pet Supplies',
      'Art & Craft',
      'Services',
      'Others',
    ]),
    regular_price: z.number().positive('Regular price must be positive'),
    offer_price: z.number().positive('Offer price must be positive'),
    target_link: z.string().url('Target link must be a valid URL'),
    image_urls: z.array(z.string()).max(3, 'Maximum 3 images allowed').optional().default([]),
  })
  .refine(
    (data) => {
      const discount =
        ((data.regular_price - data.offer_price) / data.regular_price) * 100;
      return discount >= 15;
    },
    {
      message: 'Minimum 15% discount is required to list an offer.',
      path: ['offer_price'],
    },
  );

export const transactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(50, 'Minimum top-up amount is 50 BDT'),
  bkash_trx_id: z
    .string()
    .min(5, 'Invalid bKash transaction ID')
    .max(30, 'Invalid bKash transaction ID'),
});
