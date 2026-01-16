-- Fusion Client Portal - Enterprise B2B Database Schema
-- Professional client portal for organizations, teams, and API management
-- Created: January 16, 2026

-- ============================================
-- CLIENT PORTAL SYSTEM (Enterprise B2B)
-- ============================================

-- Organizations (B2B clients - platforms, companies, teams)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
  organization_type TEXT NOT NULL DEFAULT 'business', -- business, enterprise, startup, individual
  industry TEXT, -- music, gaming, media, education, etc.
  billing_email TEXT,
  company_size TEXT, -- 1-10, 11-50, 51-200, 201-1000, 1000+
  website TEXT,
  logo_url TEXT,
  account_status TEXT NOT NULL DEFAULT 'active', -- active, suspended, trial, churned
  plan_type TEXT NOT NULL DEFAULT 'free', -- free, starter, professional, enterprise
  billing_status TEXT DEFAULT 'trial', -- trial, active, past_due, cancelled
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  quota_verifications_monthly INTEGER DEFAULT 1000,
  quota_used_current_month INTEGER DEFAULT 0,
  quota_reset_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- References client_users
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  metadata JSONB
);

-- Client Users (people who use the client portal)
CREATE TABLE IF NOT EXISTS public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  totp_secret TEXT, -- For 2FA
  totp_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Array of recovery codes
  account_status TEXT NOT NULL DEFAULT 'active', -- active, suspended, pending_verification
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  last_login_device TEXT,
  login_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"security_alerts": true, "webhook_failures": true, "quota_warnings": true}',
  accepted_terms_version TEXT,
  accepted_terms_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  suspended_at TIMESTAMPTZ
);

-- Organization Members (many-to-many: users can belong to multiple orgs)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, developer, analyst, read_only
  permissions JSONB DEFAULT '[]', -- Custom permission overrides
  invited_by UUID REFERENCES public.client_users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  UNIQUE(organization_id, user_id)
);

-- Organization Invitations
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES public.client_users(id),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES public.client_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Environments (sandbox vs production per org)
CREATE TABLE IF NOT EXISTS public.environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- sandbox, production
  display_name TEXT NOT NULL,
  description TEXT,
  is_production BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- API Keys (per environment)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- fus_test_ or fus_live_
  key_hash TEXT NOT NULL UNIQUE,
  key_secret_partial TEXT, -- Last 4 chars for display
  scopes JSONB NOT NULL DEFAULT '["verify", "audit"]', -- verify, audit, extract_metadata, webhook_manage
  created_by UUID NOT NULL REFERENCES public.client_users(id),
  last_used_at TIMESTAMPTZ,
  last_used_ip TEXT,
  rate_limit_per_minute INTEGER DEFAULT 100,
  rate_limit_per_day INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.client_users(id)
);

-- Device/Session Management (for "remember device" and logout other sessions)
CREATE TABLE IF NOT EXISTS public.client_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_id TEXT, -- Fingerprint for "remember this device"
  device_name TEXT, -- Browser/OS info
  ip_address TEXT,
  user_agent TEXT,
  location_city TEXT,
  location_country TEXT,
  is_trusted_device BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login History (security audit trail)
CREATE TABLE IF NOT EXISTS public.login_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
  login_method TEXT NOT NULL, -- password, magic_link, sso, 2fa
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_id TEXT,
  location_city TEXT,
  location_country TEXT,
  suspicious BOOLEAN DEFAULT false, -- Flagged by anomaly detection
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Activity (professional version for client portal)
CREATE TABLE IF NOT EXISTS public.verification_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
  audio_registry_id UUID REFERENCES public.audio_registry(id),
  verification_result TEXT NOT NULL, -- verified, unverified, tampered, unknown
  origin_detected TEXT, -- human, ai, platform, unknown
  confidence_score DECIMAL(5,4),
  watermark_version TEXT,
  audio_hash TEXT,
  audio_filename TEXT,
  audio_size_bytes BIGINT,
  audio_format TEXT,
  api_key_id UUID REFERENCES public.api_keys(id),
  client_app_name TEXT, -- Optional tag from API call
  tamper_detected BOOLEAN DEFAULT false,
  tamper_details JSONB,
  policy_used TEXT,
  processing_time_ms INTEGER,
  user_id UUID REFERENCES public.client_users(id), -- Who triggered it
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Reports (exportable proof)
CREATE TABLE IF NOT EXISTS public.audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  verification_id UUID REFERENCES public.verification_activity(id),
  report_type TEXT NOT NULL, -- single_verification, batch, compliance_monthly
  report_format TEXT NOT NULL, -- json, pdf
  report_data JSONB NOT NULL,
  file_url TEXT,
  generated_by UUID REFERENCES public.client_users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks (per environment)
CREATE TABLE IF NOT EXISTS public.client_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL,
  event_types JSONB NOT NULL DEFAULT '["verification.completed"]', -- verification.completed, verification.failed, tamper.detected, quota.warning
  signing_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_policy JSONB DEFAULT '{"max_attempts": 3, "backoff": "exponential"}',
  created_by UUID NOT NULL REFERENCES public.client_users(id),
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Delivery Log
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.client_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  next_retry_at TIMESTAMPTZ
);

-- Usage Metrics (for billing and analytics)
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  environment_id UUID REFERENCES public.environments(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  verifications_count INTEGER DEFAULT 0,
  verifications_success INTEGER DEFAULT 0,
  verifications_failed INTEGER DEFAULT 0,
  tamper_detections INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  webhook_deliveries INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(5,4),
  p50_latency_ms INTEGER,
  p95_latency_ms INTEGER,
  UNIQUE(organization_id, environment_id, metric_date)
);

-- Billing Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, issued, paid, overdue, cancelled
  due_date DATE,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  line_items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES (Security First)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Client Portal tables - allow access for authentication functions
DROP POLICY IF EXISTS "Allow anon manage organizations" ON public.organizations;
CREATE POLICY "Allow anon manage organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage client_users" ON public.client_users;
CREATE POLICY "Allow anon manage client_users" ON public.client_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage organization_members" ON public.organization_members;
CREATE POLICY "Allow anon manage organization_members" ON public.organization_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage organization_invitations" ON public.organization_invitations;
CREATE POLICY "Allow anon manage organization_invitations" ON public.organization_invitations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage environments" ON public.environments;
CREATE POLICY "Allow anon manage environments" ON public.environments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage api_keys" ON public.api_keys;
CREATE POLICY "Allow anon manage api_keys" ON public.api_keys FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage client_sessions" ON public.client_sessions;
CREATE POLICY "Allow anon manage client_sessions" ON public.client_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage login_history" ON public.login_history;
CREATE POLICY "Allow anon manage login_history" ON public.login_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage verification_activity" ON public.verification_activity;
CREATE POLICY "Allow anon manage verification_activity" ON public.verification_activity FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage audit_reports" ON public.audit_reports;
CREATE POLICY "Allow anon manage audit_reports" ON public.audit_reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage client_webhooks" ON public.client_webhooks;
CREATE POLICY "Allow anon manage client_webhooks" ON public.client_webhooks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage webhook_deliveries" ON public.webhook_deliveries;
CREATE POLICY "Allow anon manage webhook_deliveries" ON public.webhook_deliveries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage usage_metrics" ON public.usage_metrics;
CREATE POLICY "Allow anon manage usage_metrics" ON public.usage_metrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon manage invoices" ON public.invoices;
CREATE POLICY "Allow anon manage invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_client_users_email ON public.client_users(email);
CREATE INDEX idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_client_sessions_user_id ON public.client_sessions(user_id);
CREATE INDEX idx_client_sessions_token ON public.client_sessions(session_token);
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id, created_at DESC);
CREATE INDEX idx_environments_org_id ON public.environments(organization_id);
CREATE INDEX idx_api_keys_org_id ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_env_id ON public.api_keys(environment_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_verification_activity_org_id ON public.verification_activity(organization_id, created_at DESC);
CREATE INDEX idx_verification_activity_env_id ON public.verification_activity(environment_id);
CREATE INDEX idx_client_webhooks_org_id ON public.client_webhooks(organization_id);
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id, delivered_at DESC);
CREATE INDEX idx_usage_metrics_org_date ON public.usage_metrics(organization_id, metric_date DESC);

-- ============================================
-- FUNCTIONS FOR AUTOMATED TASKS
-- ============================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_client_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.client_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.organization_invitations
  WHERE expires_at < NOW() AND accepted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly quota
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE public.organizations
  SET 
    quota_used_current_month = 0,
    quota_reset_date = (CURRENT_DATE + INTERVAL '1 month')::DATE
  WHERE quota_reset_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES FOR ADMINS
-- ============================================

-- To run this schema:
-- 1. Ensure main schema.sql (admin tables) is already applied
-- 2. Run this file: psql -f client-portal-schema.sql
-- 3. Verify tables created: SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%client%';

-- Automated maintenance (setup cron jobs):
-- SELECT cleanup_expired_client_sessions();
-- SELECT cleanup_expired_invitations();
-- SELECT reset_monthly_quotas(); -- Run monthly
