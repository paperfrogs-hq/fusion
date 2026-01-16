const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  try {
    const results = {
      env: {
        hasUrl: !!process.env.VITE_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        usingKey: supabaseServiceKey?.substring(0, 20) + "..."
      },
      tables: {}
    };
    
    // Check admin_roles
    const { data: roles, error: rolesError } = await supabase
      .from("admin_roles")
      .select("*")
      .limit(5);
    
    results.tables.admin_roles = {
      exists: !rolesError,
      count: roles?.length || 0,
      error: rolesError?.message,
      sample: roles?.[0]
    };
    
    // Check admin_users
    const { data: users, error: usersError } = await supabase
      .from("admin_users")
      .select("*")
      .limit(5);
    
    results.tables.admin_users = {
      exists: !usersError,
      count: users?.length || 0,
      error: usersError?.message,
      sample: users?.[0]
    };
    
    // Check admin_verification_codes
    const { data: codes, error: codesError } = await supabase
      .from("admin_verification_codes")
      .select("*")
      .limit(5);
    
    results.tables.admin_verification_codes = {
      exists: !codesError,
      count: codes?.length || 0,
      error: codesError?.message,
      sample: codes?.[0]
    };
    
    // Check admin_sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("admin_sessions")
      .select("*")
      .limit(5);
    
    results.tables.admin_sessions = {
      exists: !sessionsError,
      count: sessions?.length || 0,
      error: sessionsError?.message,
      sample: sessions?.[0]
    };
    
    // Try to insert a test role
    const { data: testRole, error: insertError } = await supabase
      .from("admin_roles")
      .insert([{
        name: 'test_role',
        description: 'Test role',
        permissions: ["test"]
      }])
      .select()
      .single();
    
    results.insertTest = {
      success: !insertError,
      error: insertError?.message,
      result: testRole
    };
    
    // Delete test role if it was created
    if (testRole) {
      await supabase
        .from("admin_roles")
        .delete()
        .eq("id", testRole.id);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, stack: error.stack }),
    };
  }
};
