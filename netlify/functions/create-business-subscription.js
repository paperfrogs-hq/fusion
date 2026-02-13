const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PLAN_CONFIGS = {
  business_starter: {
    plan_name: 'Starter',
    price_monthly: 99,
    price_yearly: 990,
    monthly_verifications: 5000,
    max_team_members: 5,
  },
  business_pro: {
    plan_name: 'Professional',
    price_monthly: 299,
    price_yearly: 2990,
    monthly_verifications: 25000,
    max_team_members: 15,
  },
  business_enterprise: {
    plan_name: 'Enterprise',
    price_monthly: 799,
    price_yearly: 7990,
    monthly_verifications: 100000,
    max_team_members: null,
  },
};

exports.handler = async (event) => {
  console.log("Create business subscription request received");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { 
      organizationId, 
      planCode, 
      billingCycle, 
      cardNumber, 
      cardName,
      expMonth, 
      expYear, 
      cvc 
    } = JSON.parse(event.body);

    // Validate required fields
    if (!organizationId || !planCode || !billingCycle) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Validate plan
    const planConfig = PLAN_CONFIGS[planCode];
    if (!planConfig) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Invalid plan selected" }),
      };
    }

    // Validate card
    if (!cardNumber || cardNumber.length !== 16 || !expMonth || !expYear || !cvc) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Invalid card details" }),
      };
    }

    // Get card info
    const cardBrand = getCardBrand(cardNumber);
    const cardLast4 = cardNumber.slice(-4);

    // Calculate dates - NO TRIAL for enterprise, starts immediately
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Get plan from database if it exists
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_code', planCode)
      .single();
    
    const planId = planData?.id || null;

    // Check if organization subscription already exists
    const { data: existingSub } = await supabase
      .from('business_subscriptions')
      .select('id')
      .eq('organization_id', organizationId)
      .single();

    const subscriptionData = {
      organization_id: organizationId,
      plan_id: planId,
      status: 'active', // Active immediately - NO TRIAL
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      // No trial fields for enterprise
      trial_start: null,
      trial_end: null,
      card_brand: cardBrand,
      card_last4: cardLast4,
      card_exp_month: expMonth,
      card_exp_year: expYear,
      usage_verifications: 0,
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    };

    let result;
    if (existingSub) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('business_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new subscription
      subscriptionData.created_at = now.toISOString();
      const { data, error } = await supabase
        .from('business_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Update organization billing status to active
    await supabase
      .from('organizations')
      .update({
        billing_status: 'active',
        plan_type: planCode,
        updated_at: now.toISOString(),
      })
      .eq('id', organizationId);

    // Calculate price
    const price = billingCycle === 'yearly' ? planConfig.price_yearly : planConfig.price_monthly;

    // Create payment transaction record - charged immediately
    await supabase.from('payment_transactions').insert([{
      organization_id: organizationId,
      subscription_id: result.id,
      amount: price,
      currency: 'USD',
      status: 'succeeded',
      payment_method_type: 'card',
      description: `${planConfig.plan_name} Plan - ${billingCycle} subscription`,
      card_last4: cardLast4,
      card_brand: cardBrand,
      paid_at: now.toISOString(),
      created_at: now.toISOString(),
    }]);

    console.log("Business subscription created successfully:", result.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        subscription: {
          id: result.id,
          plan: planConfig.plan_name,
          status: 'active',
          amount_charged: price,
          period_end: periodEnd.toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error("Business subscription creation error:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || "Failed to create subscription" }),
    };
  }
};

function getCardBrand(cardNumber) {
  if (cardNumber.startsWith('4')) return 'Visa';
  if (cardNumber.startsWith('5')) return 'Mastercard';
  if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) return 'Amex';
  if (cardNumber.startsWith('6')) return 'Discover';
  return 'Card';
}
