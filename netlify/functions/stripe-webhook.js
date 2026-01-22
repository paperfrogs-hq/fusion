// Stripe Webhook Handler
// Processes subscription events from Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const signature = event.headers['stripe-signature'];

  try {
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      webhookSecret
    );

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object, supabase);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object, supabase);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(stripeEvent.data.object, supabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object, supabase);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(stripeEvent.data.object, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Handle successful checkout
async function handleCheckoutCompleted(session, supabase) {
  const { userId, organizationId, planId, planCode } = session.metadata;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    plan_id: planId,
    status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    billing_cycle: subscription.items.data[0].plan.interval === 'year' ? 'yearly' : 'monthly',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    usage_verifications: 0,
    usage_reset_date: new Date().toISOString().split('T')[0],
  };

  if (userId) {
    // Create user subscription
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        ...subscriptionData
      });
  } else if (organizationId) {
    // Create business subscription
    await supabase
      .from('business_subscriptions')
      .upsert({
        organization_id: organizationId,
        ...subscriptionData
      });

    // Update organization plan
    await supabase
      .from('organizations')
      .update({
        plan_type: planCode.replace('business_', ''),
        billing_status: 'active',
        subscription_started_at: new Date().toISOString()
      })
      .eq('id', organizationId);
  }

  console.log('Checkout completed:', { userId, organizationId, subscriptionId });
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription, supabase) {
  const { userId, organizationId } = subscription.metadata;

  // Get payment method details
  const paymentMethod = subscription.default_payment_method
    ? await stripe.paymentMethods.retrieve(subscription.default_payment_method)
    : null;

  const updateData = {
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
  };

  if (paymentMethod?.card) {
    updateData.payment_method_id = paymentMethod.id;
    updateData.card_brand = paymentMethod.card.brand;
    updateData.card_last4 = paymentMethod.card.last4;
    updateData.card_exp_month = paymentMethod.card.exp_month;
    updateData.card_exp_year = paymentMethod.card.exp_year;
  }

  if (userId) {
    await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);
  } else if (organizationId) {
    await supabase
      .from('business_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    // Update organization status
    await supabase
      .from('organizations')
      .update({ billing_status: subscription.status })
      .eq('id', organizationId);
  }

  console.log('Subscription updated:', subscription.id);
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription, supabase) {
  const { userId, organizationId } = subscription.metadata;

  const updateData = {
    status: 'canceled',
    canceled_at: new Date().toISOString(),
  };

  if (userId) {
    await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);
  } else if (organizationId) {
    await supabase
      .from('business_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    await supabase
      .from('organizations')
      .update({ billing_status: 'canceled' })
      .eq('id', organizationId);
  }

  console.log('Subscription deleted:', subscription.id);
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice, supabase) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  // Find subscription
  let userId, organizationId;
  const { data: userSub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (userSub) {
    userId = userSub.user_id;
  } else {
    const { data: bizSub } = await supabase
      .from('business_subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    organizationId = bizSub?.organization_id;
  }

  // Record payment transaction
  await supabase
    .from('payment_transactions')
    .insert({
      user_id: userId || null,
      organization_id: organizationId || null,
      subscription_id: subscriptionId,
      stripe_payment_intent_id: invoice.payment_intent,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      description: invoice.description || 'Subscription payment',
      invoice_url: invoice.hosted_invoice_url,
      receipt_url: invoice.invoice_pdf,
      paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
    });

  console.log('Invoice paid:', invoice.id);
}

// Handle payment failure
async function handlePaymentFailed(invoice, supabase) {
  const subscriptionId = invoice.subscription;

  // Update subscription status to past_due
  await supabase
    .from('user_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  await supabase
    .from('business_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  // Record failed transaction
  await supabase
    .from('payment_transactions')
    .insert({
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
      description: 'Payment failed',
    });

  console.log('Payment failed:', invoice.id);
}

// Handle payment method attached
async function handlePaymentMethodAttached(paymentMethod, supabase) {
  const customerId = paymentMethod.customer;

  const updateData = {
    payment_method_id: paymentMethod.id,
    card_brand: paymentMethod.card?.brand,
    card_last4: paymentMethod.card?.last4,
    card_exp_month: paymentMethod.card?.exp_month,
    card_exp_year: paymentMethod.card?.exp_year,
  };

  // Update user subscription
  await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('stripe_customer_id', customerId);

  // Update business subscription
  await supabase
    .from('business_subscriptions')
    .update(updateData)
    .eq('stripe_customer_id', customerId);

  console.log('Payment method attached:', paymentMethod.id);
}
