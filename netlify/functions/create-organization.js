// Create Organization Netlify Function
// Creates a new organization for an existing logged-in user

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { userId, name, slug } = JSON.parse(event.body);

    if (!userId || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID and organization name are required' })
      };
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('client_users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Generate unique slug
    const baseSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const orgSlug = baseSlug + '-' + crypto.randomBytes(4).toString('hex');

    // Check if slug is already taken
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();

    if (existingOrg) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization slug already exists' })
      };
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: name.trim(),
        slug: orgSlug,
        organization_type: 'business',
        account_status: 'pending_approval',
        plan_type: 'free',
        billing_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
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
      // Cleanup organization
      await supabase.from('organizations').delete().eq('id', organization.id);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to add user to organization' })
      };
    }

    // Create sandbox and production environments
    const { error: envError } = await supabase
      .from('environments')
      .insert([
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

    if (envError) {
      console.error('Error creating default environment:', envError);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
