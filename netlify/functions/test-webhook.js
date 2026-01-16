// Test Webhook
// Sends a test event to verify webhook configuration

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Generate HMAC signature for webhook
function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
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
    const { webhookId } = JSON.parse(event.body);

    if (!webhookId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Webhook ID is required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook details
    const { data: webhook, error: fetchError } = await supabase
      .from('client_webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (fetchError || !webhook) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Webhook not found' }),
      };
    }

    // Create test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Fusion',
        webhook_id: webhookId,
      },
    };

    // Generate signature
    const signature = generateSignature(testPayload, webhook.signing_secret);

    // Send webhook
    const startTime = Date.now();
    let responseStatus = 0;
    let responseTime = 0;

    try {
      const response = await fetch(webhook.endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fusion-Signature': signature,
          'X-Fusion-Event': 'webhook.test',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      responseStatus = response.status;
      responseTime = Date.now() - startTime;

      // Log delivery
      await supabase
        .from('webhook_deliveries')
        .insert({
          webhook_id: webhookId,
          event_type: 'webhook.test',
          payload: testPayload,
          response_status: responseStatus,
          response_time_ms: responseTime,
          attempt_number: 1,
        });

      // Update webhook stats
      if (responseStatus >= 200 && responseStatus < 300) {
        await supabase
          .from('client_webhooks')
          .update({
            success_count: webhook.success_count + 1,
            last_triggered_at: new Date().toISOString(),
          })
          .eq('id', webhookId);
      } else {
        await supabase
          .from('client_webhooks')
          .update({
            failure_count: webhook.failure_count + 1,
            last_triggered_at: new Date().toISOString(),
          })
          .eq('id', webhookId);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Test webhook sent',
          response_status: responseStatus,
          response_time_ms: responseTime,
          success: responseStatus >= 200 && responseStatus < 300,
        }),
      };
    } catch (fetchError) {
      responseTime = Date.now() - startTime;

      // Log failed delivery
      await supabase
        .from('webhook_deliveries')
        .insert({
          webhook_id: webhookId,
          event_type: 'webhook.test',
          payload: testPayload,
          response_status: 0,
          response_time_ms: responseTime,
          attempt_number: 1,
        });

      await supabase
        .from('client_webhooks')
        .update({
          failure_count: webhook.failure_count + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhookId);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to deliver webhook',
          details: fetchError.message,
        }),
      };
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
