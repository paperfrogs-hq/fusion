// Create Stripe Checkout Session (Users & Businesses)
// Handles subscription creation with payment collection
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    const { planCode, userId, organizationId, billingCycle = 'monthly' } = JSON.parse(event.body);

    if (!planCode || (!userId && !organizationId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Plan code and user/organization ID required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_code', planCode)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Plan not found' }),
      };
    }

    // Get or create Stripe customer
    let stripeCustomerId;
    let customerEmail;
    let customerName;

    if (userId) {
      // User subscription
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }

      customerEmail = user.email;
      customerName = user.full_name;

      // Check if user already has a Stripe customer
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      stripeCustomerId = existingSubscription?.stripe_customer_id;

    } else if (organizationId) {
      // Business subscription
      const { data: org } = await supabase
        .from('organizations')
        .select('name, billing_email')
        .eq('id', organizationId)
        .single();

      if (!org) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Organization not found' }),
        };
      }

      customerEmail = org.billing_email;
      customerName = org.name;

      // Check if org already has a Stripe customer
      const { data: existingSubscription } = await supabase
        .from('business_subscriptions')
        .select('stripe_customer_id')
        .eq('organization_id', organizationId)
        .single();

      stripeCustomerId = existingSubscription?.stripe_customer_id;
    }

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          userId: userId || '',
          organizationId: organizationId || '',
          planCode: planCode
        }
      });
      stripeCustomerId = customer.id;
    }

    // Determine price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    // Create Stripe Price if doesn't exist
    let stripePriceId;
    if (billingCycle === 'monthly') {
      stripePriceId = plan.stripe_price_id_monthly;
    } else {
      stripePriceId = plan.stripe_price_id_yearly;
    }

    // If no Stripe price ID exists, create one
    if (!stripePriceId) {
      // Create or get product
      let stripeProductId = plan.stripe_product_id;
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: `${plan.plan_name} Plan`,
          description: plan.description,
          metadata: { planCode: plan.plan_code }
        });
        stripeProductId = product.id;

        // Update plan with product ID
        await supabase
          .from('subscription_plans')
          .update({ stripe_product_id: stripeProductId })
          .eq('id', plan.id);
      }

      // Create price
      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(price * 100), // Convert to cents
        currency: plan.currency.toLowerCase(),
        recurring: {
          interval: billingCycle === 'yearly' ? 'year' : 'month'
        },
        metadata: { planCode: plan.plan_code, billingCycle }
      });

      stripePriceId = stripePrice.id;

      // Update plan with price ID
      const updateData = billingCycle === 'monthly' 
        ? { stripe_price_id_monthly: stripePriceId }
        : { stripe_price_id_yearly: stripePriceId };

      await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', plan.id);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${event.headers.origin || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || 'http://localhost:5173'}/pricing`,
      metadata: {
        userId: userId || '',
        organizationId: organizationId || '',
        planCode: planCode,
        planId: plan.id
      },
      subscription_data: {
        metadata: {
          userId: userId || '',
          organizationId: organizationId || '',
          planCode: planCode,
          planId: plan.id
        },
        trial_period_days: 14 // 14-day free trial
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
    };

  } catch (error) {
    console.error('Create checkout error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        details: error.message
      }),
    };
  }
};
