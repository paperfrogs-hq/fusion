// Get Dashboard Statistics
// Returns overview metrics for the dashboard

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

    // Get organization details for quota
    const { data: org } = await supabase
      .from('client_organizations')
      .select('quota_limit, quota_used')
      .eq('id', organizationId)
      .single();

    // Get verification stats (mock data for now - replace with actual verification_logs table)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Mock verification stats (replace with actual queries when verification_logs table exists)
    const stats = {
      total_verifications: 1247,
      verifications_today: 23,
      verifications_this_month: 458,
      success_rate: 94,
      tamper_detected_count: 12,
      avg_response_time_ms: 342,
    };

    // Get API keys count
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id, is_active')
      .eq('organization_id', organizationId)
      .eq('environment_id', environmentId);

    const activeApiKeys = apiKeys?.filter(key => key.is_active).length || 0;

    // Get webhooks count
    const { data: webhooks } = await supabase
      .from('client_webhooks')
      .select('id, is_active')
      .eq('organization_id', organizationId)
      .eq('environment_id', environmentId);

    const activeWebhooks = webhooks?.filter(wh => wh.is_active).length || 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        stats: {
          ...stats,
          total_api_keys: apiKeys?.length || 0,
          active_api_keys: activeApiKeys,
          total_webhooks: webhooks?.length || 0,
          active_webhooks: activeWebhooks,
          quota_used: org?.quota_used || 0,
          quota_limit: org?.quota_limit || 10000,
        },
      }),
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
