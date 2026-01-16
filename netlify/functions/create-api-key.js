// Create API Key
// Generates a new API key with specified scopes and rate limits

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Generate a secure random API key
function generateAPIKey(prefix) {
  const randomBytes = crypto.randomBytes(32);
  const keySecret = randomBytes.toString('hex');
  return `${prefix}${keySecret}`;
}

// Hash the API key for storage
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
    const { 
      organizationId, 
      environmentId, 
      keyName, 
      scopes,
      createdBy 
    } = JSON.parse(event.body);

    if (!organizationId || !environmentId || !keyName || !scopes) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Organization ID, environment ID, key name, and scopes are required' 
        }),
      };
    }

    // Validate scopes
    const validScopes = ['verify', 'audit', 'extract_metadata', 'webhook_manage'];
    const invalidScopes = scopes.filter(s => !validScopes.includes(s));
    if (invalidScopes.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid scopes: ${invalidScopes.join(', ')}` }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get environment to determine key prefix
    const { data: environment, error: envError } = await supabase
      .from('environments')
      .select('is_production')
      .eq('id', environmentId)
      .single();

    if (envError || !environment) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Environment not found' }),
      };
    }

    // Generate key with appropriate prefix
    const keyPrefix = environment.is_production ? 'fus_live_' : 'fus_test_';
    const fullKey = generateAPIKey(keyPrefix);
    const keyHash = hashAPIKey(fullKey);
    
    // Store last 4 characters for display
    const keySecretPartial = fullKey.slice(-4);

    // Create API key record
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: organizationId,
        environment_id: environmentId,
        key_name: keyName,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        key_secret_partial: keySecretPartial,
        scopes: scopes,
        created_by: createdBy,
        is_active: true,
        rate_limit_per_minute: 100,
        rate_limit_per_day: 10000,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create API key' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'API key created successfully',
        fullKey: fullKey, // Only returned once!
        apiKey: {
          id: apiKey.id,
          key_name: apiKey.key_name,
          key_prefix: apiKey.key_prefix,
          key_secret_partial: apiKey.key_secret_partial,
          scopes: apiKey.scopes,
          created_at: apiKey.created_at,
        },
      }),
    };
  } catch (error) {
    console.error('Create API key error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
