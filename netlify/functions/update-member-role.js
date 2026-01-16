// Update Member Role
// Changes the role of an organization member

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
    const { organizationId, memberId, newRole } = JSON.parse(event.body);

    if (!organizationId || !memberId || !newRole) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID, member ID, and new role are required' }),
      };
    }

    // Validate role
    const validRoles = ['admin', 'developer', 'analyst', 'read_only'];
    if (!validRoles.includes(newRole)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid role' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if member exists and get current role
    const { data: member, error: fetchError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !member) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Member not found' }),
      };
    }

    // Prevent changing owner role
    if (member.role === 'owner') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Cannot change owner role' }),
      };
    }

    // Update the role
    const { error: updateError } = await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (updateError) {
      console.error('Supabase error:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update role' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Role updated successfully',
        newRole: newRole,
      }),
    };
  } catch (error) {
    console.error('Update member role error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
