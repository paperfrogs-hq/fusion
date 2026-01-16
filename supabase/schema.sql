-- Fusion Admin Panel - Complete Database Schema
-- Cryptographic Control Plane for Audio Provenance & Verification
-- Created: January 16, 2026

-- ============================================
-- 1. ADMIN ACCESS & TRUST CONTROL
-- ============================================

-- Admin roles and permissions
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- super_admin, security_admin, ops_admin, read_only
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]', -- Array of permission strings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role_id UUID NOT NULL REFERENCES public.admin_roles(id),
  totp_secret TEXT, -- Encrypted TOTP secret for 2FA
  totp_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin verification codes (for login)
CREATE TABLE IF NOT EXISTS public.admin_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin sessions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admin_users(id),
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable audit log (append-only)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES public.admin_users(id),
  action TEXT NOT NULL, -- key_created, policy_updated, verification_rule_changed, etc.
  resource_type TEXT NOT NULL, -- key, client, audio, policy, etc.
  resource_id TEXT,
  action_hash TEXT NOT NULL, -- SHA-256 hash of the action for integrity
  details JSONB, -- Full action details
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- IP allowlist for geo-restriction
CREATE TABLE IF NOT EXISTS public.admin_ip_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id)
);

-- ============================================
-- 2. CRYPTOGRAPHIC KEY MANAGEMENT
-- ============================================

-- Master keys (root keys - HSM backed)
CREATE TABLE IF NOT EXISTS public.crypto_master_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_fingerprint TEXT NOT NULL UNIQUE, -- SHA-256 fingerprint
  key_type TEXT NOT NULL, -- root, signing, verification
  algorithm TEXT NOT NULL, -- RSA-4096, Ed25519, etc.
  key_status TEXT NOT NULL DEFAULT 'active', -- active, rotated, revoked, expired
  is_hsm_backed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.admin_users(id),
  revoke_reason TEXT
);

-- Client signing keys
CREATE TABLE IF NOT EXISTS public.crypto_client_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL, -- References clients table
  key_fingerprint TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL, -- PEM format public key
  key_type TEXT NOT NULL, -- signing, verification
  algorithm TEXT NOT NULL,
  key_status TEXT NOT NULL DEFAULT 'active',
  scopes JSONB NOT NULL DEFAULT '[]', -- ["insert_watermark", "verify_watermark", "extract_metadata"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.admin_users(id),
  last_used_at TIMESTAMPTZ
);

-- Key rotation history
CREATE TABLE IF NOT EXISTS public.crypto_key_rotation_log (
  id BIGSERIAL PRIMARY KEY,
  key_id UUID NOT NULL,
  old_fingerprint TEXT NOT NULL,
  new_fingerprint TEXT NOT NULL,
  rotation_reason TEXT,
  rotated_by UUID REFERENCES public.admin_users(id),
  rotated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. AUDIO PROVENANCE REGISTRY
-- ============================================

-- Audio assets with immutable provenance
CREATE TABLE IF NOT EXISTS public.audio_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of audio content
  provenance_status TEXT NOT NULL, -- human_created, ai_generated, platform_processed, unknown
  confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
  watermark_id TEXT UNIQUE, -- Embedded watermark identifier
  creator_id UUID, -- Client/platform that created it
  model_used TEXT, -- AI model name if AI-generated
  platform_id UUID, -- Platform that processed it
  metadata JSONB, -- Arbitrary metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verified_at TIMESTAMPTZ,
  tamper_detected BOOLEAN DEFAULT false,
  tamper_details JSONB
);

-- Provenance chain (immutable linked list)
CREATE TABLE IF NOT EXISTS public.provenance_chain (
  id BIGSERIAL PRIMARY KEY,
  audio_id UUID NOT NULL REFERENCES public.audio_registry(id),
  event_type TEXT NOT NULL, -- created, processed, verified, tampered
  event_hash TEXT NOT NULL, -- Hash of this event
  previous_event_hash TEXT, -- Hash of previous event (blockchain-style)
  event_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verified_by UUID REFERENCES public.admin_users(id)
);

-- Tamper detection log
CREATE TABLE IF NOT EXISTS public.tamper_detection_log (
  id BIGSERIAL PRIMARY KEY,
  audio_id UUID NOT NULL REFERENCES public.audio_registry(id),
  detection_method TEXT NOT NULL, -- watermark_mismatch, hash_conflict, metadata_anomaly
  severity TEXT NOT NULL, -- low, medium, high, critical
  detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  details JSONB,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.admin_users(id)
);

-- ============================================
-- 4. VERIFICATION ENGINE CONTROL
-- ============================================

-- Verification policies
CREATE TABLE IF NOT EXISTS public.verification_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  policy_mode TEXT NOT NULL DEFAULT 'permissive', -- strict, permissive, experimental
  confidence_threshold DECIMAL(5,4) NOT NULL DEFAULT 0.8000, -- Minimum confidence to pass
  tamper_sensitivity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  deterministic_mode BOOLEAN DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT false, -- Only one can be active at a time
  policy_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification policy history (rollback support)
CREATE TABLE IF NOT EXISTS public.verification_policy_history (
  id BIGSERIAL PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.verification_policies(id),
  version INTEGER NOT NULL,
  policy_config JSONB NOT NULL,
  changed_by UUID REFERENCES public.admin_users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT
);

-- Verification results
CREATE TABLE IF NOT EXISTS public.verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES public.audio_registry(id),
  policy_id UUID REFERENCES public.verification_policies(id),
  verification_status TEXT NOT NULL, -- passed, failed, suspicious
  confidence_score DECIMAL(5,4) NOT NULL,
  verification_details JSONB,
  verified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verified_by_client UUID -- Client that requested verification
);

-- ============================================
-- 5. CLIENT & PLATFORM MANAGEMENT
-- ============================================

-- Clients (platforms, AI companies, studios)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT, -- platform, ai_company, studio, research
  client_status TEXT NOT NULL DEFAULT 'active', -- active, suspended, revoked
  use_case TEXT,
  compliance_region TEXT NOT NULL DEFAULT 'global', -- eu, us, global
  contact_email TEXT NOT NULL,
  api_key_hash TEXT UNIQUE, -- Hashed API key
  rate_limit_per_minute INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 100000,
  assigned_keys JSONB DEFAULT '[]', -- Array of key IDs
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  suspended_at TIMESTAMPTZ,
  suspended_by UUID REFERENCES public.admin_users(id),
  suspension_reason TEXT
);

-- Client usage metrics
CREATE TABLE IF NOT EXISTS public.client_usage_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  date DATE NOT NULL,
  total_verifications INTEGER DEFAULT 0,
  successful_verifications INTEGER DEFAULT 0,
  failed_verifications INTEGER DEFAULT 0,
  watermarks_inserted INTEGER DEFAULT 0,
  tamper_detections INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  UNIQUE(client_id, date)
);

-- Client API keys
CREATE TABLE IF NOT EXISTS public.client_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes JSONB NOT NULL DEFAULT '[]', -- ["verify", "insert", "extract"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- ============================================
-- 6. ANALYTICS & MONITORING
-- ============================================

-- System-wide analytics (daily aggregates)
CREATE TABLE IF NOT EXISTS public.system_analytics (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_audio_verified INTEGER DEFAULT 0,
  ai_generated_count INTEGER DEFAULT 0,
  human_created_count INTEGER DEFAULT 0,
  platform_processed_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  verification_success_rate DECIMAL(5,4),
  tamper_detection_count INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model attribution frequency
CREATE TABLE IF NOT EXISTS public.model_attribution_stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  model_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  UNIQUE(date, model_name)
);

-- Geographic distribution (coarse)
CREATE TABLE IF NOT EXISTS public.geographic_stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  region TEXT NOT NULL, -- eu, us, asia, etc.
  verification_count INTEGER DEFAULT 0,
  UNIQUE(date, region)
);

-- ============================================
-- 7. INCIDENT & ABUSE MONITORING
-- ============================================

-- Security incidents
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL, -- replay_attack, forgery_attempt, key_misuse, suspicious_pattern
  severity TEXT NOT NULL, -- low, medium, high, critical
  client_id UUID REFERENCES public.clients(id),
  audio_id UUID REFERENCES public.audio_registry(id),
  description TEXT NOT NULL,
  detection_method TEXT,
  incident_data JSONB,
  status TEXT NOT NULL DEFAULT 'open', -- open, investigating, resolved, false_positive
  detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.admin_users(id),
  investigation_notes TEXT
);

-- Alert rules and thresholds
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  alert_type TEXT NOT NULL, -- rate_limit_breach, tamper_spike, key_misuse, etc.
  threshold_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id)
);

-- ============================================
-- 8. COMPLIANCE & REGULATION
-- ============================================

-- Compliance reports
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- eu_ai_act, audit_trail, proof_of_origin
  jurisdiction TEXT NOT NULL, -- eu, us, global
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  generated_by UUID REFERENCES public.admin_users(id),
  export_format TEXT, -- pdf, json
  file_path TEXT -- S3 path or similar
);

-- Data retention policies
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL UNIQUE, -- audit_logs, verification_results, provenance_chain
  retention_days INTEGER NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'global',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. DEVELOPER INFRASTRUCTURE
-- ============================================

-- Webhooks configuration
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  endpoint_url TEXT NOT NULL,
  event_types JSONB NOT NULL DEFAULT '[]', -- ["audio.verified", "tamper.detected", etc.]
  is_active BOOLEAN DEFAULT true,
  secret_hash TEXT, -- HMAC secret for webhook signatures
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_triggered_at TIMESTAMPTZ
);

-- Webhook event log
CREATE TABLE IF NOT EXISTS public.webhook_event_log (
  id BIGSERIAL PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhook_endpoints(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0
);

-- SDK versions and compatibility
CREATE TABLE IF NOT EXISTS public.sdk_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  protocol_version TEXT NOT NULL,
  release_date DATE NOT NULL,
  is_supported BOOLEAN DEFAULT true,
  deprecation_date DATE,
  changelog TEXT
);

-- ============================================
-- 10. SYSTEM & PROTOCOL CONTROL
-- ============================================

-- Protocol versions
CREATE TABLE IF NOT EXISTS public.protocol_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  watermark_algorithm TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false, -- Only one active at a time
  backward_compatible_with JSONB DEFAULT '[]', -- Array of compatible versions
  release_date DATE NOT NULL,
  deprecation_date DATE,
  created_by UUID REFERENCES public.admin_users(id)
);

-- System configuration
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.admin_users(id)
);

-- Emergency controls
CREATE TABLE IF NOT EXISTS public.emergency_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_type TEXT NOT NULL, -- shutdown, verify_only_mode, rate_limit_all
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES public.admin_users(id),
  activation_reason TEXT,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES public.admin_users(id)
);

-- System integrity checksums
CREATE TABLE IF NOT EXISTS public.system_integrity_log (
  id BIGSERIAL PRIMARY KEY,
  component TEXT NOT NULL, -- database, key_store, audit_log, etc.
  checksum TEXT NOT NULL,
  checksum_algorithm TEXT NOT NULL DEFAULT 'SHA-256',
  verified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL, -- valid, tampered
  details JSONB
);

-- ============================================
-- RLS POLICIES (Security First)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_ip_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_master_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_client_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_key_rotation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provenance_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamper_detection_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_policy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_attribution_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdk_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_integrity_log ENABLE ROW LEVEL SECURITY;

-- Admin verification codes (for login only)
-- These policies allow anonymous access during login flow
DROP POLICY IF EXISTS "Allow anon to insert codes" ON public.admin_verification_codes;
DROP POLICY IF EXISTS "Allow anon to read codes" ON public.admin_verification_codes;
DROP POLICY IF EXISTS "Allow anon to delete codes" ON public.admin_verification_codes;

CREATE POLICY "Allow anon to insert codes" ON public.admin_verification_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon to read codes" ON public.admin_verification_codes FOR SELECT USING (true);
CREATE POLICY "Allow anon to delete codes" ON public.admin_verification_codes FOR DELETE USING (true);

-- Admin roles - allow read access for login flow
DROP POLICY IF EXISTS "Allow anon read roles" ON public.admin_roles;
CREATE POLICY "Allow anon read roles" ON public.admin_roles FOR SELECT USING (true);

-- Admin users - allow full access for server-side functions
DROP POLICY IF EXISTS "Allow anon manage users" ON public.admin_users;
CREATE POLICY "Allow anon manage users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- Admin sessions - allow full access for server-side functions
DROP POLICY IF EXISTS "Allow anon manage sessions" ON public.admin_sessions;
CREATE POLICY "Allow anon manage sessions" ON public.admin_sessions FOR ALL USING (true) WITH CHECK (true);

-- Admin audit log - allow insert for logging
DROP POLICY IF EXISTS "Allow anon insert audit" ON public.admin_audit_log;
CREATE POLICY "Allow anon insert audit" ON public.admin_audit_log FOR INSERT WITH CHECK (true);

-- Clients - allow read for admin dashboard
DROP POLICY IF EXISTS "Allow anon read clients" ON public.clients;
CREATE POLICY "Allow anon read clients" ON public.clients FOR SELECT USING (true);

-- Clients - allow update for admin operations
DROP POLICY IF EXISTS "Allow anon update clients" ON public.clients;
CREATE POLICY "Allow anon update clients" ON public.clients FOR UPDATE USING (true) WITH CHECK (true);

-- Early access signups - allow read for admin dashboard
DROP POLICY IF EXISTS "Allow anon read signups" ON public.early_access_signups;
CREATE POLICY "Allow anon read signups" ON public.early_access_signups FOR SELECT USING (true);

-- Early access signups - allow delete for admin operations
DROP POLICY IF EXISTS "Allow anon delete signups" ON public.early_access_signups;
CREATE POLICY "Allow anon delete signups" ON public.early_access_signups FOR DELETE USING (true);

-- Note: These permissive policies are for server-side Netlify functions only
-- In production, consider using Supabase Service Role key for backend operations

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp DESC);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX idx_audio_registry_hash ON public.audio_registry(audio_hash);
CREATE INDEX idx_audio_registry_watermark ON public.audio_registry(watermark_id);
CREATE INDEX idx_provenance_chain_audio_id ON public.provenance_chain(audio_id);
CREATE INDEX idx_verification_results_audio_id ON public.verification_results(audio_id);
CREATE INDEX idx_client_usage_client_date ON public.client_usage_metrics(client_id, date);
CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity, detected_at DESC);
CREATE INDEX idx_webhook_event_log_webhook_id ON public.webhook_event_log(webhook_id, delivered_at DESC);

-- ============================================
-- SEED DATA (Initial Roles)
-- ============================================

INSERT INTO public.admin_roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access including key management and system control', '["*"]'),
  ('security_admin', 'Security and key management access', '["key_management", "audit_log", "security_incidents", "compliance"]'),
  ('ops_admin', 'Operational access for client management and monitoring', '["client_management", "analytics", "monitoring", "verification_control"]'),
  ('read_only', 'Read-only access for auditing and reporting', '["read_audit_log", "read_analytics", "read_clients"]')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- FUNCTIONS FOR AUTOMATED TASKS
-- ============================================

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_verification_codes
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_policies_updated_at BEFORE UPDATE ON public.verification_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES FOR ADMINS
-- ============================================

-- To create the first super admin:
-- INSERT INTO public.admin_users (email, role_id, totp_enabled, is_active)
-- VALUES ('admin@paperfrogs.dev', (SELECT id FROM public.admin_roles WHERE name = 'super_admin'), false, true);

-- To enable verify-only emergency mode:
-- UPDATE public.emergency_controls SET is_active = true, activated_at = NOW(), activated_by = '<admin_uuid>', activation_reason = 'Security incident'
-- WHERE control_type = 'verify_only_mode';
