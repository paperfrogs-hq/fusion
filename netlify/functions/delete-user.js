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

    // Validate input
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "User ID is required" }),
      };
    }

    // Verify admin token (basic check - enhance as needed)
    if (!adminToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Admin authentication required" }),
      };
    }

    // Initialize Supabase with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("🗑️ Attempting to delete user:", userId);

    // Delete user's audio files first (if any)
    const { error: audioDeleteError } = await supabase
      .from("audio_files")
      .delete()
      .eq("user_id", userId);

    if (audioDeleteError) {
      console.error("Error deleting audio files:", audioDeleteError);
      // Continue anyway - user might not have any files
    }

    // Delete user's sessions
    const { error: sessionsDeleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("user_id", userId);

    if (sessionsDeleteError) {
      console.error("Error deleting sessions:", sessionsDeleteError);
      // Continue anyway
    }

    // Delete verification history
    const { error: verificationDeleteError } = await supabase
      .from("verification_history")
      .delete()
      .eq("user_id", userId);

    if (verificationDeleteError) {
      console.error("Error deleting verification history:", verificationDeleteError);
      // Continue anyway
    }

    // Finally, delete the user
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)
      .select();

    if (error) {
      console.error("❌ Failed to delete user:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Failed to delete user",
          details: error.message 
        }),
      };
    }

    console.log("✅ User deleted successfully:", userId);

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
