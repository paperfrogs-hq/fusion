import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");

    if (!email || !email.includes("@")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid email" }) };
    }

    // 1. Save to 'early_access_signups'
    const { error: dbError } = await supabase
      .from("early_access_signups") // 👈 MATCHED YOUR TABLE NAME
      .insert([
        { 
          email: email.toLowerCase(),
          confirmed: false // 👈 Added based on your previous code
        }
      ]);

    if (dbError) {
      if (dbError.code === "23505") { // Unique violation code
        return { statusCode: 400, body: JSON.stringify({ error: "Email already registered" }) };
      }
      throw dbError;
    }

    // 2. Send Email
    await resend.emails.send({
      from: "Fusion Dev Team <info@fusion.paperfrogs.dev>",
      to: [email],
      replyTo: "help@paperfrogs.dev",
      subject: "Welcome to Fusion Early Access! 🎵",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1>Welcome to Fusion!</h1>
          <p>You have been added to the early access list.</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

export { handler };
/*
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

interface RequestBody {
  email: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || "{}") as RequestBody;

    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("Resend API key not configured");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Email service not configured",
        }),
      };
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #070B14; color: #E4E6EB; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22E6C3; font-size: 28px; margin: 0;">Welcome to Fusion!</h1>
        </div>
        
        <div style="background: rgba(34, 230, 195, 0.1); border: 1px solid rgba(34, 230, 195, 0.3); border-radius: 12px; padding: 30px; text-align: center;">
          <p style="font-size: 16px; margin: 0 0 20px 0; color: #E4E6EB;">
            Thank you for joining the waitlist for <strong>Fusion</strong> – the trust layer for audio in the AI era.
          </p>
          
          <p style="font-size: 14px; margin: 20px 0; color: #B0B3B8;">
            You've taken an important step toward being part of the next generation of audio authentication.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: rgba(79, 140, 255, 0.05); border-left: 4px solid #4F8CFF; border-radius: 8px;">
          <p style="font-size: 14px; margin: 0; color: #B0B3B8;">
            <strong style="color: #22E6C3;">What's next?</strong><br />
            Keep an eye on your inbox for updates about our launch and exclusive early access opportunities.
          </p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
          <p style="font-size: 12px; color: #6B7280; margin: 0 0 10px 0;">
            This is an automated message from <strong>Fusion</strong>
          </p>
          <p style="font-size: 12px; color: #6B7280; margin: 0;">
            © 2025 Paperfrogs HQ. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "info@fusion.paperfrogs.dev",
        to: email,
        subject: "Welcome to Fusion Early Access! 🎵",
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to send email",
        }),
      };
    }

    const result = await response.json();
    console.log("Email sent successfully:", result.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Email sent successfully",
      }),
    };
  } catch (error) {
    console.error("Error in send-welcome function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

export { handler };
*/