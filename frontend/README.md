# Offer-HUB Frontend (Next.js)

## Tech Stack
- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **UI:** Shadcn/UI + Radix UI + Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Theming:** next-themes

## Setup

```bash
npm install
npm run dev    # http://localhost:3000
```

**Environment (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme, Toaster)
│   ├── page.tsx                # Landing/redirect page
│   ├── globals.css             # Tailwind + global styles
│   │
│   ├── (auth)/                 # Auth route group (no navbar)
│   │   ├── layout.tsx          # Auth layout (centered, minimal)
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   └── complete-profile/page.tsx  # Profile completion (required after signup)
│   │
│   ├── (main)/                 # Main app route group (with navbar)
│   │   ├── layout.tsx          # Main layout (navbar + footer)
│   │   ├── page.tsx            # Home — marketplace with category tabs
│   │   ├── offers/
│   │   │   ├── new/page.tsx    # New offer form (with honesty dialog)
│   │   │   └── [id]/page.tsx   # Offer detail page
│   │   └── dashboard/
│   │       ├── page.tsx        # Seller dashboard (credits, my offers)
│   │       └── top-up/page.tsx # bKash top-up form
│   │
│   └── (admin)/                # Admin route group
│       └── admin/
│           ├── layout.tsx      # Admin layout (sidebar/nav)
│           ├── page.tsx        # Admin dashboard
│           ├── offers/page.tsx        # Pending offers review
│           └── transactions/page.tsx  # Pending transactions review
│
├── components/
│   ├── ui/                     # Shadcn/UI components (DO NOT EDIT MANUALLY)
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sonner.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/
│   │   ├── navbar.tsx          # Top navigation bar
│   │   └── footer.tsx          # Footer
│   │
│   ├── offers/
│   │   ├── offer-card.tsx      # Offer card (image, price, discount badge, expiry)
│   │   ├── offer-form.tsx      # New offer form (15% discount validation)
│   │   ├── category-tabs.tsx   # Category filter tabs
│   │   └── honesty-dialog.tsx  # AlertDialog warning before offer submission
│   │
│   ├── dashboard/
│   │   ├── credits-display.tsx # Show current credit balance
│   │   └── top-up-form.tsx     # bKash transaction ID form
│   │
│   ├── admin/
│   │   ├── offer-review-card.tsx       # Admin: approve/reject offer
│   │   └── transaction-review-card.tsx # Admin: approve transaction
│   │
│   └── profile/
│       └── profile-form.tsx    # Profile completion form (shop name, FB link, WhatsApp)
│
├── hooks/
│   ├── use-profile.ts          # Fetch & cache current user profile
│   └── use-credits.ts          # Fetch & display credit balance
│
└── lib/
    ├── utils.ts                # cn() helper for Tailwind class merging
    ├── api/
    │   ├── client.ts           # api() and apiFormData() — fetch wrapper for backend
    │   └── auth.ts             # getToken(), setAuth(), clearAuth() — localStorage JWT
    ├── validators/
    │   ├── profile.ts          # Zod schema for profile form
    │   └── offer.ts            # Zod schema for offer form
    └── types/
        └── database.ts         # TypeScript types: Profile, Offer, Transaction
```

---

## Pages & Features

### Auth Pages
| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Login | `/login` | Placeholder | Email + password login → stores JWT in localStorage |
| Signup | `/signup` | Placeholder | Email + password signup → redirect to `/complete-profile` |
| Complete Profile | `/complete-profile` | Placeholder | Shop name, FB link, WhatsApp → grants 5 credits |

### Main Pages
| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Home | `/` | Placeholder | Marketplace: active offers grid with category tabs |
| New Offer | `/offers/new` | Placeholder | Offer form with 15% discount check + honesty dialog |
| Offer Detail | `/offers/[id]` | Placeholder | Full offer view with seller info + redirect link |
| Dashboard | `/dashboard` | Placeholder | Credit balance + my offers list |
| Top-up | `/dashboard/top-up` | Placeholder | bKash TrxID form to request credit top-up |

### Admin Pages
| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Admin Home | `/admin` | Placeholder | Overview stats |
| Pending Offers | `/admin/offers` | Placeholder | Approve/reject pending offers |
| Pending Transactions | `/admin/transactions` | Placeholder | Approve pending bKash top-ups |

---

## API Integration (via `lib/api/client.ts`)

```typescript
import { api } from '@/lib/api/client';
import { getToken } from '@/lib/api/auth';

// Public
const { offers } = await api('/offers?category=Fashion');

// Authenticated
const token = getToken();
const { profile } = await api('/profile', { token });
await api('/offers', { method: 'POST', token, body: JSON.stringify(data) });
```

---

## Key UI/UX Rules (from PRD)
1. **Profile gate** — If logged in but no profile → redirect to `/complete-profile`
2. **Credit check** — Disable "Post Offer" button if credits < 1, show tooltip
3. **15% discount** — Real-time validation: if discount < 15%, form is invalid
4. **Honesty dialog** — AlertDialog intercepts submit: "Price manipulation leads to ban"
5. **Expiry badge** — Show "Expiring in X days" if `expires_at` within 48 hours
6. **Empty state** — Illustration when no offers in a category
7. **Mobile-first** — All layouts responsive, optimized for mobile
8. **Image validation** — Client-side reject files > 2MB before upload
