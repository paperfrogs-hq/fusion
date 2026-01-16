const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory store for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");

    // Validate email
    if (!email || !email.endsWith("@paperfrogs.dev")) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Unauthorized email domain" }),
      };
    }

    // Generate verification code
    const code = generateCode();
    
    // Store code with expiration (5 minutes)
    verificationCodes.set(email, {
      code,
      expires: Date.now() + 5 * 60 * 1000,
    });

    // Send email with verification code
    await resend.emails.send({
      from: "Fusion Admin <info@fusion.paperfrogs.dev>",
      to: email,
      subject: "Admin Login Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Admin Login Code</title>
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
                text-align: center;
              }
              .code {
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1a4d2e;
                background: #f0f8f4;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                font-family: 'Courier New', monospace;
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
                <h1>Admin Login</h1>
                <p>Fusion by Paperfrogs HQ</p>
              </div>
              <div class="content">
                <p style="font-size: 18px; margin-bottom: 10px;">Your verification code is:</p>
                <div class="code">${code}</div>
                <p style="color: #666; font-size: 14px;">
                  This code will expire in 5 minutes.<br>
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
              <div class="footer">
                <p><strong>Paperfrogs HQ</strong></p>
                <p>Secure Admin Access</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`Verification code sent to ${email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Code sent" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};

// Export the codes map for verification function
module.exports.verificationCodes = verificationCodes;
