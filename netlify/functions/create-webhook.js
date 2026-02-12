// Create Webhook
// Adds a new webhook endpoint with signing secret

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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
    const { 
      organizationId, 
      environmentId, 
      endpointUrl, 
      eventTypes,
      retryPolicy,
      createdBy
    } = JSON.parse(event.body);

    if (!organizationId || !environmentId || !endpointUrl || !eventTypes) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Organization ID, environment ID, endpoint URL, and event types are required' 
        }),
      };
    }

    // Validate URL
    try {
      const url = new URL(endpointUrl);
      if (url.protocol !== 'https:') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Webhook URL must use HTTPS' }),
        };
      }
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    // Generate signing secret
    const signingSecret = `whsec_${crypto.randomBytes(32).toString('hex')}`;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build webhook data
    const webhookData = {
      organization_id: organizationId,
      environment_id: environmentId,
      endpoint_url: endpointUrl,
      event_types: eventTypes,
      signing_secret: signingSecret,
      is_active: true,
      retry_policy: retryPolicy || { max_attempts: 3, backoff: 'exponential' },
    };
    
    // Only add created_by if provided
    if (createdBy) {
      webhookData.created_by = createdBy;
    }

    // Create webhook
    const { data: webhook, error } = await supabase
      .from('client_webhooks')
      .insert(webhookData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create webhook' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Webhook created successfully',
        webhook: {
          id: webhook.id,
          endpoint_url: webhook.endpoint_url,
          event_types: webhook.event_types,
          created_at: webhook.created_at,
        },
        signingSecret: signingSecret, // Only returned once!
      }),
    };
  } catch (error) {
    console.error('Create webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
