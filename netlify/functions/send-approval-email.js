const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
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
    const { email, name, organizationName, approved, reason } = body;

    // Validate required fields
    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    const userName = name || email.split("@")[0];
    const orgName = organizationName || "your organization";

    let subject, htmlContent;

    if (approved) {
      // Approval email
      subject = "Your Fusion Business Account Has Been Approved!";
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Account Approved</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2d2d2d;
                background: #f8f8f8;
                padding: 20px;
              }
              .container { max-width: 580px; margin: 0 auto; }
              .box {
                background: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              }
              .logo {
                font-size: 28px;
                font-weight: 700;
                color: #2d2d2d;
                margin-bottom: 30px;
              }
              .logo span { color: #6366f1; }
              h1 {
                font-size: 24px;
                color: #10B981;
                margin-bottom: 20px;
              }
              p { margin-bottom: 16px; color: #4a4a4a; }
              .highlight {
                background: #f0fdf4;
                border-left: 4px solid #10B981;
                padding: 16px;
                margin: 24px 0;
                border-radius: 0 8px 8px 0;
              }
              .button {
                display: inline-block;
                background: #6366f1;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 13px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="box">
                <div class="logo">Fusion<span>.</span></div>
                <h1>🎉 Your Account is Approved!</h1>
                <p>Hi ${userName},</p>
                <p>Great news! Your business account for <strong>${orgName}</strong> has been approved.</p>
                <div class="highlight">
                  <p style="margin: 0;"><strong>You can now log in</strong> to your Fusion dashboard and start using all the features available to your business account.</p>
                </div>
                <p>Here's what you can do now:</p>
                <ul style="margin: 16px 0; padding-left: 20px; color: #4a4a4a;">
                  <li>Access your business dashboard</li>
                  <li>Upload and manage audio files</li>
                  <li>Use AI-powered audio verification</li>
                  <li>Generate provenance certificates</li>
                </ul>
                <a href="https://fusion.paperfrogs.dev/client/login" class="button">Log In to Your Account</a>
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                <div class="footer">
                  <p>Welcome to Fusion!</p>
                  <p>The Fusion Team</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      // Rejection email
      subject = "Update on Your Fusion Business Account Application";
      const reasonText = reason
        ? `<div class="highlight" style="background: #fef2f2; border-left-color: #ef4444;">
             <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
           </div>`
        : "";

      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Application Update</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2d2d2d;
                background: #f8f8f8;
                padding: 20px;
              }
              .container { max-width: 580px; margin: 0 auto; }
              .box {
                background: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              }
              .logo {
                font-size: 28px;
                font-weight: 700;
                color: #2d2d2d;
                margin-bottom: 30px;
              }
              .logo span { color: #6366f1; }
              h1 {
                font-size: 24px;
                color: #2d2d2d;
                margin-bottom: 20px;
              }
              p { margin-bottom: 16px; color: #4a4a4a; }
              .highlight {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
                padding: 16px;
                margin: 24px 0;
                border-radius: 0 8px 8px 0;
              }
              .button {
                display: inline-block;
                background: #6366f1;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 13px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="box">
                <div class="logo">Fusion<span>.</span></div>
                <h1>Application Update</h1>
                <p>Hi ${userName},</p>
                <p>Thank you for your interest in Fusion. After reviewing your business account application for <strong>${orgName}</strong>, we were unable to approve it at this time.</p>
                ${reasonText}
                <p>If you believe this decision was made in error or would like to provide additional information, please don't hesitate to contact our support team.</p>
                <a href="https://fusion.paperfrogs.dev/contact" class="button">Contact Support</a>
                <p>We appreciate your understanding and hope to work with you in the future.</p>
                <div class="footer">
                  <p>Best regards,</p>
                  <p>The Fusion Team</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Send email
    const response = await resend.emails.send({
      from: "Fusion Team <info@fusion.paperfrogs.dev>",
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log("Approval email sent:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `${approved ? "Approval" : "Rejection"} email sent successfully`,
        id: response.id,
      }),
    };
  } catch (error) {
    console.error("Error sending approval email:", error);
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
