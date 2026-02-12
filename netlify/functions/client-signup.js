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
    const { email, fullName, organizationName, password, acceptedTerms } = JSON.parse(event.body);

    if (!email || !fullName || !organizationName || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email, full name, organization name, and password are required' })
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    if (!acceptedTerms) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'You must accept the terms and privacy policy' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('client_users')
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

    // Hash the password provided by user
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create organization
    const orgSlug = organizationName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + crypto.randomBytes(4).toString('hex');

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: organizationName,
        slug: orgSlug,
        organization_type: 'business',
        account_status: 'pending_approval',
        plan_type: 'free',
        billing_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        quota_verifications_monthly: 1000,
        quota_used_current_month: 0,
        quota_reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create organization' })
      };
    }

    // Create user
    const { data: user, error: userError } = await supabase
      .from('client_users')
      .insert([{
        email: email.toLowerCase(),
        full_name: fullName,
        password_hash: passwordHash,
        email_verified: false,
        email_verification_token: verificationToken,
        account_status: 'pending_approval',
        accepted_terms_version: 'v1.0',
        accepted_terms_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      // Cleanup organization
      await supabase.from('organizations').delete().eq('id', organization.id);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create user account' })
      };
    }

    // Add user as owner of organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert([{
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
        invited_by: user.id
      }]);

    if (memberError) {
      console.error('Error adding organization member:', memberError);
    }

    // Create sandbox and production environments
    await supabase.from('environments').insert([
      {
        organization_id: organization.id,
        name: 'sandbox',
        display_name: 'Sandbox',
        description: 'Test environment for development',
        is_production: false
      },
      {
        organization_id: organization.id,
        name: 'production',
        display_name: 'Production',
        description: 'Live production environment',
        is_production: true
      }
    ]);

    // Update organization with creator
    await supabase
      .from('organizations')
      .update({ created_by: user.id })
      .eq('id', organization.id);

    // TODO: Send verification email with magic link
    // For now, return the verification token (in production, send via email)

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        userId: user.id,
        organizationId: organization.id,
        message: 'Your business account application has been submitted. We will review your application and notify you once approved.'
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
