// Admin authentication and authorization utilities

import { createClient } from "@supabase/supabase-js";
import type { AdminUser, AdminSession } from "@/types/admin";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface SessionData {
  token: string;
  admin: AdminUser;
  expiresAt: string;
}

// Session management
export const saveSession = (sessionData: SessionData) => {
  localStorage.setItem("fusion_admin_session", JSON.stringify(sessionData));
};

export const getSession = (): SessionData | null => {
  const data = localStorage.getItem("fusion_admin_session");
  if (!data) return null;
  
  try {
    const session: SessionData = JSON.parse(data);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem("fusion_admin_session");
};

// Permission checking
export const hasPermission = (permission: string): boolean => {
  const session = getSession();
  if (!session?.admin?.role?.permissions) return false;
  
  const permissions = session.admin.role.permissions;
  
  // Super admin has all permissions
  if (permissions.includes("*")) return true;
  
  // Check specific permission
  return permissions.includes(permission);
};

export const hasAnyPermission = (permissions: string[]): boolean => {
  return permissions.some(p => hasPermission(p));
};

export const requirePermission = (permission: string): boolean => {
  if (!hasPermission(permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`);
  }
  return true;
};

// Audit logging
export const logAdminAction = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
) => {
  const session = getSession();
  if (!session) return;
  
  // Generate action hash for integrity
  const actionData = JSON.stringify({ action, resourceType, resourceId, details, timestamp: Date.now() });
  const actionHash = await generateHash(actionData);
  
  try {
    await supabase.from("admin_audit_log").insert([{
      admin_id: session.admin.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      action_hash: actionHash,
      details,
      timestamp: new Date().toISOString()
    }]);
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};

// Helper to generate SHA-256 hash
const generateHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Get current admin user with role
export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  const session = getSession();
  if (!session) return null;
  
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select(`
        *,
        role:admin_roles!admin_users_role_id_fkey(*)
      `)
      .eq("id", session.admin.id)
      .single();
    
    if (error || !data) return null;
    return data as AdminUser;
  } catch {
    return null;
  }
};

// Validate session token on server
export const validateSession = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("*, admin:admin_users!admin_sessions_admin_id_fkey(*)")
      .eq("session_token", token)
      .gt("expires_at", new Date().toISOString())
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
};
