// Get Team Invitations for Organization
// Returns all pending invitations for an organization

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
    const { organizationId } = JSON.parse(event.body);

    if (!organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID is required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pending invitations (not accepted yet)
    const { data: invitations, error } = await supabase
      .from('organization_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        created_at,
        invited_by,
        client_users!organization_invitations_invited_by_fkey (
          full_name
        )
      `)
      .eq('organization_id', organizationId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch invitations' }),
      };
    }

    // Format the data
    const formattedInvitations = invitations.map(invite => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
      created_at: invite.created_at,
      invited_by_name: invite.client_users?.full_name || 'Unknown',
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        invitations: formattedInvitations,
        count: formattedInvitations.length
      }),
    };
  } catch (error) {
    console.error('Get invitations error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
