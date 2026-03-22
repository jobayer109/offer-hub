-- ============================================
-- Offer-HUB V1 - Database Schema (Plain PostgreSQL)
-- ============================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
CREATE TYPE offer_category AS ENUM (
  'Fashion', 'Gadget', 'Electronics', 'Beauty', 'Food',
  'Home & Living', 'Baby & Kids', 'Health & Fitness', 'Books & Stationery',
  'Sports & Outdoor', 'Grocery', 'Jewelry & Accessories', 'Bags & Luggage',
  'Automotive', 'Pet Supplies', 'Art & Craft', 'Services', 'Others'
);
CREATE TYPE offer_status AS ENUM ('pending', 'active', 'rejected', 'expired');
CREATE TYPE transaction_status AS ENUM ('pending', 'success');

-- 3. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  shop_name TEXT UNIQUE NOT NULL,
  fb_page_link TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL DEFAULT '',
  credits_balance INTEGER NOT NULL DEFAULT 5 CHECK (credits_balance >= 0),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. OFFERS TABLE
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL,
  description TEXT CHECK (char_length(description) <= 1000),
  category offer_category NOT NULL,
  regular_price NUMERIC NOT NULL CHECK (regular_price > 0),
  offer_price NUMERIC NOT NULL CHECK (offer_price > 0),
  discount_pct NUMERIC GENERATED ALWAYS AS (
    ROUND(((regular_price - offer_price) / regular_price) * 100, 2)
  ) STORED,
  image_urls TEXT[] DEFAULT '{}',
  target_link TEXT NOT NULL,
  status offer_status NOT NULL DEFAULT 'pending',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

ALTER TABLE offers ADD CONSTRAINT chk_price_valid CHECK (offer_price < regular_price);
ALTER TABLE offers ADD CONSTRAINT chk_min_discount CHECK (
  ((regular_price - offer_price) / regular_price) * 100 >= 15
);

-- 6. TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  bkash_trx_id TEXT NOT NULL,
  credits_added INTEGER NOT NULL DEFAULT 0,
  status transaction_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_transactions_bkash_trx_id ON transactions(bkash_trx_id);

-- 7. CLICKS LOG TABLE
CREATE TABLE clicks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- 8. OFFER EDIT HISTORY TABLE
CREATE TABLE offer_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BANNERS TABLE
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INDEXES
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_category ON offers(category);
CREATE INDEX idx_offers_seller_id ON offers(seller_id);
CREATE INDEX idx_offers_expires_at ON offers(expires_at);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- 11. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 12. STORED PROCEDURE: ATOMIC OFFER APPROVAL
CREATE OR REPLACE FUNCTION approve_offer(p_offer_id UUID)
RETURNS VOID AS $$
DECLARE
  v_seller_id UUID;
  v_credits INTEGER;
BEGIN
  SELECT seller_id INTO v_seller_id
  FROM offers WHERE id = p_offer_id AND status = 'pending';

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Offer not found or not in pending status';
  END IF;

  SELECT credits_balance INTO v_credits
  FROM profiles WHERE id = v_seller_id;

  IF v_credits < 1 THEN
    RAISE EXCEPTION 'Seller has insufficient credits';
  END IF;

  UPDATE offers SET status = 'active' WHERE id = p_offer_id;
  UPDATE profiles SET credits_balance = credits_balance - 1 WHERE id = v_seller_id;
END;
$$ LANGUAGE plpgsql;

-- 13. STORED PROCEDURE: ATOMIC TRANSACTION APPROVAL
CREATE OR REPLACE FUNCTION approve_transaction(p_transaction_id UUID, p_credits INTEGER)
RETURNS VOID AS $$
DECLARE
  v_seller_id UUID;
BEGIN
  SELECT seller_id INTO v_seller_id
  FROM transactions WHERE id = p_transaction_id AND status = 'pending';

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or not in pending status';
  END IF;

  UPDATE transactions SET status = 'success' WHERE id = p_transaction_id;
  UPDATE profiles SET credits_balance = credits_balance + p_credits WHERE id = v_seller_id;
END;
$$ LANGUAGE plpgsql;

-- 14. STORED PROCEDURE: AUTO-EXPIRE OFFERS
CREATE OR REPLACE FUNCTION expire_old_offers()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE offers SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
