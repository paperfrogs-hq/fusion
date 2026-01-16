// Remove Team Member
// Removes a member from an organization

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
    const { organizationId, memberId } = JSON.parse(event.body);

    if (!organizationId || !memberId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and member ID are required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if member exists and get role
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

    // Prevent removing owner
    if (member.role === 'owner') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Cannot remove organization owner' }),
      };
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (deleteError) {
      console.error('Supabase error:', deleteError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to remove member' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Member removed successfully',
      }),
    };
  } catch (error) {
    console.error('Remove member error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
