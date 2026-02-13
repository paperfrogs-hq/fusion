const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  console.log("Update user payment method request received");

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
      cardNumber, 
      cardName,
      expMonth, 
      expYear, 
      cvc 
    } = JSON.parse(event.body);

    // Validate required fields
    if (!userId || !cardNumber || !expMonth || !expYear) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Validate card number
    if (cardNumber.length !== 16) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Invalid card number" }),
      };
    }

    // Validate CVC
    if (!cvc || cvc.length < 3) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Invalid CVC" }),
      };
    }

    // Get card info
    const cardBrand = getCardBrand(cardNumber);
    const cardLast4 = cardNumber.slice(-4);

    const now = new Date();

    // Check for existing subscription
    const { data: existingSub, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const paymentData = {
      card_brand: cardBrand,
      card_last4: cardLast4,
      card_exp_month: expMonth,
      card_exp_year: expYear,
      cardholder_name: cardName,
      updated_at: now.toISOString(),
    };

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update(paymentData)
        .eq('id', existingSub.id);

      if (updateError) throw updateError;
    } else {
      // Create new subscription record with payment method (for users who don't have one yet)
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: userId,
          status: 'incomplete',
          billing_cycle: 'monthly',
          ...paymentData,
          created_at: now.toISOString(),
        }]);

      if (insertError) throw insertError;
    }

    // Log payment method update
    await supabase.from('payment_transactions').insert([{
      user_id: userId,
      subscription_id: existingSub?.id,
      amount: 0,
      currency: 'USD',
      status: 'succeeded',
      payment_method_type: 'card',
      description: `Payment method updated: ${cardBrand} ending in ${cardLast4}`,
      card_last4: cardLast4,
      card_brand: cardBrand,
      paid_at: now.toISOString(),
      created_at: now.toISOString(),
    }]);

    console.log("Payment method updated successfully for user:", userId);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: "Payment method updated successfully",
        payment_method: {
          brand: cardBrand,
          last4: cardLast4,
          exp_month: expMonth,
          exp_year: expYear,
        },
      }),
    };
  } catch (error) {
    console.error("Update payment method error:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || "Failed to update payment method" }),
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
