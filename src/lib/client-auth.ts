// Client Portal Authentication & Session Management
// Helper functions for managing client user sessions, organizations, and environments

export interface ClientUser {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  totp_enabled: boolean;
  account_status: string;
  avatar_url?: string;
  timezone?: string;
  notification_preferences?: {
    security_alerts: boolean;
    webhook_failures: boolean;
    quota_warnings: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  account_status: string;
  plan_type: string;
  billing_status: string;
  trial_ends_at?: string;
  quota_verifications_monthly: number;
  quota_used_current_month: number;
  logo_url?: string;
  role?: string; // User's role in this org
}

export interface Environment {
  id: string;
  organization_id: string;
  name: string;
  display_name: string;
  description?: string;
  is_production: boolean;
}

const STORAGE_KEYS = {
  SESSION_TOKEN: 'fusion_client_token',
  USER: 'fusion_client_user',
  ORGANIZATIONS: 'fusion_client_orgs',
  CURRENT_ORG: 'fusion_current_org',
  CURRENT_ENV: 'fusion_current_env',
  DEVICE_ID: 'fusion_device_id',
} as const;

// ============================================
// Session Management
// ============================================

export function getSessionToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
}

export function setSessionToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
}

export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

// ============================================
// User Management
// ============================================

export function getCurrentUser(): ClientUser | null {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: ClientUser): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ============================================
// Organization Management
// ============================================

export function getOrganizations(): Organization[] {
  const orgsStr = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
  if (!orgsStr) return [];
  
  try {
    return JSON.parse(orgsStr);
  } catch {
    return [];
  }
}

export function setOrganizations(orgs: Organization[]): void {
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
}

export function getCurrentOrganization(): Organization | null {
  const orgStr = localStorage.getItem(STORAGE_KEYS.CURRENT_ORG);
  if (!orgStr) return null;
  
  try {
    return JSON.parse(orgStr);
  } catch {
    return null;
  }
}

export function setCurrentOrganization(org: Organization): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, JSON.stringify(org));
}

export function clearCurrentOrganization(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ORG);
}

export function switchOrganization(orgId: string): Organization | null {
  const orgs = getOrganizations();
  const org = orgs.find(o => o.id === orgId);
  
  if (org) {
    setCurrentOrganization(org);
    // Clear current environment when switching orgs
    clearCurrentEnvironment();
  }
  
  return org || null;
}

// ============================================
// Environment Management
// ============================================

export function getCurrentEnvironment(): Environment | null {
  const envStr = localStorage.getItem(STORAGE_KEYS.CURRENT_ENV);
  if (!envStr) return null;
  
  try {
    return JSON.parse(envStr);
  } catch {
    return null;
  }
}

export function setCurrentEnvironment(env: Environment): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_ENV, JSON.stringify(env));
}

export function clearCurrentEnvironment(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ENV);
}

// ============================================
// Device Management
// ============================================

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  
  return deviceId;
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Simple device detection
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) {
    if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone';
    if (/Android/.test(ua)) return 'Android Phone';
    return 'Mobile Device';
  }
  
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux';
  
  return 'Unknown Device';
}

// ============================================
// Full Logout
// ============================================

export function logout(): void {
  clearSessionToken();
  clearCurrentUser();
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATIONS);
  clearCurrentOrganization();
  clearCurrentEnvironment();
  // Keep device ID for "remember device" on next login
}

// ============================================
// Authorization Helpers
// ============================================

export function hasRole(org: Organization | null, ...roles: string[]): boolean {
  if (!org || !org.role) return false;
  return roles.includes(org.role);
}

export function canManageTeam(org: Organization | null): boolean {
  return hasRole(org, 'owner', 'admin');
}

export function canManageAPIKeys(org: Organization | null): boolean {
  return hasRole(org, 'owner', 'admin', 'developer');
}

export function canManageWebhooks(org: Organization | null): boolean {
  return hasRole(org, 'owner', 'admin', 'developer');
}

export function canViewBilling(org: Organization | null): boolean {
  return hasRole(org, 'owner', 'admin');
}

export function canManageBilling(org: Organization | null): boolean {
  return hasRole(org, 'owner');
}

export function isReadOnly(org: Organization | null): boolean {
  return hasRole(org, 'read_only', 'analyst');
}

// ============================================
// API Helpers
// ============================================

export function getAuthHeaders(): HeadersInit {
  const token = getSessionToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Auto logout on 401
  if (response.status === 401) {
    logout();
    window.location.href = '/client/login';
  }
  
  return response;
}

// ============================================
// Session Validation
// ============================================

export function validateSession(): boolean {
  const token = getSessionToken();
  const user = getCurrentUser();
  const org = getCurrentOrganization();
  
  return !!(token && user && org);
}

export function requireAuth(): void {
  if (!validateSession()) {
    window.location.href = '/client/login';
  }
}

// ============================================
// Plan & Quota Helpers
// ============================================

export function isFreePlan(org: Organization | null): boolean {
  return org?.plan_type === 'free';
}

export function isOnTrial(org: Organization | null): boolean {
  if (!org || org.billing_status !== 'trial') return false;
  if (!org.trial_ends_at) return false;
  
  const trialEnd = new Date(org.trial_ends_at);
  return trialEnd > new Date();
}

export function getTrialDaysRemaining(org: Organization | null): number {
  if (!org?.trial_ends_at) return 0;
  
  const trialEnd = new Date(org.trial_ends_at);
  const now = new Date();
  const diffMs = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

export function getQuotaUsagePercent(org: Organization | null): number {
  if (!org) return 0;
  if (org.quota_verifications_monthly === 0) return 0;
  
  return Math.round((org.quota_used_current_month / org.quota_verifications_monthly) * 100);
}

export function isQuotaExceeded(org: Organization | null): boolean {
  if (!org) return false;
  return org.quota_used_current_month >= org.quota_verifications_monthly;
}
