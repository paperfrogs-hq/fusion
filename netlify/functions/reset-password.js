const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { email, token, newPassword, userType } = JSON.parse(event.body || "{}");

    if (!email || !token || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email, token, and new password are required" }),
      };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Password must be at least 8 characters" }),
      };
    }

    // Determine which table to check based on userType
    const tableName = userType === "user" ? "users" : "client_portal_users";

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from(tableName)
      .select("id, email, reset_token, reset_token_expires")
      .eq("email", email.toLowerCase())
      .eq("reset_token", token)
      .single();

    if (!user || userError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid or expired reset link" }),
      };
    }

    // Check if token is expired
    if (new Date(user.reset_token_expires) < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Reset link has expired. Please request a new one." }),
      };
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the password and clear reset token
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update password:", updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to reset password" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: "Password has been reset successfully" 
      }),
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to reset password" }),
    };
  }
};
