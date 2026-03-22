export type OfferCategory = 'Fashion' | 'Gadget' | 'Electronics' | 'Beauty' | 'Food' | 'Home & Living' | 'Baby & Kids' | 'Health & Fitness' | 'Books & Stationery' | 'Sports & Outdoor' | 'Grocery' | 'Jewelry & Accessories' | 'Bags & Luggage' | 'Automotive' | 'Pet Supplies' | 'Art & Craft' | 'Services' | 'Others';
export type OfferStatus = 'pending' | 'active' | 'rejected' | 'expired';
export type TransactionStatus = 'pending' | 'success';

export type Profile = {
  id: string;
  shop_name: string;
  fb_page_link: string;
  whatsapp_number: string;
  credits_balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Offer = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: OfferCategory;
  regular_price: number;
  offer_price: number;
  discount_pct: number;
  image_urls: string[];
  target_link: string;
  view_count: number;
  status: OfferStatus;
  created_at: string;
  expires_at: string;
  shop_name?: string;
  fb_page_link?: string;
  whatsapp_number?: string;
};

export type OfferEditHistory = {
  id: string;
  offer_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  edited_at: string;
};

export type Transaction = {
  id: string;
  seller_id: string;
  amount: number;
  bkash_trx_id: string;
  credits_added: number;
  status: TransactionStatus;
  created_at: string;
  shop_name?: string;
};
