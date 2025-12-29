const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Initializing send-welcome function");
console.log("Supabase URL present:", !!supabaseUrl);
console.log("Supabase Key present:", !!supabaseKey);
console.log("Resend API Key present:", !!process.env.RESEND_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  console.log("Send-welcome function called");
  
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { email } = body;

    console.log("Processing email:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    // Insert email into Supabase
    console.log("Inserting into Supabase...");
    const { data: dbData, error: dbError } = await supabase
      .from("early_access_signups")
      .upsert(
        [
          {
            email: email.toLowerCase(),
            confirmed: false,
          },
        ],
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Database upsert error:", dbError);
      // Check if it's a duplicate key error
      if (dbError.code === "23505" || dbError.message.includes("duplicate")) {
        return {
          statusCode: 409,
          body: JSON.stringify({ message: "Email already registered" }),
        };
      }
      throw dbError;
    }

    console.log("Supabase insert successful");

    // Extract username from email
    const emailUsername = email.split('@')[0];
    console.log("Email username extracted:", emailUsername);

    // Send email using Resend
    console.log("Sending email via Resend...");
    const response = await resend.emails.send({
      from: "Fusion Developer Team <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "You're on the Fusion waitlist",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>You're on the Fusion waitlist</title>
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
              p {
                margin-bottom: 12px;
                font-size: 14px;
                line-height: 1.6;
              }
              .greeting {
                margin-bottom: 16px;
              }
              strong {
                color: #000;
                font-weight: 600;
              }
              ul {
                margin: 14px 0 14px 20px;
                list-style: disc;
              }
              li {
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 1.6;
              }
              .divider {
                margin: 16px 0;
                color: #999;
              }
              .footer {
                margin-top: 20px;
                padding-top: 12px;
                border-top: 1px solid #f0f0f0;
                font-size: 12px;
                color: #888;
              }
              .signature {
                margin-top: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="box">
                <p class="greeting">Hi <strong>@${emailUsername}</strong>,</p>
                
                <p>Thanks for your interest in <strong>Fusion</strong>.</p>
                
                <p>Fusion is being built as long-term infrastructure for audio provenance and verification — focused on integrity, traceability, and real-world use. We're currently developing core systems, testing capabilities, and shaping the foundation before broader access.</p>
                
                <p>As we move forward:</p>
                <ul>
                  <li>Early access invitations will be sent in phases</li>
                  <li>You'll receive updates as major milestones ship</li>
                  <li>Feedback from early users will help guide what Fusion becomes</li>
                </ul>
                
                <p>No action is required from you right now. When it's time, you'll hear from us.</p>
                
                <p>Thanks for being here early and for supporting work that values authenticity by design.</p>
                
                <p class="divider">—</p>
                
                <p>Regards,<br><strong>Fusion Developer Team</strong><br>Audio Provenance Infrastructure</p>
                
                <div class="footer">
                  <div class="signature">
                    <p>Paperfrogs Labs © 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", response.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Welcome email sent successfully",
        emailId: response.id,
      }),
    };
  } catch (error) {
    console.error("Error processing request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
