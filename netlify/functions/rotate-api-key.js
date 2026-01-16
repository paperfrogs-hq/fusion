// Rotate API Key
// Generates a new key and marks the old one as rotated

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generateAPIKey(prefix) {
  const randomBytes = crypto.randomBytes(32);
  const keySecret = randomBytes.toString('hex');
  return `${prefix}${keySecret}`;
}

function hashAPIKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

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
    const { keyId, organizationId } = JSON.parse(event.body);

    if (!keyId || !organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Key ID and organization ID are required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the old key details
    const { data: oldKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !oldKey) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'API key not found' }),
      };
    }

    if (oldKey.revoked_at) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Cannot rotate a revoked key' }),
      };
    }

    // Generate new key with same prefix
    const newFullKey = generateAPIKey(oldKey.key_prefix);
    const newKeyHash = hashAPIKey(newFullKey);
    const newKeySecretPartial = newFullKey.slice(-4);

    // Revoke the old key
    await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', keyId);

    // Create new key with same settings
    const { data: newKey, error: createError } = await supabase
      .from('api_keys')
      .insert({
        organization_id: oldKey.organization_id,
        environment_id: oldKey.environment_id,
        key_name: `${oldKey.key_name} (Rotated)`,
        key_prefix: oldKey.key_prefix,
        key_hash: newKeyHash,
        key_secret_partial: newKeySecretPartial,
        scopes: oldKey.scopes,
        created_by: oldKey.created_by,
        is_active: true,
        rate_limit_per_minute: oldKey.rate_limit_per_minute,
        rate_limit_per_day: oldKey.rate_limit_per_day,
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase error:', createError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create new key' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'API key rotated successfully',
        newKey: newFullKey, // Only returned once!
        apiKey: {
          id: newKey.id,
          key_name: newKey.key_name,
          key_prefix: newKey.key_prefix,
          key_secret_partial: newKey.key_secret_partial,
          scopes: newKey.scopes,
          created_at: newKey.created_at,
        },
      }),
    };
  } catch (error) {
    console.error('Rotate API key error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
