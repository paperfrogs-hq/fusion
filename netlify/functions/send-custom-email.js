const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Initializing send-custom-email function");
console.log("Supabase URL present:", !!supabaseUrl);
console.log("Supabase Key present:", !!supabaseKey);
console.log("Resend API Key present:", !!process.env.RESEND_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  console.log("Send-custom-email function called");

  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { userEmail, userName, subject, message, adminEmail } = body;

    console.log("Processing custom email to:", userEmail);
    console.log("From admin:", adminEmail);

    // Validate required fields
    if (!userEmail || !userEmail.includes("@")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid recipient email address" }),
      };
    }

    if (!subject || subject.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Subject is required" }),
      };
    }

    if (!message || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    // Format the message with proper HTML
    const formattedMessage = message.replace(/\n/g, "<br>");

    // Send email using Resend
    console.log("Sending custom email via Resend...");
    const response = await resend.emails.send({
      from: "Fusion Team <info@fusion.paperfrogs.dev>",
      to: userEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${subject}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.5;
                color: #2d2d2d;
                background: #f8f8f8;
                padding: 20px;
              }
              .container {
                max-width: 580px;
                margin: 0 auto;
              }
              .box {
                background: white;
                border-radius: 8px;
                padding: 32px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
              }
              .header {
                text-align: center;
                margin-bottom: 24px;
              }
              .logo {
                font-size: 24px;
                font-weight: 700;
                color: #000;
              }
              .logo span {
                color: #6366f1;
              }
              p {
                margin-bottom: 12px;
                font-size: 14px;
                line-height: 1.6;
              }
              .greeting {
                margin-bottom: 16px;
              }
              .message-content {
                background: #f9fafb;
                border-radius: 6px;
                padding: 20px;
                margin: 16px 0;
                border-left: 3px solid #6366f1;
              }
              .signature {
                margin-top: 24px;
                color: #6b7280;
                font-size: 13px;
              }
              .footer {
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #9ca3af;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="box">
                <div class="header">
                  <div class="logo">Fusion<span>.</span></div>
                </div>
                
                <p class="greeting">Hi${userName ? ` ${userName}` : ''},</p>
                
                <div class="message-content">
                  ${formattedMessage}
                </div>
                
                <div class="signature">
                  <p>Best regards,</p>
                  <p><strong>The Fusion Team</strong></p>
                </div>
                
                <div class="footer">
                  <p>This is a message from Fusion Audio Authentication</p>
                  <p>© ${new Date().getFullYear()} Paperfrogs Labs. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Resend response:", JSON.stringify(response, null, 2));

    // Log the email action in admin_audit_log if table exists
    try {
      await supabase.from("admin_audit_log").insert({
        admin_email: adminEmail,
        action: "send_custom_email",
        target_email: userEmail,
        details: { subject, message_preview: message.substring(0, 100) },
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.log("Could not log to admin_audit_log:", logError.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Email sent successfully",
        id: response.data?.id,
      }),
    };
  } catch (error) {
    console.error("Error sending custom email:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to send email",
        details: error.message,
      }),
    };
  }
};
