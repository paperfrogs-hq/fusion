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
      from: "Fusion Developer Team <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "Welcome to Fusion - Your Access is Confirmed",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Fusion</title>
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
              .content ul {
                margin: 20px 0;
                padding-left: 20px;
              }
              .content li {
                margin: 8px 0;
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
                transition: background 0.2s;
              }
              .button:hover {
                background: #0d3b1f;
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
              .footer strong {
                color: #2d2d2d;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Fusion</h1>
                <p>Audio Provenance Infrastructure</p>
              </div>
              <div class="content">
                <p>Hi ${email.split('@')[0]}!</p>
                
                <p>Thanks for your interest in Fusion.</p>
                
                <p>Fusion is being built as long-term infrastructure for audio provenance and verification — focused on integrity, traceability, and real-world use. We're currently developing core systems, testing capabilities, and shaping the foundation before broader access.</p>
                
                <p><strong>As we move forward:</strong></p>
                <ul>
                  <li>Early access invitations will be sent in phases</li>
                  <li>You'll receive updates as major milestones ship</li>
                  <li>Feedback from early users will help guide what Fusion becomes</li>
                </ul>
                
                <p>No action is required from you right now. When it's time, you'll hear from us.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://fusion.paperfrogs.dev" class="button">Request Early Access</a>
                </div>
                
                <p>Thanks for being here early and for supporting work that values authenticity by design.</p>
                
                <div class="signature">
                  <p style="margin: 0 0 8px 0;"><strong>Regards,</strong></p>
                  <p style="margin: 0;">Fusion Developer Team</p>
                  <p style="margin: 0;">Audio Provenance Infrastructure</p>
                </div>
              </div>
              <div class="footer">
                <p><strong>Paperfrogs Labs © 2025</strong></p>
                <p style="margin-top: 8px;">Building trust in the age of AI</p>
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
