# Offer HUB

**বাংলাদেশের প্রথম F-Commerce ডিসকাউন্ট মার্কেটপ্লেস**

A credit-based marketplace where F-commerce sellers post discount offers and customers browse deals — all in one place.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.1, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI |
| Backend | NestJS 11, TypeScript, Passport JWT |
| Database | PostgreSQL 17 |
| Storage | Local file system (uploads/) |
| Payment | bKash (manual top-up) |

---

## Project Structure

```
offer-hub/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/            # Signup, Login (phone/email), JWT
│   │   ├── profile/         # Seller profile management
│   │   ├── offers/          # CRUD, trending, view tracking
│   │   ├── transactions/    # bKash credit top-up
│   │   ├── admin/           # Offer/transaction approval, sellers list
│   │   ├── banners/         # Homepage banner management
│   │   ├── upload/          # Image upload (max 3, 1MB each)
│   │   ├── database/        # PostgreSQL connection pool
│   │   └── common/          # Zod validators
│   └── sql/                 # Database migration
├── frontend/                # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Login, Signup, Complete Profile
│   │   │   ├── (main)/      # Home, Dashboard, Offers, Seller page
│   │   │   └── (admin)/     # Admin panel (all routes)
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom hooks (useProfile, useCredits)
│   │   ├── lib/             # API client, validators, types, utils
│   │   └── public/          # Static assets, category images
│   └── .env.local           # Frontend env (not committed)
├── docker-compose.yml       # pgAdmin (optional)
└── .gitignore
```

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** 17 (via Homebrew or Docker)
- **npm** (package manager)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/jobayer109/offer-hub.git
cd offer-hub
```

### 2. Setup Database

**Install PostgreSQL (macOS):**
```bash
brew install postgresql@17
brew services start postgresql@17
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
```

**Create database and run migrations:**
```bash
createdb offer_hub
psql -U $(whoami) -d offer_hub -f backend/sql/001_initial_schema.sql
```

### 3. Setup Backend

```bash
cd backend
npm install
```

**Create `.env` file:**
```env
PORT=5000
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/offer_hub
JWT_SECRET=your-secret-key-change-this
FRONTEND_URL=http://localhost:3000
```

**Start the server:**
```bash
npm run start:dev
```

Server runs at `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
npm install
```

**Create `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the dev server:**
```bash
npm run dev
```

App runs at `http://localhost:3000`

### 5. Create Admin Account

```bash
# Signup via API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR_PHONE","password":"YOUR_PASSWORD"}'

# OR signup via email for admin
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YOUR_PASSWORD"}'

# Set as admin in database
psql -d offer_hub -c "
  INSERT INTO profiles (id, shop_name, fb_page_link, whatsapp_number, credits_balance, is_admin)
  SELECT id, 'Admin', 'https://facebook.com/admin', '', 0, TRUE
  FROM users WHERE email = 'admin@example.com';
"
```

### 6. (Optional) pgAdmin via Docker

```bash
docker compose -p offer-hub up -d
```

pgAdmin: `http://localhost:5050` (admin@admin.com / admin)

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register (phone + password) |
| POST | `/api/auth/login` | Login (phone/email + password) |

### Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | JWT | Get profile |
| PUT | `/api/profile/complete` | JWT | Complete profile (gives 5 free credits) |

### Offers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/offers` | - | List active offers |
| GET | `/api/offers/trending` | - | Trending offers |
| GET | `/api/offers/seller/:id` | - | Seller's offers |
| GET | `/api/offers/:id` | - | Offer details |
| PUT | `/api/offers/:id/view` | - | Increment view count |
| POST | `/api/offers` | JWT | Create offer |
| PUT | `/api/offers/:id` | JWT | Edit offer |
| GET | `/api/offers/my` | JWT | My offers |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/transactions/top-up` | JWT | Submit bKash top-up |
| GET | `/api/transactions/my` | JWT | My transactions |

### Banners
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/banners` | - | Active banners |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/sellers` | Admin | All sellers |
| GET | `/api/admin/offers/pending` | Admin | Pending offers |
| PUT | `/api/admin/offers/:id/approve` | Admin | Approve offer (-1 credit) |
| PUT | `/api/admin/offers/:id/reject` | Admin | Reject offer |
| GET | `/api/admin/offers/:id/history` | Admin | Edit history |
| GET | `/api/admin/transactions/pending` | Admin | Pending transactions |
| PUT | `/api/admin/transactions/:id/approve` | Admin | Approve transaction |
| GET | `/api/admin/banners` | Admin | All banners |
| POST | `/api/admin/banners` | Admin | Create banner |
| PUT | `/api/admin/banners/:id` | Admin | Edit banner |
| PUT | `/api/admin/banners/:id/toggle` | Admin | Toggle banner |
| DELETE | `/api/admin/banners/:id` | Admin | Delete banner |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload/image` | JWT | Single image |
| POST | `/api/upload/images` | JWT | Multiple images (max 3) |

---

## Business Logic

### Credit System
- Signup bonus: **5 free credits**
- Credit price: **50 BDT = 1 credit** (via bKash)
- Offer post: **1 credit** (deducted on admin approval)
- Offer edit: **free** (re-approval needed)
- Offer duration: **7 days** (auto-expires)

### Offer Rules
- Minimum **15% discount** required
- Admin must approve before going live
- **Honesty dialog** on submission
- **View tracking** (unique per session)
- **Edit history** tracked for admin review

### Trending Algorithm
```
score = (views / offer_age_hours) + (discount_pct * 0.2)
```
- View velocity (views per hour) — newer popular offers rank higher
- Discount bonus capped at 50% — prevents manipulation

---

## User Roles

| Role | Can Do |
|------|--------|
| **Customer** (no login) | Browse offers, view details, contact seller via WhatsApp/Facebook |
| **Seller** (login required) | Post offers, manage dashboard, buy credits, edit offers |
| **Admin** (is_admin=true) | Approve/reject offers & transactions, manage banners & sellers |

---

## Key Features

- Mobile-first responsive design (95% mobile users)
- Gamified profile completion (step-by-step with animation)
- Real-time countdown on offers (< 1hr: per second)
- 18 product categories
- Banner carousel (admin-managed)
- Seller modal on offer details
- Image zoom on hover (desktop)
- Native share (mobile) / clipboard copy (desktop)
- Bangla + English bilingual UI
- bKash payment integration
- Edit history with diff view (admin)

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://username@localhost:5432/offer_hub
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## License

MIT
