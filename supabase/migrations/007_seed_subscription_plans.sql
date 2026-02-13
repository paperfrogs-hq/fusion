-- Seed subscription plans for individual users
-- This ensures the plans exist for the billing system to reference

-- Insert Creator plan
INSERT INTO public.subscription_plans (
  plan_code,
  plan_name,
  plan_type,
  description,
  price_monthly,
  price_yearly,
  currency,
  monthly_verifications,
  api_rate_limit,
  max_audio_size_mb,
  storage_gb,
  features,
  is_active,
  is_popular,
  sort_order
) VALUES (
  'user_creator',
  'Creator',
  'user',
  'Perfect for content creators and podcasters',
  9.00,
  90.00,
  'USD',
  100,
  60,
  50,
  5,
  '{"audio_fingerprinting": true, "advanced_verification": true, "personal_dashboard": true, "audio_library": true, "verification_certificates": true, "email_support": true, "export_reports": true}'::jsonb,
  true,
  false,
  1
) ON CONFLICT (plan_code) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  monthly_verifications = EXCLUDED.monthly_verifications,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert Professional plan
INSERT INTO public.subscription_plans (
  plan_code,
  plan_name,
  plan_type,
  description,
  price_monthly,
  price_yearly,
  currency,
  monthly_verifications,
  api_rate_limit,
  max_audio_size_mb,
  storage_gb,
  features,
  is_active,
  is_popular,
  sort_order
) VALUES (
  'user_professional',
  'Professional',
  'user',
  'For professionals requiring extensive verification',
  29.00,
  290.00,
  'USD',
  500,
  120,
  100,
  20,
  '{"audio_fingerprinting": true, "advanced_verification": true, "personal_dashboard": true, "unlimited_audio_library": true, "verification_certificates": true, "priority_support": true, "export_reports": true, "bulk_verification": true, "api_access": true, "tamper_detection_alerts": true}'::jsonb,
  true,
  true,
  2
) ON CONFLICT (plan_code) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  monthly_verifications = EXCLUDED.monthly_verifications,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- Insert Enterprise Starter plan (for businesses)
INSERT INTO public.subscription_plans (
  plan_code,
  plan_name,
  plan_type,
  description,
  price_monthly,
  price_yearly,
  currency,
  monthly_verifications,
  api_rate_limit,
  max_audio_size_mb,
  max_team_members,
  storage_gb,
  features,
  is_active,
  is_popular,
  sort_order
) VALUES (
  'enterprise_starter',
  'Starter',
  'business',
  'For small teams getting started',
  99.00,
  990.00,
  'USD',
  1000,
  100,
  100,
  5,
  25,
  '{"api_access": true, "team_management": true, "analytics_dashboard": true, "webhooks": true, "email_support": true}'::jsonb,
  true,
  false,
  10
) ON CONFLICT (plan_code) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  monthly_verifications = EXCLUDED.monthly_verifications,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert Enterprise Pro plan
INSERT INTO public.subscription_plans (
  plan_code,
  plan_name,
  plan_type,
  description,
  price_monthly,
  price_yearly,
  currency,
  monthly_verifications,
  api_rate_limit,
  max_audio_size_mb,
  max_team_members,
  storage_gb,
  features,
  is_active,
  is_popular,
  sort_order
) VALUES (
  'enterprise_pro',
  'Pro',
  'business',
  'For growing businesses with advanced needs',
  249.00,
  2490.00,
  'USD',
  5000,
  500,
  200,
  20,
  100,
  '{"api_access": true, "team_management": true, "advanced_analytics": true, "webhooks": true, "priority_support": true, "custom_branding": true, "sla_guarantee": true}'::jsonb,
  true,
  true,
  11
) ON CONFLICT (plan_code) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  monthly_verifications = EXCLUDED.monthly_verifications,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- Insert Enterprise plan
INSERT INTO public.subscription_plans (
  plan_code,
  plan_name,
  plan_type,
  description,
  price_monthly,
  price_yearly,
  currency,
  monthly_verifications,
  api_rate_limit,
  max_audio_size_mb,
  max_team_members,
  storage_gb,
  features,
  is_active,
  is_popular,
  sort_order
) VALUES (
  'enterprise_enterprise',
  'Enterprise',
  'business',
  'For large organizations requiring custom solutions',
  599.00,
  5990.00,
  'USD',
  25000,
  1000,
  500,
  NULL, -- Unlimited
  500,
  '{"api_access": true, "team_management": true, "advanced_analytics": true, "webhooks": true, "priority_support": true, "custom_branding": true, "sla_guarantee": true, "dedicated_infrastructure": true, "custom_integrations": true, "on_premise_option": true}'::jsonb,
  true,
  false,
  12
) ON CONFLICT (plan_code) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  monthly_verifications = EXCLUDED.monthly_verifications,
  features = EXCLUDED.features,
  updated_at = NOW();
