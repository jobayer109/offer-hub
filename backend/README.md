# Offer-HUB Backend (NestJS)

## Tech Stack
- **Framework:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL 17 (via `pg` driver)
- **Auth:** JWT + bcrypt + Passport
- **Validation:** Zod
- **File Upload:** Multer (local storage)

## Setup

```bash
npm install
npm run start:dev    # http://localhost:5000
```

**Environment (.env):**
```
PORT=5000
DATABASE_URL=postgresql://jobayer@localhost:5432/offer_hub
JWT_SECRET=offer-hub-secret-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

**Database Migration:**
```bash
psql -U jobayer -d offer_hub -f sql/001_initial_schema.sql
```

---

## Module Structure

```
src/
├── main.ts                  # App bootstrap, CORS, static files, global prefix /api
├── app.module.ts            # Root module — imports all feature modules
├── database/
│   └── database.module.ts   # Global pg Pool provider
├── auth/
│   ├── auth.module.ts       # JWT + Passport config
│   ├── auth.controller.ts   # POST /signup, /login, /logout
│   ├── auth.service.ts      # bcrypt hash/compare, JWT sign
│   ├── strategies/
│   │   └── jwt.strategy.ts  # Passport JWT strategy (Bearer token)
│   └── guards/
│       ├── jwt-auth.guard.ts   # Protects authenticated routes
│       └── admin.guard.ts      # Checks profiles.is_admin = true
├── profile/
│   ├── profile.module.ts
│   ├── profile.controller.ts   # GET /, PUT /complete
│   └── profile.service.ts      # Profile CRUD, 5 bonus credits on create
├── offers/
│   ├── offers.module.ts
│   ├── offers.controller.ts    # GET /, GET /my, GET /:id, POST /
│   └── offers.service.ts       # Offer CRUD, credit check, 15% discount validation
├── transactions/
│   ├── transactions.module.ts
│   ├── transactions.controller.ts  # POST /top-up, GET /my
│   └── transactions.service.ts     # bKash top-up, duplicate TrxID check (23505)
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts    # GET /offers/pending, PUT /offers/:id/approve|reject
│   └── admin.service.ts       # Atomic approve via PostgreSQL stored procedures
├── upload/
│   ├── upload.module.ts
│   ├── upload.controller.ts   # POST /image (multer, memory storage)
│   └── upload.service.ts      # Save to /uploads/offers/, 2MB limit, JPEG/PNG/WebP/GIF
└── common/
    └── validators/
        └── index.ts           # Zod schemas: profile, offer (15% min discount), transaction
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register — returns JWT token |
| POST | `/api/auth/login` | Login — returns JWT token + `hasProfile` flag |
| POST | `/api/auth/logout` | Logout (stateless, client discards token) |

### Profile (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user's profile |
| PUT | `/api/profile/complete` | Create/update profile (grants 5 credits on first create) |

### Offers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/offers` | Public | List active offers (supports `?category=&page=&limit=`) |
| GET | `/api/offers/:id` | Public | Get single offer with seller info |
| GET | `/api/offers/my` | JWT | Get current seller's offers |
| POST | `/api/offers` | JWT | Submit offer (requires 1+ credit, 15% min discount) |

### Transactions (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/top-up` | Submit bKash top-up request (1 credit per 50 BDT) |
| GET | `/api/transactions/my` | Get current user's transactions |

### Admin (JWT + Admin Guard)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/offers/pending` | List pending offers |
| PUT | `/api/admin/offers/:id/approve` | Approve offer (atomic: status→active + deduct 1 credit) |
| PUT | `/api/admin/offers/:id/reject` | Reject offer |
| GET | `/api/admin/transactions/pending` | List pending transactions |
| PUT | `/api/admin/transactions/:id/approve` | Approve transaction (atomic: status→success + add credits) |

### Upload (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload image (field: `image`, max 2MB) |

---

## Database Schema

### Tables
- **users** — `id (UUID PK)`, `email (unique)`, `password_hash`
- **profiles** — `id (FK→users)`, `shop_name (unique)`, `fb_page_link`, `whatsapp_number`, `credits_balance (default 5)`, `is_admin`
- **offers** — `seller_id (FK→profiles)`, `title`, `description`, `category (enum)`, `regular_price`, `offer_price`, `discount_pct (generated)`, `image_url`, `target_link`, `status (enum)`, `expires_at (default +7 days)`
- **transactions** — `seller_id (FK→profiles)`, `amount`, `bkash_trx_id (unique)`, `credits_added`, `status (enum)`
- **clicks_log** — `offer_id (FK→offers)`, `user_agent`, `ip_address`

### Enums
- `offer_category`: Fashion, Gadget, Electronics, Beauty, Food, Others
- `offer_status`: pending, active, rejected, expired
- `transaction_status`: pending, success

### Stored Procedures (Atomic Operations)
- `approve_offer(offer_id)` — Approve + deduct 1 credit (both or none)
- `approve_transaction(transaction_id, credits)` — Approve + add credits
- `expire_old_offers()` — Auto-expire past due offers

---

## Key Business Rules
1. **Profile required** — User must complete profile before posting offers
2. **5 free credits** — Granted on first profile creation
3. **15% minimum discount** — Offers with < 15% discount are rejected by Zod validation
4. **1 credit per offer** — Deducted on admin approval (not on submission)
5. **Duplicate bKash TrxID** — PostgreSQL unique constraint (error code 23505)
6. **Image upload** — Max 2MB, JPEG/PNG/WebP/GIF only, saved to `/uploads/offers/`
7. **Offer expiry** — Default 7 days from creation
