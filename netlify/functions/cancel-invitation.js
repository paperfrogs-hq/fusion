// Cancel Invitation
// Cancels a pending team invitation

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
    const { invitationId } = JSON.parse(event.body);

    if (!invitationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invitation ID is required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete the invitation
    const { error } = await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', invitationId)
      .is('accepted_at', null); // Only delete if not already accepted

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to cancel invitation' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Invitation cancelled successfully',
      }),
    };
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
