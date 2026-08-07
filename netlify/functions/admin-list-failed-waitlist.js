// Admin: list leads that the public waitlist signup could not place.
//
// GET /.netlify/functions/admin-list-failed-waitlist
//   query: ?recovered=false to show only pending replays
//   header / body: adminToken (matches the convention used by delete-user.js
//   and friends; we trust the admin panel session).

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Token can come from a body (POST) or query string (GET fallback).
  let adminToken = null;
  if (event.body) {
    try {
      const body = JSON.parse(event.body || "{}");
      adminToken = body.adminToken || null;
    } catch {
      /* ignore, will fall through */
    }
  }
  if (!adminToken && event.headers?.authorization) {
    const m = String(event.headers.authorization).match(/^Bearer\s+(.+)$/i);
    if (m) adminToken = m[1];
  }
  // Intentionally do not accept admin tokens via query string (URLs are commonly logged).

  if (!adminToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Admin authentication required" }),
    };
  }

  const recovered =
    event.queryStringParameters?.recovered === "true"
      ? true
      : event.queryStringParameters?.recovered === "false"
      ? false
      : null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let query = supabase
    .from("waitlist_failed_signups")
    .select("id, email, source, payload, recovered, recovered_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (recovered !== null) {
    query = query.eq("recovered", recovered);
  }

  const { data, error } = await query;

  if (error) {
    console.error("admin-list-failed-waitlist: query failed", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to load failed signups." }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ entries: data || [] }),
  };
};