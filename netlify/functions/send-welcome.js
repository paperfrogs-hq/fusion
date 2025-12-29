const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
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

    // Validate email
    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    // Insert email into Supabase
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

    // Send email using Resend
    const response = await resend.emails.send({
      from: "Paperfrogs <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "Welcome to Paperfrogs!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Paperfrogs</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 {
                color: #0066cc;
              }
              .footer {
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to Paperfrogs! 🐸</h1>
              <p>Thank you for joining our early access waitlist.</p>
              <p>We're building something special and we can't wait to share it with you.</p>
              <p>We'll notify you as soon as we launch.</p>
              <p>Stay tuned!</p>
              <div class="footer">
                <p>Paperfrogs Labs © 2025</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

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
