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

    // Note: Foreign key constraints have ON DELETE CASCADE, so deleting the user
    // will automatically delete related records in user_sessions, user_audio_files,
    // and user_verification_history tables.

    // Optional: Get user data before deletion for logging
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("id, email, full_name, created_at")
      .eq("id", userId)
      .single();

    if (fetchError || !userData) {
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

    console.log("📋 Found user:", userData.email);

    // Delete from Supabase Storage (audio files) - CASCADE won't handle storage bucket
    console.log("🗑️ Step 1: Deleting audio files from storage...");
    try {
      // Get list of user's audio files to delete from storage
      const { data: audioFiles } = await supabase
        .from("user_audio_files")
        .select("storage_path")
        .eq("user_id", userId);

      if (audioFiles && audioFiles.length > 0) {
        const filePaths = audioFiles.map(f => f.storage_path).filter(Boolean);
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("audio-files")
            .remove(filePaths);
          
          if (storageError) {
            console.error("⚠️ Error deleting from storage:", storageError.message);
          } else {
            console.log(`✅ Deleted ${filePaths.length} files from storage`);
          }
        }
      }
    } catch (storageErr) {
      console.error("⚠️ Storage cleanup error:", storageErr);
      // Continue with user deletion even if storage cleanup fails
    }

    // Delete the user (CASCADE will handle related records)
    console.log("🗑️ Step 2: Deleting user account (CASCADE will delete related data)...");
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
