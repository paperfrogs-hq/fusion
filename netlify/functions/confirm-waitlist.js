const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
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
    const { id, email } = JSON.parse(event.body || "{}");

    if (!id || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "ID and email are required" }),
      };
    }

    // Update waitlist user to confirmed
    const { error: updateError } = await supabase
      .from("early_access_signups")
      .update({ confirmed: true })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to confirm user:", updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to confirm user: ${updateError.message}` }),
      };
    }

    // Send confirmation email
    await resend.emails.send({
      from: "Fusion Team <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "Welcome to Fusion - Access Confirmed!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Fusion</title>
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
              }
              .button {
                display: inline-block;
                background: #1a4d2e;
                color: white;
                padding: 12px 32px;
                border-radius: 8px;
                text-decoration: none;
                margin: 20px 0;
                font-weight: bold;
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
                <h1>🎉 Welcome to Fusion!</h1>
                <p>Your early access has been confirmed</p>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>Great news! You've been confirmed for early access to Fusion, our cutting-edge Cryptographic Control Plane for Audio Provenance & Verification.</p>
                
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>You'll receive your API credentials within 24 hours</li>
                  <li>Check out our documentation to get started</li>
                  <li>Join our Discord community for support</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="https://fusion.paperfrogs.dev" class="button">Visit Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  If you have any questions, feel free to reach out to our team at info@paperfrogs.dev
                </p>
              </div>
              <div class="footer">
                <p><strong>Paperfrogs HQ</strong></p>
                <p>Building trust in the age of AI</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Waitlist user confirmed: ${email}`);

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
