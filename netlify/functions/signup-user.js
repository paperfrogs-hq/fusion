const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { checkSecurity } = require('./security-middleware');

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

  // Check for security threats
  const securityCheck = await checkSecurity(event, '/.netlify/functions/signup-user');
  if (securityCheck.blocked) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ 
        error: 'Request blocked for security reasons',
        reason: securityCheck.reason
      })
    };
  }

  try {
    // Log environment check (without exposing secrets)
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error. Please contact support.' })
      };
    }

    const { email, fullName, password, userType = 'creator' } = JSON.parse(event.body);

    if (!email || !fullName || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email, full name, and password are required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'Email already registered' })
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate API key and verification token
    const apiKey = `fus_${crypto.randomBytes(32).toString('hex')}`;
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user with pending verification
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        full_name: fullName,
        user_type: userType,
        password_hash: passwordHash,
        api_key: apiKey,
        email_verified: false,
        account_status: 'pending_verification',
        // Store verification token in metadata since column doesn't exist
        metadata: { verification_token: verificationToken }
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create account',
          details: createError.message || 'Unknown database error'
        })
      };
    }

    // Send verification email
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured - verification email not sent');
      } else {
        const verificationUrl = `${event.headers.origin || 'https://fusion.paperfrogs.dev'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Fusion <onboarding@resend.dev>',
            to: [email],
            subject: '✅ Verify Your Fusion Account',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; }
                    .button { 
                      display: inline-block; 
                      padding: 15px 40px; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white !important; 
                      text-decoration: none; 
                      border-radius: 8px;
                      font-weight: bold;
                      margin: 20px 0;
                      text-align: center;
                    }
                    .button:hover { opacity: 0.9; }
                    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🎵 Welcome to Fusion!</h1>
                    </div>
                    <div class="content">
                      <h2>Hi ${fullName}! 👋</h2>
                      <p>Thank you for signing up for Fusion! We're excited to have you on board.</p>
                      <p>To get started, please verify your email address by clicking the button below:</p>
                      <p style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                      </p>
                      <p>Or copy and paste this link into your browser:</p>
                      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">${verificationUrl}</p>
                      <p><strong>This link will expire in 24 hours.</strong></p>
                      <p>If you didn't create this account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                      <p>© 2026 Fusion by Paperfrogs. All rights reserved.</p>
                      <p>Blockchain-backed audio verification and protection</p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResponse.ok) {
          console.error('Failed to send verification email:', emailResult);
        } else {
          console.log('Verification email sent successfully');
        }
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        userId: newUser.id,
        message: 'Account created successfully! Please check your email to verify your account before logging in.'
      })
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
