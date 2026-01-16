// Upgrade Subscription
// Changes the organization's plan (integrates with payment provider)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const planQuotas = {
  free: 1000,
  starter: 10000,
  professional: 50000,
  enterprise: 999999,
};

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
    const { organizationId, planId } = JSON.parse(event.body);

    if (!organizationId || !planId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and plan ID are required' }),
      };
    }

    if (!planQuotas[planId]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid plan ID' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // In production, this would:
    // 1. Create/update subscription in Stripe
    // 2. Handle prorated charges
    // 3. Update billing status
    // 4. Send confirmation email

    // Update organization plan
    const { error } = await supabase
      .from('client_organizations')
      .update({
        plan_type: planId,
        quota_limit: planQuotas[planId],
        is_trial: false,
        trial_ends_at: null,
        billing_status: 'active',
      })
      .eq('id', organizationId);

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to upgrade subscription' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Subscription upgraded successfully',
        plan: planId,
        quota: planQuotas[planId],
      }),
    };
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
