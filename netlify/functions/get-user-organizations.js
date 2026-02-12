// Get User Organizations Netlify Function
// Fetches all organizations for a user

const { createClient } = require('@supabase/supabase-js');

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
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Get user's organization memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations(
          id,
          name,
          slug,
          logo_url,
          plan_type,
          billing_status,
          trial_ends_at,
          account_status,
          quota_verifications_monthly,
          quota_used_current_month
        )
      `)
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch organizations' })
      };
    }

    // Format organizations
    const organizations = memberships
      .filter(m => m.organization)
      .map(m => ({
        ...m.organization,
        role: m.role
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ organizations })
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
