import { z } from 'zod';

export const offerSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(60, 'Title can not exceed 60 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description can not exceed 1000 characters'),
    category: z.enum([
      'Fashion', 'Gadget', 'Electronics', 'Beauty', 'Food',
      'Home & Living', 'Baby & Kids', 'Health & Fitness', 'Books & Stationery',
      'Sports & Outdoor', 'Grocery', 'Jewelry & Accessories', 'Bags & Luggage',
      'Automotive', 'Pet Supplies', 'Art & Craft', 'Services', 'Others',
    ], {
      message: 'Please select a category',
    }),
    regular_price: z.number({ message: 'Please enter the regular price' }).positive('Price must be greater than 0'),
    offer_price: z.number({ message: 'Please enter the offer price' }).positive('Price must be greater than 0'),
    target_link: z
      .string()
      .min(1, 'Please enter your Facebook page or post link')
      .refine(
        (url) => /^(https?:\/\/)?(www\.|web\.|m\.)?(facebook\.com|fb\.com|fb\.me|m\.me)\/.+/.test(url),
        'Please enter a valid Facebook link (facebook.com/your-post)',
      ),
  })
  .refine(
    (data) => {
      const discount = ((data.regular_price - data.offer_price) / data.regular_price) * 100;
      return discount >= 15;
    },
    {
      message: 'Minimum 15% discount is required to list an offer',
      path: ['offer_price'],
    },
  );

export type OfferFormValues = z.infer<typeof offerSchema>;
