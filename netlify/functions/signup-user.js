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
        console.error('⚠️ CRITICAL: RESEND_API_KEY not configured in Netlify!');
        console.error('User created but verification email CANNOT be sent');
        console.error('Verification token:', verificationToken);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Email service not configured. Please contact administrator.',
            details: 'RESEND_API_KEY missing from environment variables'
          })
        };
      }
      
      const origin = event.headers.origin || event.headers.referer?.split('/').slice(0, 3).join('/') || 'https://fusion.paperfrogs.dev';
      const verificationUrl = `${origin}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      console.log('📧 Attempting to send verification email to:', email);
      console.log('🔗 Verification URL:', verificationUrl);
      console.log('🔑 RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
      console.log('🔑 Key starts with:', process.env.RESEND_API_KEY?.substring(0, 8) + '...');
      
      // Try with custom domain first, fallback to resend.dev if it fails
      let emailResponse = await fetch('https://api.resend.com/emails', {
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

      let emailResult = await emailResponse.json();
      
      // If custom domain fails with verification error, try resend.dev fallback
      if (!emailResponse.ok && emailResult.message && emailResult.message.includes('not verified')) {
        console.log('⚠️ Custom domain not verified, trying resend.dev fallback...');
        
        emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Fusion <onboarding@resend.dev>',
            to: [email],
            subject: 'Verify Your Fusion Account',
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
        
        emailResult = await emailResponse.json();
      }
      
      if (!emailResponse.ok) {
        console.error('❌ Failed to send verification email. Status:', emailResponse.status);
        console.error('❌ Resend API error:', JSON.stringify(emailResult, null, 2));
        
        // Check if it's a testing mode restriction
        if (emailResult.message && (emailResult.message.includes('testing emails') || emailResult.message.includes('verify a domain'))) {
          console.log('⚠️ Resend is in testing mode - auto-verifying user to allow signup');
          
          // Auto-verify the user since we can't send emails in testing mode
          await supabase
            .from('users')
            .update({ 
              email_verified: true, 
              account_status: 'active' 
            })
            .eq('id', newUser.id);
          
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
              success: true,
              userId: newUser.id,
              message: 'Account created successfully! You can now login.',
              warning: 'Email verification temporarily disabled - contact admin to enable production emails'
            })
          };
        }
        
        // For other errors, delete the user
        await supabase.from('users').delete().eq('id', newUser.id);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Failed to send verification email',
            details: emailResult.message || 'Email service error',
            hint: 'Please check your email address or contact support'
          })
        };
      }
      
      console.log('✅ Verification email sent successfully!');
      console.log('✅ Email ID:', emailResult.id);
      console.log('✅ To:', email);
      
      // Send welcome email after successful verification email
      try {
        console.log('📧 Sending welcome email...');
        const welcomeResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Fusion <noreply@paperfrogs.dev>',
            to: [email],
            subject: 'Welcome to Fusion - Your Account is Ready!',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 32px; }
                    .content { padding: 40px 30px; }
                    .feature { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                    .feature h3 { margin-top: 0; color: #667eea; }
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
                    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🎉 Welcome to Fusion!</h1>
                    </div>
                    <div class="content">
                      <h2>Hey ${fullName}! 👋</h2>
                      <p><strong>Your Fusion account has been successfully created!</strong></p>
                      
                      <p>You're now part of the future of audio verification and protection. Here's what you can do with Fusion:</p>
                      
                      <div class="feature">
                        <h3>🎵 Upload & Protect Your Audio</h3>
                        <p>Upload your music, voice recordings, or any audio content and get blockchain-backed verification.</p>
                      </div>
                      
                      <div class="feature">
                        <h3>🔐 Cryptographic Provenance</h3>
                        <p>Every upload gets a unique fingerprint and tamper detection. Your work is protected.</p>
                      </div>
                      
                      <div class="feature">
                        <h3>📊 Real-time Verification</h3>
                        <p>Verify authenticity of any audio file in seconds with our advanced detection system.</p>
                      </div>
                      
                      <div class="feature">
                        <h3>🔑 API Access</h3>
                        <p>Your API Key: <code style="background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-size: 12px;">${apiKey}</code></p>
                        <p style="font-size: 13px; color: #666; margin-top: 10px;">Keep this key secure - you'll need it for API integrations.</p>
                      </div>
                      
                      <p style="text-align: center; margin-top: 30px;">
                        <a href="${origin}/user-login" class="button">Get Started Now</a>
                      </p>
                      
                      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
                        <strong>Need help getting started?</strong><br>
                        Check out our documentation or contact support at fusion@paperfrogs.dev
                      </p>
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
        
        const welcomeResult = await welcomeResponse.json();
        if (welcomeResponse.ok) {
          console.log('✅ Welcome email sent! ID:', welcomeResult.id);
        } else {
          console.log('⚠️ Welcome email failed (non-critical):', welcomeResult.message);
        }
      } catch (welcomeError) {
        console.log('⚠️ Welcome email error (non-critical):', welcomeError.message);
        // Don't fail signup if welcome email fails
      }
      
    } catch (emailError) {
      console.error('❌ Email sending exception:', emailError);
      console.error('❌ Stack trace:', emailError.stack);
      
      // Delete the user since we couldn't send verification email
      await supabase.from('users').delete().eq('id', newUser.id);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to send verification email',
          details: emailError.message,
          hint: 'Email service is not responding. Please try again later.'
        })
      };
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
