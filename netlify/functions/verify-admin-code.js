// Import verification codes from send-admin-code
const { verificationCodes } = require("./send-admin-code");

// Generate simple token
const generateToken = () => {
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { email, code } = JSON.parse(event.body || "{}");

    // Validate email domain
    if (!email || !email.endsWith("@paperfrogs.dev")) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Unauthorized email domain" }),
      };
    }

    // Get stored code
    const stored = verificationCodes.get(email);

    if (!stored) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No verification code found. Please request a new one." }),
      };
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      verificationCodes.delete(email);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Verification code expired. Please request a new one." }),
      };
    }

    // Verify code
    if (stored.code !== code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid verification code" }),
      };
    }

    // Code is valid, delete it and generate token
    verificationCodes.delete(email);
    const token = generateToken();

    console.log(`Admin login successful for ${email}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        token,
        email,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
