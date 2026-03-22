export const categories = [
  { value: 'all', label: 'সব অফার', labelShort: 'সব', emoji: '🛍️', color: 'from-orange-500 to-red-500' },
  { value: 'Fashion', label: 'ফ্যাশন', labelShort: 'ফ্যাশন', emoji: '👗', color: 'from-pink-500 to-purple-500' },
  { value: 'Gadget', label: 'গ্যাজেট', labelShort: 'গ্যাজেট', emoji: '📱', color: 'from-blue-500 to-cyan-500' },
  { value: 'Electronics', label: 'ইলেকট্রনিক্স', labelShort: 'ইলেকট্রনিক্স', emoji: '💻', color: 'from-indigo-500 to-blue-500' },
  { value: 'Beauty', label: 'বিউটি', labelShort: 'বিউটি', emoji: '💄', color: 'from-rose-500 to-pink-500' },
  { value: 'Food', label: 'খাবার', labelShort: 'খাবার', emoji: '🍔', color: 'from-amber-500 to-orange-500' },
  { value: 'Home & Living', label: 'হোম ও লিভিং', labelShort: 'হোম', emoji: '🏠', color: 'from-teal-500 to-emerald-500' },
  { value: 'Baby & Kids', label: 'বেবি ও কিডস', labelShort: 'বেবি', emoji: '👶', color: 'from-sky-500 to-blue-400' },
  { value: 'Health & Fitness', label: 'হেলথ ও ফিটনেস', labelShort: 'হেলথ', emoji: '💪', color: 'from-green-500 to-emerald-500' },
  { value: 'Books & Stationery', label: 'বই ও স্টেশনারি', labelShort: 'বই', emoji: '📚', color: 'from-yellow-600 to-amber-500' },
  { value: 'Sports & Outdoor', label: 'স্পোর্টস ও আউটডোর', labelShort: 'স্পোর্টস', emoji: '⚽', color: 'from-lime-500 to-green-500' },
  { value: 'Grocery', label: 'গ্রোসারি', labelShort: 'গ্রোসারি', emoji: '🛒', color: 'from-emerald-500 to-teal-500' },
  { value: 'Jewelry & Accessories', label: 'জুয়েলারি ও এক্সেসরিজ', labelShort: 'জুয়েলারি', emoji: '💍', color: 'from-fuchsia-500 to-pink-500' },
  { value: 'Bags & Luggage', label: 'ব্যাগ ও লাগেজ', labelShort: 'ব্যাগ', emoji: '👜', color: 'from-violet-500 to-purple-500' },
  { value: 'Automotive', label: 'অটোমোটিভ', labelShort: 'অটো', emoji: '🚗', color: 'from-red-500 to-rose-500' },
  { value: 'Pet Supplies', label: 'পেট সাপ্লাই', labelShort: 'পেট', emoji: '🐾', color: 'from-orange-500 to-amber-500' },
  { value: 'Art & Craft', label: 'আর্ট ও ক্রাফট', labelShort: 'আর্ট', emoji: '🎨', color: 'from-purple-500 to-indigo-500' },
  { value: 'Services', label: 'সার্ভিস', labelShort: 'সার্ভিস', emoji: '🔧', color: 'from-cyan-500 to-blue-500' },
  { value: 'Others', label: 'অন্যান্য', labelShort: 'অন্যান্য', emoji: '📦', color: 'from-slate-500 to-gray-500' },
] as const;

// Without "all" - for forms
export const offerCategories = categories.filter((c) => c.value !== 'all');
