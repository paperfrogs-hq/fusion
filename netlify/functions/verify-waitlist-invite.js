const crypto = require("crypto");

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify signed invite token
function verifySignedToken(token) {
  try {
    const secret = process.env.INVITE_SECRET || supabaseServiceKey.slice(0, 32);
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('|');
    
    if (parts.length !== 4) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    const [email, signupType, expiresAt, signature] = parts;
    
    // Verify signature
    const payload = `${email}|${signupType}|${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }
    
    // Check expiry
    if (Date.now() > parseInt(expiresAt)) {
      return { valid: false, error: 'This invitation has expired. Please contact support for a new invitation.' };
    }
    
    return { valid: true, email, signupType };
  } catch (err) {
    return { valid: false, error: 'Invalid token' };
  }
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { token } = JSON.parse(event.body || "{}");

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Token is required" }),
      };
    }

    // Verify the signed token
    const result = verifySignedToken(token);

    if (!result.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: result.error }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        valid: true,
        email: result.email,
        signupType: result.signupType
      }),
    };
  } catch (error) {
    console.error("Verify invite error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to verify invitation" }),
    };
  }
};
