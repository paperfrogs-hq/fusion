// Get Billing Data
// Returns subscription, usage, invoices, and payment method info

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
    const { organizationId } = JSON.parse(event.body);

    if (!organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID is required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get organization with billing info
    const { data: org } = await supabase
      .from('client_organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (!org) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Organization not found' }),
      };
    }

    // Mock billing data (replace with actual Stripe/payment provider integration)
    const billing = {
      subscription: {
        plan_type: org.plan_type,
        status: org.billing_status || 'active',
        current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        is_trial: org.is_trial || false,
        trial_ends_at: org.trial_ends_at,
      },
      usage: {
        quota_used: org.quota_used || 0,
        quota_limit: org.quota_limit || 10000,
        overage_count: Math.max(0, (org.quota_used || 0) - (org.quota_limit || 10000)),
      },
      invoices: [
        {
          id: 'inv_001',
          amount: 19900, // $199.00 in cents
          status: 'paid',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'inv_002',
          amount: 19900,
          status: 'paid',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          period_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      payment_method: {
        type: 'Visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2026,
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ billing }),
    };
  } catch (error) {
    console.error('Get billing data error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
