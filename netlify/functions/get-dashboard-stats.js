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
      .from('organizations')
      .select('quota_limit, quota_used')
      .eq('id', organizationId)
      .single();

    // Get verification stats from verification_activity table
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Query actual verification stats
    let stats = {
      total_verifications: 0,
      verifications_today: 0,
      verifications_this_month: 0,
      success_rate: 0,
      tamper_detected_count: 0,
      avg_response_time_ms: 0,
    };

    try {
      // Total verifications
      const { count: totalCount } = await supabase
        .from('verification_activity')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId);
      
      stats.total_verifications = totalCount || 0;

      // Verifications today
      const { count: todayCount } = await supabase
        .from('verification_activity')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId)
        .gte('created_at', today.toISOString());
      
      stats.verifications_today = todayCount || 0;

      // Verifications this month
      const { count: monthCount } = await supabase
        .from('verification_activity')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId)
        .gte('created_at', firstDayOfMonth.toISOString());
      
      stats.verifications_this_month = monthCount || 0;

      // Success rate (verified verifications)
      const { count: successCount } = await supabase
        .from('verification_activity')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId)
        .eq('verification_result', 'verified');
      
      if (totalCount && totalCount > 0) {
        stats.success_rate = Math.round((successCount / totalCount) * 100);
      }

      // Tamper detected count
      const { count: tamperCount } = await supabase
        .from('verification_activity')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId)
        .eq('tamper_detected', true);
      
      stats.tamper_detected_count = tamperCount || 0;

      // Average response time
      const { data: avgData } = await supabase
        .from('verification_activity')
        .select('processing_time_ms')
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId)
        .not('processing_time_ms', 'is', null)
        .limit(100);
      
      if (avgData && avgData.length > 0) {
        const sum = avgData.reduce((acc, item) => acc + (item.processing_time_ms || 0), 0);
        stats.avg_response_time_ms = Math.round(sum / avgData.length);
      }
    } catch (verificationError) {
      // If verification_activity table doesn't exist, use default values
      console.log('Verification activity table may not exist, using defaults');
    }

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
