// Admin types for Fusion Cryptographic Control Plane

export type AdminRole = 'super_admin' | 'security_admin' | 'ops_admin' | 'read_only';

export interface AdminUser {
  id: string;
  email: string;
  role_id: string;
  role?: AdminRoleData;
  totp_enabled: boolean;
  is_active: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  created_at: string;
}

export interface AdminRoleData {
  id: string;
  name: AdminRole;
  description: string;
  permissions: string[];
}

export interface AdminSession {
  id: string;
  admin_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  action_hash: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface CryptoKey {
  id: string;
  key_fingerprint: string;
  key_type: 'root' | 'signing' | 'verification';
  algorithm: string;
  key_status: 'active' | 'rotated' | 'revoked' | 'expired';
  is_hsm_backed?: boolean;
  created_at: string;
  expires_at?: string;
  revoked_at?: string;
}

export interface AudioAsset {
  id: string;
  audio_hash: string;
  provenance_status: 'human_created' | 'ai_generated' | 'platform_processed' | 'unknown';
  confidence_score?: number;
  watermark_id?: string;
  creator_id?: string;
  model_used?: string;
  platform_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  verified_at?: string;
  tamper_detected: boolean;
  tamper_details?: Record<string, any>;
}

export interface Client {
  id: string;
  name: string;
  organization_type?: string;
  client_status: 'active' | 'suspended' | 'revoked';
  use_case?: string;
  compliance_region: 'eu' | 'us' | 'global';
  contact_email: string;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  created_at: string;
  suspended_at?: string;
  suspension_reason?: string;
}

export interface VerificationPolicy {
  id: string;
  name: string;
  policy_mode: 'strict' | 'permissive' | 'experimental';
  confidence_threshold: number;
  tamper_sensitivity: 'low' | 'medium' | 'high';
  deterministic_mode: boolean;
  version: number;
  is_active: boolean;
  policy_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SecurityIncident {
  id: string;
  incident_type: 'replay_attack' | 'forgery_attempt' | 'key_misuse' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  client_id?: string;
  audio_id?: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  detected_at: string;
  resolved_at?: string;
  investigation_notes?: string;
}

export interface SystemAnalytics {
  date: string;
  total_audio_verified: number;
  ai_generated_count: number;
  human_created_count: number;
  platform_processed_count: number;
  unknown_count: number;
  verification_success_rate: number;
  tamper_detection_count: number;
  active_clients: number;
}
