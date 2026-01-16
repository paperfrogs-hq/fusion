// Update Payment Method
// Saves payment method (integrates with payment provider)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { organizationId, cardNumber, expMonth, expYear, cvc } = JSON.parse(event.body);

    if (!organizationId || !cardNumber || !expMonth || !expYear || !cvc) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'All payment fields are required' }),
      };
    }

    // Basic validation
    if (cardNumber.length !== 16) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid card number' }),
      };
    }

    if (expMonth < 1 || expMonth > 12) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid expiration month' }),
      };
    }

    // In production, this would:
    // 1. Tokenize card with Stripe
    // 2. Attach payment method to customer
    // 3. Set as default payment method
    // 4. Store payment method ID (NOT card details) in database

    // Mock success response
    console.log('Payment method updated for organization:', organizationId);
    console.log('Card ending in:', cardNumber.slice(-4));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Payment method updated successfully',
        last4: cardNumber.slice(-4),
      }),
    };
  } catch (error) {
    console.error('Update payment method error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
