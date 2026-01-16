// Revoke API Key
// Permanently revokes an API key (cannot be undone)

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
    const { keyId, organizationId, revokedBy } = JSON.parse(event.body);

    if (!keyId || !organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Key ID and organization ID are required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the key exists and belongs to the organization
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, revoked_at')
      .eq('id', keyId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !existingKey) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'API key not found' }),
      };
    }

    if (existingKey.revoked_at) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'API key is already revoked' }),
      };
    }

    // Revoke the key
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy,
      })
      .eq('id', keyId)
      .eq('organization_id', organizationId);

    if (updateError) {
      console.error('Supabase error:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to revoke API key' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'API key revoked successfully',
      }),
    };
  } catch (error) {
    console.error('Revoke API key error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
