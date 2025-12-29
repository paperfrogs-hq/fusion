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

    // Send email using Resend
    console.log("Sending email via Resend...");
    const response = await resend.emails.send({
      from: "Paperfrogs <info@fusion.paperfrogs.dev>",
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
                line-height: 1.6;
                color: #333;
                background: #f5f5f5;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
              }
              .box {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #0066cc;
              }
              p {
                margin-bottom: 16px;
                font-size: 15px;
                line-height: 1.7;
              }
              ul {
                margin: 20px 0 20px 20px;
                list-style-position: inside;
              }
              li {
                margin-bottom: 10px;
                font-size: 15px;
                line-height: 1.7;
              }
              strong {
                color: #0066cc;
                font-weight: 600;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 13px;
                color: #666;
              }
              .signature {
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="box">
                <h1>Hi,</h1>
                
                <p>Thanks for your interest in <strong>Fusion</strong>.</p>
                
                <p><strong>Fusion</strong> is being built as long-term infrastructure for audio provenance and verification — focused on integrity, traceability, and real-world use. We're currently developing core systems, testing capabilities, and shaping the foundation before broader access.</p>
                
                <p>As we move forward:</p>
                <ul>
                  <li>Early access invitations will be sent in phases</li>
                  <li>You'll receive updates as major milestones ship</li>
                  <li>Feedback from early users will help guide what Fusion becomes</li>
                </ul>
                
                <p>No action is required from you right now. When it's time, you'll hear from us.</p>
                
                <p>Thanks for being here early and for supporting work that values authenticity by design.</p>
                
                <div class="footer">
                  <div class="signature">
                    <p>—</p>
                    <p><strong>Fusion Developer Team</strong><br>
                    Audio Provenance Infrastructure</p>
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
