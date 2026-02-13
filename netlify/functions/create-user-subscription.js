const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PLAN_CONFIGS = {
  user_creator: {
    plan_name: 'Creator',
    price_monthly: 9,
    price_yearly: 90,
    monthly_verifications: 100,
  },
  user_professional: {
    plan_name: 'Professional',
    price_monthly: 29,
    price_yearly: 290,
    monthly_verifications: 500,
  },
};

exports.handler = async (event) => {
  console.log("Create user subscription request received");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { 
      userId, 
      planCode, 
      billingCycle, 
      cardNumber, 
      cardName,
      expMonth, 
      expYear, 
      cvc 
    } = JSON.parse(event.body);

    // Validate required fields
    if (!userId || !planCode || !billingCycle) {
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

    // Get plan from database
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_code', planCode)
      .single();
    
    // If plan doesn't exist in DB, create without plan_id reference
    const planId = planData?.id || null;

    // Validate card
    if (!cardNumber || cardNumber.length !== 16 || !expMonth || !expYear || !cvc) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Invalid card details" }),
      };
    }

    // Simple card validation (in production, use Stripe or similar)
    const cardBrand = getCardBrand(cardNumber);
    const cardLast4 = cardNumber.slice(-4);

    // Calculate dates
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial
    
    const periodEnd = new Date(now);
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    const subscriptionData = {
      user_id: userId,
      plan_id: planId, // Reference to subscription_plans table
      status: 'trialing',
      billing_cycle: billingCycle,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
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
        .from('user_subscriptions')
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
        .from('user_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Create payment transaction record
    const price = billingCycle === 'yearly' ? planConfig.price_yearly : planConfig.price_monthly;
    
    await supabase.from('payment_transactions').insert([{
      user_id: userId,
      subscription_id: result.id,
      amount: 0, // Trial starts at $0
      currency: 'USD',
      status: 'succeeded',
      payment_method_type: 'card',
      description: `${planConfig.plan_name} Plan - 14-day trial started`,
      card_last4: cardLast4,
      card_brand: cardBrand,
      paid_at: now.toISOString(),
      created_at: now.toISOString(),
    }]);

    console.log("Subscription created successfully:", result.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        subscription: {
          id: result.id,
          plan: planConfig.plan_name,
          status: 'trialing',
          trial_end: trialEnd.toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error("Subscription creation error:", error);
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
