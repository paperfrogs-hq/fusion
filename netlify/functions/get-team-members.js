// Get Team Members for Organization
// Returns all members of an organization with their roles and details

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

    // Get all members with user details
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        last_active_at,
        client_users (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch team members' }),
      };
    }

    // Flatten the data structure
    const formattedMembers = members.map(member => ({
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      last_active_at: member.last_active_at,
      email: member.client_users.email,
      full_name: member.client_users.full_name,
      avatar_url: member.client_users.avatar_url,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        members: formattedMembers,
        count: formattedMembers.length
      }),
    };
  } catch (error) {
    console.error('Get team members error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
