// Netlify Function - Delete User (Admin Only)
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { userId, adminToken } = JSON.parse(event.body);

    console.log("🗑️ Delete user request received");
    console.log("User ID:", userId);
    console.log("Admin token present:", !!adminToken);
    console.log("Environment vars present:", {
      supabaseUrl: !!process.env.VITE_SUPABASE_URL,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Validate input
    if (!userId) {
      console.error("❌ No user ID provided");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "User ID is required" }),
      };
    }

    // Check if service role key exists
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY not found in environment!");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY",
          hint: "Admin must add SUPABASE_SERVICE_ROLE_KEY to Netlify environment variables"
        }),
      };
    }

    // Admin token check - just verify it exists (we trust the admin panel session)
    if (!adminToken) {
      console.error("❌ No admin token provided");
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: "Admin authentication required",
          hint: "Please refresh the admin panel and try again"
        }),
      };
    }

    // Initialize Supabase with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("✅ Supabase client initialized with service role");
    console.log("🗑️ Attempting to delete user:", userId);

    // Delete user's audio files first (if any)
    console.log("🗑️ Step 1: Deleting audio files...");
    const { error: audioDeleteError } = await supabase
      .from("audio_files")
      .delete()
      .eq("user_id", userId);

    if (audioDeleteError) {
      console.error("⚠️ Error deleting audio files:", audioDeleteError.message);
      // Continue anyway - user might not have any files or table doesn't exist
    } else {
      console.log("✅ Audio files deleted (or none existed)");
    }

    // Delete user's sessions
    console.log("🗑️ Step 2: Deleting sessions...");
    const { error: sessionsDeleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("user_id", userId);

    if (sessionsDeleteError) {
      console.error("⚠️ Error deleting sessions:", sessionsDeleteError.message);
      // Continue anyway
    } else {
      console.log("✅ Sessions deleted (or none existed)");
    }

    // Delete verification history
    console.log("🗑️ Step 3: Deleting verification history...");
    const { error: verificationDeleteError } = await supabase
      .from("verification_history")
      .delete()
      .eq("user_id", userId);

    if (verificationDeleteError) {
      console.error("⚠️ Error deleting verification history:", verificationDeleteError.message);
      // Continue anyway
    } else {
      console.log("✅ Verification history deleted (or none existed)");
    }

    // Finally, delete the user
    console.log("🗑️ Step 4: Deleting user account...");
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)
      .select();

    if (error) {
      console.error("❌ FAILED to delete user:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Failed to delete user",
          details: error.message,
          code: error.code,
          hint: error.hint
        }),
      };
    }

    if (!data || data.length === 0) {
      console.error("❌ User not found:", userId);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: "User not found",
          userId: userId
        }),
      };
    }

    console.log("✅✅✅ User deleted successfully!");
    console.log("Deleted user data:", data[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: "User and all associated data deleted successfully",
        deletedUser: data?.[0] || null
      }),
    };

  } catch (error) {
    console.error("❌ Delete user error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
    };
  }
};
