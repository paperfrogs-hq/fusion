// Get API Keys for Organization and Environment
// Returns all API keys with their details (excluding full secrets)

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
    const { organizationId, environmentId } = JSON.parse(event.body);

    if (!organizationId || !environmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and environment ID are required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all API keys for this organization and environment
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('environment_id', environmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch API keys' }),
      };
    }

    // Never return full key hashes to the client
    const safeKeys = apiKeys.map(key => ({
      id: key.id,
      key_name: key.key_name,
      key_prefix: key.key_prefix,
      key_secret_partial: key.key_secret_partial,
      scopes: key.scopes,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      last_used_ip: key.last_used_ip,
      rate_limit_per_minute: key.rate_limit_per_minute,
      rate_limit_per_day: key.rate_limit_per_day,
      is_active: key.is_active,
      expires_at: key.expires_at,
      revoked_at: key.revoked_at,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        apiKeys: safeKeys,
        count: safeKeys.length
      }),
    };
  } catch (error) {
    console.error('Get API keys error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
