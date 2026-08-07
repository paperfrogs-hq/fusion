// Admin: remove a row from early_access_signups.
//
// POST /.netlify/functions/admin-remove-waitlist
//   body: { id: number, adminToken: string }

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request body." }),
    };
  }

  if (!body.adminToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Admin authentication required" }),
    };
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing or invalid id." }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("early_access_signups")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("admin-remove-waitlist: delete failed", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not remove that entry." }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status: "removed" }),
  };
};