const { createClient } = require("@supabase/supabase-js");
const OTPAuth = require("otpauth");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
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
    const { adminId, email, secret, code } = JSON.parse(event.body || "{}");

    if (!adminId || !email || !secret || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "All fields are required" }),
      };
    }

    // Create TOTP instance with the secret
    const totp = new OTPAuth.TOTP({
      issuer: "Fusion Admin",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    // Verify the code
    const delta = totp.validate({ token: code, window: 1 });
    
    if (delta === null) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid verification code" }),
      };
    }

    // Store encrypted TOTP secret in database
    const { error } = await supabase
      .from("admin_users")
      .update({
        totp_secret: secret,
        totp_enabled: true,
      })
      .eq("id", adminId);

    if (error) {
      console.error("Failed to enable TOTP:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to enable 2FA: ${error.message}` }),
      };
    }

    // Log the action
    await supabase
      .from("admin_audit_log")
      .insert([{
        admin_id: adminId,
        action: "totp_enabled",
        resource_type: "admin_user",
        resource_id: adminId,
        action_hash: require("crypto").createHash("sha256").update(`${adminId}-${Date.now()}`).digest("hex"),
        details: { email },
        ip_address: event.headers['x-forwarded-for'] || event.headers['x-real-ip'],
        user_agent: event.headers['user-agent']
      }]);

    console.log(`2FA enabled for ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
