const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Initializing send-updates function");
console.log("Supabase URL present:", !!supabaseUrl);
console.log("Supabase Key present:", !!supabaseKey);
console.log("Resend API Key present:", !!process.env.RESEND_API_KEY);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Monthly update template - EASY TO EDIT
const getUpdateContent = () => {
  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return {
    subject: `Fusion Update — ${monthName}`,
    message: "Thank you for your continued interest in Fusion. We're actively building and refining our platform to ensure it meets the highest standards of security, reliability, and performance. Our team is working diligently on the foundation that will make authentic audio verification accessible and seamless.",
    nextSteps: "We're preparing for our early access program and will be reaching out to selected participants soon. Keep an eye on your inbox for more information."
  };
};

exports.handler = async (event) => {
  console.log("Send-updates function triggered");
  
  try {
    // Fetch all confirmed emails from waitlist
    console.log("Fetching waitlist emails from Supabase...");
    const { data: waitlistData, error: fetchError } = await supabase
      .from("early_access_signups")
      .select("email")
      .eq("confirmed", false);

    if (fetchError) {
      console.error("Error fetching emails:", fetchError);
      throw fetchError;
    }

    if (!waitlistData || waitlistData.length === 0) {
      console.log("No emails to send to");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No waitlist emails found" }),
      };
    }

    console.log(`Found ${waitlistData.length} emails to send to`);

    const updateContent = getUpdateContent();
    let successCount = 0;
    let failureCount = 0;
    const failures = [];

    // Send emails in batches (Resend rate limits)
    for (const record of waitlistData) {
      try {
        const email = record.email;
        const emailUsername = email.split('@')[0];

        console.log(`Sending update to: ${email}`);

        const response = await resend.emails.send({
          from: "Fusion Developer Team <info@fusion.paperfrogs.dev>",
          to: email,
          subject: updateContent.subject,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>${updateContent.subject}</title>
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
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="box">
                    <p class="greeting">Hi <strong>@${emailUsername}</strong>,</p>
                    
                    <p>${updateContent.message}</p>
                    
                    <p>${updateContent.nextSteps}</p>
                    
                    <p class="divider">—</p>
                    
                    <p>Regards,<br><strong>Fusion Developer Team</strong><br>Audio Provenance Infrastructure</p>
                    
                    <div class="footer">
                      <p>Paperfrogs Labs © 2025</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Email sent to ${email}:`, response.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${record.email}:`, error);
        failureCount++;
        failures.push({ email: record.email, error: error.message });
      }
    }

    console.log(`Update campaign complete: ${successCount} sent, ${failureCount} failed`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Monthly update sent`,
        successCount,
        failureCount,
        failures: failures.length > 0 ? failures : undefined,
      }),
    };
  } catch (error) {
    console.error("Error processing update campaign:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process update campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
