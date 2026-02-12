const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
const crypto = require("crypto");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { email, userType } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email is required" }),
      };
    }

    // Determine which table to check based on userType
    const tableName = userType === "user" ? "users" : "client_portal_users";

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from(tableName)
      .select("id, email, full_name")
      .eq("email", email.toLowerCase())
      .single();

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (!user || userError) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: "If an account exists with this email, you will receive a password reset link." 
        }),
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to store reset token:", updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to process request" }),
      };
    }

    // Generate reset URL
    const baseUrl = process.env.URL || "https://fusion.paperfrogs.dev";
    const resetPath = userType === "user" ? "/user/reset-password" : "/client/reset-password";
    const resetUrl = `${baseUrl}${resetPath}?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send reset email
    await resend.emails.send({
      from: "Fusion <noreply@fusion.paperfrogs.dev>",
      to: email,
      subject: "Reset Your Fusion Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Reset Password</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.7;
                color: #2d2d2d;
                background: #f8f8f8;
                padding: 20px;
                margin: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #1a4d2e 0%, #0d3b1f 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 15px;
              }
              .button {
                display: inline-block;
                background: #1a4d2e;
                color: white !important;
                padding: 14px 36px;
                border-radius: 8px;
                text-decoration: none;
                margin: 24px 0;
                font-weight: 600;
                font-size: 16px;
              }
              .warning {
                background: #fef3cd;
                border: 1px solid #ffc107;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #856404;
              }
              .footer {
                background: #f5f5f5;
                padding: 25px 30px;
                text-align: center;
                font-size: 13px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset</h1>
              </div>
              <div class="content">
                <p>Hi${user.full_name ? ` ${user.full_name}` : ''},</p>
                <p>We received a request to reset your Fusion password. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>

                <div class="warning">
                  <strong>⚠️ Important:</strong> This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.
                </div>

                <p style="margin-top: 30px; color: #666; font-size: 13px;">
                  If the button doesn't work, copy and paste this URL into your browser:<br>
                  <a href="${resetUrl}" style="color: #1a4d2e; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
              <div class="footer">
                <p><strong>Fusion by Paperfrogs</strong></p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: "If an account exists with this email, you will receive a password reset link." 
      }),
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to process request" }),
    };
  }
};
