const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Support both GET and POST methods
    const params = event.httpMethod === 'GET' 
      ? event.queryStringParameters 
      : JSON.parse(event.body);

    const { token, email } = params;

    if (!token || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token and email are required' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Check if already verified
    if (user.email_verified) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Email already verified',
          alreadyVerified: true
        })
      };
    }

    // Verify token from metadata
    const storedToken = user.metadata?.verification_token;
    
    if (!storedToken || storedToken !== token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired verification token' })
      };
    }

    // Update user as verified
    const newMetadata = { ...user.metadata };
    delete newMetadata.verification_token;
    newMetadata.verified_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        account_status: 'active',
        metadata: newMetadata
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to verify email' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email verified successfully! You can now log in.'
      })
    };

  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Verification token is required' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Find user with this verification token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired verification token' })
      };
    }

    // Check if already verified
    if (user.email_verified) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Email already verified. You can now log in.' 
        })
      };
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verified_at: new Date().toISOString(),
        account_status: 'active'
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Failed to verify email');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Email verified successfully! You can now log in.' 
      })
    };

  } catch (error) {
    console.error('Email verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to verify email' })
    };
  }
};
