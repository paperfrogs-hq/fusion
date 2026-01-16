const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");

    // Validate email
    if (!email || !email.endsWith("@paperfrogs.dev")) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "Unauthorized email domain" }),
      };
    }

    // Generate code
    const code = generateCode();
    
    // Store in Supabase with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    // Delete any existing codes for this email
    await supabase
      .from("admin_verification_codes")
      .delete()
      .eq("email", email);
    
    // Insert new code
    const { error: dbError } = await supabase
      .from("admin_verification_codes")
      .insert([{
        email,
        code,
        expires_at: expiresAt,
      }]);

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store verification code");
    }

    // Send email with verification code
    await resend.emails.send({
      from: "Fusion Admin <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "Admin Login Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Admin Login Code</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #2d2d2d;
                background: #f8f8f8;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #1a4d2e 0%, #0d3b1f 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
              }
              .content {
                padding: 40px;
                text-align: center;
              }
              .code {
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1a4d2e;
                background: #f0f8f4;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                font-family: 'Courier New', monospace;
              }
              .footer {
                background: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Admin Login</h1>
                <p>Fusion by Paperfrogs HQ</p>
              </div>
              <div class="content">
                <p style="font-size: 18px; margin-bottom: 10px;">Your verification code is:</p>
                <div class="code">${code}</div>
                <p style="color: #666; font-size: 14px;">
                  This code will expire in 5 minutes.<br>
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
              <div class="footer">
                <p><strong>Paperfrogs HQ</strong></p>
                <p>Secure Admin Access</p>
  
      `,
    });

    console.log(`Verification code sent to ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Code sent" }),
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
