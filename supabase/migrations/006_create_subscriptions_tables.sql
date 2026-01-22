-- Subscription Management System for Users and Businesses
-- Supports both creator portal (users) and business portal (client_organizations)

-- ============================================
-- SUBSCRIPTION PLANS (Master Configuration)
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL UNIQUE, -- creator_free, creator_pro, creator_enterprise, business_starter, business_pro, business_enterprise
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- user, business
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2), -- Annual billing option
  currency TEXT DEFAULT 'USD',
  
  -- Quotas & Limits
  monthly_verifications INTEGER NOT NULL,
  api_rate_limit INTEGER DEFAULT 100, -- Requests per minute
  max_audio_size_mb INTEGER DEFAULT 50,
  max_team_members INTEGER, -- NULL = unlimited
  storage_gb INTEGER DEFAULT 10,
  
  -- Features (JSON for flexibility)
  features JSONB DEFAULT '{}', -- {"watermarking": true, "batch_upload": true, "priority_support": false}
  
  -- Stripe Integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER SUBSCRIPTIONS (Creators/Artists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  
  -- Subscription Status
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, canceled, incomplete, trialing
  
  -- Billing Details
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  
  -- Payment Method
  payment_method_id TEXT, -- Stripe payment method ID
  card_brand TEXT, -- visa, mastercard, amex
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Usage Tracking
  usage_verifications INTEGER DEFAULT 0,
  usage_reset_date DATE,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id) -- One active subscription per user
);

-- ============================================
-- BUSINESS SUBSCRIPTIONS (Organizations)
-- ============================================

CREATE TABLE IF NOT EXISTS public.business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  
  -- Subscription Status
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Billing Details
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  billing_cycle TEXT DEFAULT 'monthly',
  
  -- Payment Method
  payment_method_id TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  billing_email TEXT,
  
  -- Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Usage Tracking
  usage_verifications INTEGER DEFAULT 0,
  usage_reset_date DATE,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- ============================================
-- PAYMENT HISTORY (Invoices & Receipts)
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to user OR business
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  subscription_id UUID, -- References user_subscriptions or business_subscriptions
  
  -- Transaction Details
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- succeeded, pending, failed, refunded
  
  -- Payment Method Used
  payment_method_type TEXT, -- card, bank_transfer
  card_brand TEXT,
  card_last4 TEXT,
  
  -- Metadata
  description TEXT,
  invoice_url TEXT, -- Stripe hosted invoice
  receipt_url TEXT, -- Stripe receipt
  metadata JSONB,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USAGE TRACKING (Detailed Analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_records (
  id BIGSERIAL PRIMARY KEY,
  
  -- Link to user OR business
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Usage Type
  usage_type TEXT NOT NULL, -- verification, api_call, storage_upload
  quantity INTEGER DEFAULT 1,
  
  -- Context
  audio_file_id UUID,
  api_endpoint TEXT,
  metadata JSONB,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  billing_period DATE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Subscription Plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON public.subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);

-- User Subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);

-- Business Subscriptions
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_org ON public.business_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_status ON public.business_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_stripe_customer ON public.business_subscriptions(stripe_customer_id);

-- Payment Transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_org ON public.payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON public.payment_transactions(created_at);

-- Usage Records
CREATE INDEX IF NOT EXISTS idx_usage_records_user ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_org ON public.usage_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_period ON public.usage_records(billing_period);
CREATE INDEX IF NOT EXISTS idx_usage_records_type ON public.usage_records(usage_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SEED DEFAULT PLANS
-- ============================================

-- Creator Plans
INSERT INTO public.subscription_plans (plan_code, plan_name, plan_type, description, price_monthly, price_yearly, monthly_verifications, features, is_popular, sort_order)
VALUES
  ('creator_free', 'Free', 'user', 'Perfect for trying out Fusion', 0.00, 0.00, 10, '{"watermarking": false, "batch_upload": false, "priority_support": false, "api_access": false}', false, 1),
  ('creator_pro', 'Pro', 'user', 'For serious creators and artists', 29.00, 290.00, 500, '{"watermarking": true, "batch_upload": true, "priority_support": true, "api_access": true, "advanced_analytics": true}', true, 2),
  ('creator_enterprise', 'Enterprise', 'user', 'Unlimited power for professionals', 99.00, 990.00, 5000, '{"watermarking": true, "batch_upload": true, "priority_support": true, "api_access": true, "advanced_analytics": true, "custom_integration": true, "dedicated_support": true}', false, 3)
ON CONFLICT (plan_code) DO NOTHING;

-- Business Plans
INSERT INTO public.subscription_plans (plan_code, plan_name, plan_type, description, price_monthly, price_yearly, monthly_verifications, max_team_members, features, is_popular, sort_order)
VALUES
  ('business_starter', 'Starter', 'business', 'For small teams getting started', 99.00, 990.00, 1000, 5, '{"api_access": true, "webhooks": true, "team_management": true, "analytics_dashboard": true}', false, 1),
  ('business_pro', 'Professional', 'business', 'For growing businesses', 299.00, 2990.00, 10000, 25, '{"api_access": true, "webhooks": true, "team_management": true, "analytics_dashboard": true, "priority_support": true, "sla_99_9": true, "custom_branding": true}', true, 2),
  ('business_enterprise', 'Enterprise', 'business', 'Custom solutions at scale', 999.00, 9990.00, 100000, NULL, '{"api_access": true, "webhooks": true, "team_management": true, "analytics_dashboard": true, "priority_support": true, "sla_99_9": true, "custom_branding": true, "dedicated_support": true, "custom_integration": true, "volume_discounts": true}', false, 3)
ON CONFLICT (plan_code) DO NOTHING;
