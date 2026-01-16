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

    // Generate API key and verification token for user
    const apiKey = `fus_${crypto.randomBytes(32).toString('hex')}`;
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        full_name: fullName,
        user_type: userType,
        password_hash: passwordHash,
        api_key: apiKey,
        email_verified: false,
        verification_token: verificationToken,
        account_status: 'pending_verification'
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
    let emailSent = false;
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
      } else {
        const verificationUrl = `${event.headers.origin || 'https://fusion.paperfrogs.dev'}/verify-email?token=${verificationToken}`;
        
        console.log('Sending verification email to:', email);
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Fusion <noreply@paperfrogs.dev>',
            to: [email],
            subject: 'Verify Your Fusion Account',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .logo { text-align: center; margin-bottom: 30px; }
                    .button { 
                      display: inline-block; 
                      padding: 12px 30px; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; 
                      text-decoration: none; 
                      border-radius: 6px;
                      margin: 20px 0;
                    }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="logo">
                      <h1 style="color: #667eea;">🎵 Fusion</h1>
                    </div>
                    <h2>Welcome to Fusion, ${fullName}!</h2>
                    <p>Thank you for signing up. Please verify your email address to activate your account and start protecting your audio content.</p>
                    <p style="text-align: center;">
                      <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                    <div class="footer">
                      <p>© 2026 Fusion by Paperfrogs. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResponse.ok) {
          console.error('Resend API error:', emailResponse.status, emailResult);
        } else {
          console.log('Verification email sent successfully:', emailResult.id);
          emailSent = true;
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
        emailSent: emailSent,
        message: emailSent 
          ? 'Account created successfully. Please check your email to verify your account.'
          : 'Account created successfully. Email verification failed - please contact support for manual verification.',
        verificationToken: !emailSent ? verificationToken : undefined // Include token if email failed for manual verification
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
