const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
const crypto = require("crypto");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a signed invite token (contains email + expiry + signature)
function generateSignedToken(email, signupType) {
  const secret = process.env.INVITE_SECRET || supabaseServiceKey.slice(0, 32);
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${email}|${signupType}|${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
  return Buffer.from(`${payload}|${signature}`).toString('base64url');
}

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
    const { id, email, customMessage, signupType } = JSON.parse(event.body || "{}");

    if (!id || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "ID and email are required" }),
      };
    }

    // Generate signed invite token (no database storage needed)
    const inviteToken = generateSignedToken(email, signupType || "client");

    // Update waitlist record to mark as invited (only using existing columns)
    const { error: updateError } = await supabase
      .from("early_access_signups")
      .update({ 
        confirmed: true // Mark as confirmed/invited
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update waitlist:", updateError);
      // Continue anyway - the invite can still be sent
    }

    // Generate signup URL
    const baseUrl = process.env.URL || "https://fusion.paperfrogs.dev";
    const signupUrl = `${baseUrl}/waitlist/signup?token=${inviteToken}`;

    // Default message if no custom message provided
    const messageContent = customMessage || `
      <p>Great news! You've been selected for early access to Fusion.</p>
      <p>Click the button below to create your account and start using Fusion's audio verification technology.</p>
    `;

    // Send invite email
    await resend.emails.send({
      from: "Fusion Developer Team <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "🎉 You're Invited to Join Fusion!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Fusion Invitation</title>
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
              .header p {
                margin: 0;
                opacity: 0.9;
                font-size: 16px;
              }
              .content {
                padding: 40px 30px;
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 15px;
              }
              .message-box {
                background: #f0fdf4;
                border-left: 4px solid #1a4d2e;
                padding: 20px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
              }
              .button {
                display: inline-block;
                background: #1a4d2e;
                color: white !important;
                padding: 16px 48px;
                border-radius: 8px;
                text-decoration: none;
                margin: 24px 0;
                font-weight: 600;
                font-size: 16px;
                transition: background 0.2s;
              }
              .button:hover {
                background: #0d3b1f;
              }
              .expires {
                color: #666;
                font-size: 13px;
                margin-top: 20px;
              }
              .signature {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e5e5;
                color: #666;
                font-size: 14px;
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
                <h1>You're Invited! 🎉</h1>
                <p>Your exclusive access to Fusion awaits</p>
              </div>
              <div class="content">
                <div class="message-box">
                  ${messageContent}
                </div>
                
                <p>Your account will give you access to:</p>
                <ul>
                  <li>Audio authenticity verification API</li>
                  <li>Real-time tamper detection</li>
                  <li>Comprehensive analytics dashboard</li>
                  <li>Webhook integrations</li>
                </ul>

                <div style="text-align: center;">
                  <a href="${signupUrl}" class="button">Create Your Account</a>
                </div>

                <p class="expires">
                  This invitation link expires in 7 days. If you didn't request this, you can safely ignore this email.
                </p>

                <div class="signature">
                  <p>Best regards,<br><strong>The Fusion Team</strong></p>
                </div>
              </div>
              <div class="footer">
                <p><strong>Fusion by Paperfrogs</strong></p>
                <p>Cryptographic audio verification platform</p>
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
        message: "Invitation sent successfully",
        signupUrl 
      }),
    };
  } catch (error) {
    console.error("Send invite error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Failed to send invitation" }),
    };
  }
};
