// Get Invitation Details
// Fetches invitation info by token (for preview)

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Get token from query params or body
    let token;
    if (event.httpMethod === 'GET') {
      token = event.queryStringParameters?.token;
    } else {
      const body = JSON.parse(event.body || '{}');
      token = body.token;
    }

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token is required' }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the invitation with organization details
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        accepted_at,
        created_at,
        organizations (
          id,
          name,
          slug,
          plan_type
        )
      `)
      .eq('invitation_token', token)
      .single();

    if (error || !invitation) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invitation not found' }),
      };
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ 
          error: 'Invitation already accepted',
          acceptedAt: invitation.accepted_at
        }),
      };
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ 
          error: 'Invitation has expired',
          expiredAt: invitation.expires_at
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expires_at,
          organization: invitation.organizations
        }
      }),
    };

  } catch (error) {
    console.error('Get invitation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
