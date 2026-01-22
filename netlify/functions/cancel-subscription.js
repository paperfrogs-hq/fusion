// Cancel Subscription
// Cancels subscription at period end or immediately
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    const { userId, organizationId, immediately = false, reason } = JSON.parse(event.body);

    if (!userId && !organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID or Organization ID required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let subscriptionId;

    if (userId) {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single();

      subscriptionId = data?.stripe_subscription_id;
    } else if (organizationId) {
      const { data } = await supabase
        .from('business_subscriptions')
        .select('stripe_subscription_id')
        .eq('organization_id', organizationId)
        .single();

      subscriptionId = data?.stripe_subscription_id;
    }

    if (!subscriptionId) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No active subscription found' }),
      };
    }

    // Cancel in Stripe
    let subscription;
    if (immediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update database
    const updateData = {
      cancel_at_period_end: !immediately,
      canceled_at: new Date().toISOString(),
      cancellation_reason: reason || null,
    };

    if (immediately) {
      updateData.status = 'canceled';
    }

    if (userId) {
      await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('business_subscriptions')
        .update(updateData)
        .eq('organization_id', organizationId);

      if (immediately) {
        await supabase
          .from('organizations')
          .update({ billing_status: 'canceled' })
          .eq('id', organizationId);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: immediately 
          ? 'Subscription canceled immediately' 
          : 'Subscription will cancel at period end',
        endsAt: subscription.current_period_end * 1000
      }),
    };

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to cancel subscription' }),
    };
  }
};
