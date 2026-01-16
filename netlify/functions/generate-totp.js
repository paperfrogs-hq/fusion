const { createClient } = require("@supabase/supabase-js");
const OTPAuth = require("otpauth");
const QRCode = require("qrcode");

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
    const { adminId, email } = JSON.parse(event.body || "{}");

    if (!adminId || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Admin ID and email are required" }),
      };
    }

    // Generate TOTP secret
    const totp = new OTPAuth.TOTP({
      issuer: "Fusion Admin",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const totpSecret = totp.secret.base32;

    // Generate QR code
    const otpAuthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        secret: totpSecret,
        qrCode: qrCodeDataUrl,
      }),
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
