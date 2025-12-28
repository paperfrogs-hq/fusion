import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface RequestBody {
  email: string;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email } = (await req.json()) as RequestBody;

    if (!email) {
      return new Response("Missing email", { status: 400 });
    }

    const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");
    const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN");

    if (!mailgunApiKey || !mailgunDomain) {
      throw new Error(
        "Mailgun credentials not configured. Set MAILGUN_API_KEY and MAILGUN_DOMAIN"
      );
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

    const formData = new FormData();
    formData.append("from", `noreply@${mailgunDomain}`);
    formData.append("to", email);
    formData.append("subject", "Welcome to Fusion Early Access! 🎵");
    formData.append("html", htmlContent);
    formData.append("o:reply-to", "support@fusion.dev");

    const response = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Mailgun API error:", errorData);
      throw new Error(`Mailgun API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully via Mailgun:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
