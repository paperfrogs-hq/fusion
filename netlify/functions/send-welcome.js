const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email using Resend
    const response = await resend.emails.send({
      from: "Paperfrogs <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Paperfrogs!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Paperfrogs</title>
          </head>
          <body>
            <h1>Welcome to Paperfrogs! 🐸</h1>
            <p>Thank you for joining our early access waitlist.</p>
            <p>We'll notify you as soon as we launch.</p>
            <p>Stay tuned!</p>
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
    console.error("Error sending email:", error);

    // Check for duplicate email error from database
    if (error instanceof Error && error.message.includes("already registered")) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email already registered" }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
