const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate secure session token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { email, code } = JSON.parse(event.body || "{}");

    // Validate email domain
    if (!email || !email.endsWith("@paperfrogs.dev")) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Unauthorized email domain" }),
      };
    }

    // Get verification code from Supabase
    const { data: stored, error: fetchError } = await supabase
      .from("admin_verification_codes")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !stored) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No verification code found. Please request a new one." }),
      };
    }

    // Check expiration
    if (new Date() > new Date(stored.expires_at)) {
      // Delete expired code
      await supabase
        .from("admin_verification_codes")
        .delete()
        .eq("email", email);
        
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Verification code expired. Please request a new one." }),
      };
    }

    // Verify code
    if (stored.code !== code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid verification code" }),
      };
    }

    // Code is valid, delete it
    await supabase
      .from("admin_verification_codes")
      .delete()
      .eq("email", email);
    
    // Ensure admin roles exist (seed if missing)
    const { data: roles } = await supabase
      .from("admin_roles")
      .select("id, name")
      .limit(1);
    
    if (!roles || roles.length === 0) {
      // Seed roles if they don't exist
      await supabase.from("admin_roles").insert([
        { name: 'super_admin', description: 'Full system access', permissions: ["*"] },
        { name: 'security_admin', description: 'Security and key management', permissions: ["key_management", "audit_log", "security_incidents", "compliance"] },
        { name: 'ops_admin', description: 'Operational access', permissions: ["client_management", "analytics", "monitoring", "verification_control"] },
        { name: 'read_only', description: 'Read-only access', permissions: ["read_audit_log", "read_analytics", "read_clients"] }
      ]);
    }
    
    // Get or create admin user
    let { data: adminUser, error: userError } = await supabase
      .from("admin_users")
      .select(`
        *,
        role:admin_roles!admin_users_role_id_fkey(*)
      `)
      .eq("email", email)
      .single();
    
    // If admin doesn't exist, create with default role (ops_admin for @paperfrogs.dev)
    if (userError || !adminUser) {
      const { data: defaultRole } = await supabase
        .from("admin_roles")
        .select("id")
        .eq("name", "ops_admin")
        .single();
      
      if (!defaultRole) {
        console.error("Failed to get default role");
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Admin roles not configured. Please run database schema." }),
        };
      }
      
      const { data: newAdmin, error: createError } = await supabase
        .from("admin_users")
        .insert([{
          email,
          role_id: defaultRole.id,
          totp_enabled: false,
          is_active: true,
          last_login_at: new Date().toISOString(),
          last_login_ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip']
        }])
        .select(`
          *,
          role:admin_roles!admin_users_role_id_fkey(*)
        `)
        .single();
      
      if (createError) {
        console.error("Failed to create admin user:", createError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: `Failed to create admin user: ${createError.message}` }),
        };
      }
      
      adminUser = newAdmin;
    } else {
      // Update last login
      await supabase
        .from("admin_users")
        .update({
          last_login_at: new Date().toISOString(),
          last_login_ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip']
        })
        .eq("id", adminUser.id);
    }
    
    if (!adminUser) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to create admin user. Check server logs." }),
      };
    }
    
    // Generate session token and create session (24 hour expiry)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await supabase
      .from("admin_sessions")
      .insert([{
        admin_id: adminUser.id,
        session_token: token,
        ip_address: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
        user_agent: event.headers['user-agent'],
        expires_at: expiresAt
      }]);
    
    // Log successful login in audit log
    await supabase
      .from("admin_audit_log")
      .insert([{
        admin_id: adminUser.id,
        action: "admin_login",
        resource_type: "session",
        action_hash: crypto.createHash('sha256').update(`${email}-${Date.now()}`).digest('hex'),
        details: { email, ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] },
        ip_address: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
        user_agent: event.headers['user-agent']
      }]);

    console.log(`Admin login successful for ${email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        token,
        admin: adminUser,
        expiresAt
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
