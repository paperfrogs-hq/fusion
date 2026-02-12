const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { token, email } = JSON.parse(event.body);

    if (!token || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Token and email are required" })
      };
    }

    // Update the early_access_signups record to mark invite as used
    const { error } = await supabase
      .from("early_access_signups")
      .update({
        invite_used_at: new Date().toISOString(),
        status: "converted"
      })
      .eq("email", email.toLowerCase())
      .eq("invite_token", token);

    if (error) {
      console.error("Error marking invite as used:", error);
      // Don't fail the signup if this fails
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("Error in use-waitlist-invite:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
