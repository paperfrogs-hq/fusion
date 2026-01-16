const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { name, contact_email, organization_type, compliance_region } = JSON.parse(event.body || "{}");

    if (!name || !contact_email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Name and contact email are required" }),
      };
    }

    const { data: client, error } = await supabase
      .from("clients")
      .insert([{
        name,
        contact_email,
        organization_type: organization_type || "platform",
        compliance_region: compliance_region || "global",
        client_status: "active",
        rate_limit_per_minute: 1000,
        rate_limit_per_day: 100000,
      }])
      .select()
      .single();

    if (error) {
      console.error("Failed to create client:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to create client: ${error.message}` }),
      };
    }

    console.log(`Client created: ${name}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, client }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
