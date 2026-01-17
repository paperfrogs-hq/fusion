const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  // CORS headers
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' })
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
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Check if account is active
    if (user.account_status === 'suspended') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Account is suspended' })
      };
    }

    // Check if email is verified
    if (!user.email_verified) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          requiresVerification: true
        })
      };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    // Create session
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert([{
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
        user_agent: event.headers['user-agent']
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create session' })
      };
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionToken,
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type,
        apiKey: user.api_key
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
