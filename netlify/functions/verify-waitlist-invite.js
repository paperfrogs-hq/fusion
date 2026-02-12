const { createClient } = require("@supabase/supabase-js");

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
    const { token, email } = JSON.parse(event.body || "{}");

    if (!token || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Token and email are required" }),
      };
    }

    // Find waitlist entry with matching token and email
    const { data: waitlistEntry, error: findError } = await supabase
      .from("early_access_signups")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("invite_token", token)
      .single();

    if (!waitlistEntry || findError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid invitation link" }),
      };
    }

    // Check if token is expired
    if (new Date(waitlistEntry.invite_expires_at) < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "This invitation has expired. Please contact support for a new invitation." }),
      };
    }

    // Check if already used
    if (waitlistEntry.invite_used_at) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "This invitation has already been used" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        valid: true,
        email: waitlistEntry.email,
        signupType: waitlistEntry.invited_to || "client"
      }),
    };
  } catch (error) {
    console.error("Verify invite error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to verify invitation" }),
    };
  }
};
