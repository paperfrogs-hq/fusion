// Get Current Subscription
// Returns subscription details for user or organization
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const { userId, organizationId } = JSON.parse(event.body);

    if (!userId && !organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID or Organization ID required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let subscription = null;
    let plan = null;

    if (userId) {
      // Get user subscription
      const { data: userSub } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .single();

      if (userSub) {
        subscription = userSub;
        plan = userSub.plan;
      }
    } else if (organizationId) {
      // Get business subscription
      const { data: bizSub } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('organization_id', organizationId)
        .single();

      if (bizSub) {
        subscription = bizSub;
        plan = bizSub.plan;
      }
    }

    // If no subscription, return free plan
    if (!subscription) {
      const freePlanCode = userId ? 'creator_free' : 'business_starter';
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_code', freePlanCode)
        .single();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          subscription: null,
          plan: freePlan,
          hasActiveSubscription: false
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        subscription,
        plan,
        hasActiveSubscription: ['active', 'trialing'].includes(subscription.status)
      }),
    };

  } catch (error) {
    console.error('Get subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch subscription' }),
    };
  }
};
