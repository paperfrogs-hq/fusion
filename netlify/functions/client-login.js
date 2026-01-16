const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    const { email, password, rememberDevice, deviceId, totpCode } = JSON.parse(event.body);

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

    // Find user
    const { data: user, error: userError } = await supabase
      .from('client_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Log failed attempt
      if (user) {
        await supabase.from('login_history').insert([{
          user_id: user.id,
          login_method: 'password',
          success: false,
          failure_reason: 'invalid_credentials',
          ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
          user_agent: event.headers['user-agent']
        }]);
      }
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Check if account is active
    if (user.account_status !== 'active') {
      await supabase.from('login_history').insert([{
        user_id: user.id,
        login_method: 'password',
        success: false,
        failure_reason: 'account_suspended',
        ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
        user_agent: event.headers['user-agent']
      }]);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Account is suspended or pending verification' })
      };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      await supabase.from('login_history').insert([{
        user_id: user.id,
        login_method: 'password',
        success: false,
        failure_reason: 'invalid_credentials',
        ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
        user_agent: event.headers['user-agent']
      }]);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Check if 2FA is enabled and code is required
    if (user.totp_enabled && !totpCode) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          requires2FA: true,
          message: 'Please provide 2FA code' 
        })
      };
    }

    // Verify 2FA code if provided
    if (user.totp_enabled && totpCode) {
      const speakeasy = require('speakeasy');
      
      const verified = speakeasy.totp.verify({
        secret: user.totp_secret,
        encoding: 'base32',
        token: totpCode,
        window: 2 // Allow 2 time steps before/after for clock skew
      });

      if (!verified) {
        await supabase.from('login_history').insert([{
          user_id: user.id,
          login_method: '2fa',
          success: false,
          failure_reason: 'invalid_2fa_code',
          ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
          user_agent: event.headers['user-agent']
        }]);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid 2FA code' })
        };
      }
    }

    // Get user's organizations
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'No organization access' })
      };
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (rememberDevice ? 720 : 24)); // 30 days or 24 hours

    // Create session (will choose org later)
    const { error: sessionError } = await supabase
      .from('client_sessions')
      .insert([{
        user_id: user.id,
        session_token: sessionToken,
        device_id: deviceId,
        device_name: event.headers['user-agent']?.substring(0, 200),
        ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
        user_agent: event.headers['user-agent'],
        is_trusted_device: rememberDevice || false,
        expires_at: expiresAt.toISOString()
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create session' })
      };
    }

    // Update user login info
    await supabase
      .from('client_users')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
        last_login_device: event.headers['user-agent']?.substring(0, 200),
        login_count: user.login_count + 1
      })
      .eq('id', user.id);

    // Log successful login
    await supabase.from('login_history').insert([{
      user_id: user.id,
      login_method: user.totp_enabled ? '2fa' : 'password',
      success: true,
      ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      user_agent: event.headers['user-agent'],
      device_id: deviceId
    }]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionToken,
        requires2FA: user.totp_enabled,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url
        },
        organizations: memberships.map(m => ({
          id: m.organizations.id,
          name: m.organizations.name,
          slug: m.organizations.slug,
          role: m.role,
          planType: m.organizations.plan_type
        }))
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
