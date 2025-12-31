const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  console.log("Test New Year email function triggered");
  
  try {
    const testEmail = "gopalmajumdarjoy@gmail.com";

    console.log(`Sending test New Year email to: ${testEmail}`);

    const response = await resend.emails.send({
      from: "Fusion Developer Team <info@fusion.paperfrogs.dev>",
      to: testEmail,
      subject: "Happy New Year from the Fusion Team ✨🙌",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Happy New Year from the Fusion Team</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2d2d2d;
                background: #f8f8f8;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
              }
              .header {
                background: linear-gradient(135deg, #1a4d2e 0%, #0d3b1f 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                font-size: 48px;
                margin: 0 0 10px 0;
                font-weight: 700;
                letter-spacing: 2px;
              }
              .header-subtitle {
                font-size: 18px;
                font-style: italic;
                opacity: 0.9;
                margin-top: 10px;
              }
              .content {
                background: white;
                padding: 40px;
                border-radius: 0 0 8px 8px;
              }
              .greeting {
                font-size: 18px;
                font-weight: 500;
                margin-bottom: 20px;
                color: #1a4d2e;
              }
              .body-text {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 20px;
                color: #444;
              }
              .highlight-box {
                background: #f0f8f4;
                border-left: 4px solid #1a4d2e;
                padding: 20px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .highlight-box p {
                margin: 0;
                color: #1a4d2e;
                font-weight: 500;
              }
              .signature {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              .signature-name {
                font-weight: 600;
                color: #1a4d2e;
                margin-bottom: 10px;
              }
              .footer {
                background: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
                border-radius: 0 0 8px 8px;
              }
              .footer-divider {
                margin: 15px 0;
                color: #999;
              }
              .footer-text {
                margin: 5px 0;
              }
              .tagline {
                font-style: italic;
                color: #999;
                font-size: 13px;
              }
              a {
                color: #1a4d2e;
                text-decoration: none;
              }
              a:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Happy New Year</h1>
                <p class="header-subtitle">Trust embedded in action</p>
              </div>

              <div class="content">
                <p class="greeting">Hello,</p>

                <p class="body-text">
                  As we step into a new year, we wanted to take a moment to thank you for being part of Fusion's early journey.
                </p>

                <p class="body-text">
                  You're currently on our waitlist, and we truly appreciate your patience and interest. Fusion is being built carefully and deliberately — as infrastructure that creates trust in audio, not just another tool. That means moving thoughtfully, validating our foundations, and making sure what we release is reliable, secure, and worthy of real-world use.
                </p>

                <div class="highlight-box">
                  <p>Over the coming months, we'll be sharing updates on our progress, including milestones around verification, provenance guarantees, and early access opportunities. When Fusion opens more broadly, you'll be among the first to hear from us.</p>
                </div>

                <p class="body-text">
                  Thank you for believing in the idea that truth should be embedded at creation — and verifiable anywhere later.
                </p>

                <p class="body-text">
                  We wish you a calm, focused, and meaningful New Year ahead. ✨
                </p>

                <div class="signature">
                  <p class="signature-name">Warm regards,</p>
                  <p style="margin: 0 0 5px 0; font-weight: 600;">Fusion Team</p>
                  <p style="margin: 0; color: #666;">Paperfrogs — we build tools for things that matter</p>
                </div>
              </div>

              <div class="footer">
                <div class="footer-text">
                  <strong>Paperfrogs HQ</strong>
                </div>
                <div class="footer-text">Think. Build. Evolve.</div>
                <div class="footer-divider">—</div>
                <div class="footer-text">
                  <a href="https://paperfrogs.dev">paperfrogs.dev</a>
                </div>
                <div class="tagline" style="margin-top: 15px;">
                  You're receiving this because you're on the Fusion waitlist
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (response.error) {
      console.error(`Failed to send test email:`, response.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: response.error }),
      };
    }

    console.log(`Test email sent successfully to: ${testEmail}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Test email sent successfully",
        email: testEmail,
        id: response.data?.id,
      }),
    };
  } catch (error) {
    console.error("Error in test function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};