// Admin: replay a failed waitlist signup into early_access_signups.
//
// POST /.netlify/functions/admin-replay-failed-waitlist
//   body: { id: number, adminToken: string }
//
// Marks the failed-signup row as recovered if the replay succeeds.

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

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("admin-replay-failed-waitlist: missing Supabase env vars");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server configuration error" }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: session, error: sessionError } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("session_token", body.adminToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Admin session expired. Please sign in again." }),
    };
  }

  const { data: row, error: lookupError } = await supabase
    .from("waitlist_failed_signups")
    .select("id, email, source, recovered")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !row) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Failed-signup entry not found." }),
    };
  }

  if (row.recovered) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "already_recovered" }),
    };
  }

  const { error: insertError } = await supabase
    .from("early_access_signups")
    .insert([
      {
        email: row.email,
        confirmed: false,
        source: row.source || "waitlist_replay",
        created_at: new Date().toISOString(),
      },
    ]);

  if (insertError) {
    console.error("admin-replay-failed-waitlist: replay insert failed", insertError);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Replay failed. Try again." }),
    };
  }

  await supabase
    .from("waitlist_failed_signups")
    .update({ recovered: true, recovered_at: new Date().toISOString() })
    .eq("id", id);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status: "recovered" }),
  };
};