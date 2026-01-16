// Get Webhook Deliveries
// Returns delivery log for a specific webhook (last 50 deliveries)

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
    const { webhookId } = JSON.parse(event.body);

    if (!webhookId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Webhook ID is required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: deliveries, error } = await supabase
      .from('webhook_deliveries')
      .select('id, event_type, response_status, response_time_ms, attempt_number, delivered_at, next_retry_at')
      .eq('webhook_id', webhookId)
      .order('delivered_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch deliveries' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        deliveries: deliveries || [],
        count: deliveries?.length || 0
      }),
    };
  } catch (error) {
    console.error('Get webhook deliveries error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
