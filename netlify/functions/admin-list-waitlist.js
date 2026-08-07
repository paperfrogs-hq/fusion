// Admin: list waitlist rows from early_access_signups via the service role key.
//
// The admin panel hits this endpoint instead of going through the anon-key
// Supabase client, because the anon key is blocked by RLS on this table. The
// endpoint accepts the same adminToken convention as delete-user.js and
// returns the rows newest-first plus a stats summary so the panel can render
// counts without an extra round-trip.

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

  // adminToken can come from body, Authorization header, or query string.
  let adminToken = null;
  if (event.body) {
    try {
      const body = JSON.parse(event.body || "{}");
      if (typeof body.adminToken === "string") adminToken = body.adminToken;
    } catch {
      /* ignore */
    }
  }
  if (!adminToken && event.headers?.authorization) {
    const m = String(event.headers.authorization).match(/^Bearer\s+(.+)$/i);
    if (m) adminToken = m[1];
  }
  if (!adminToken && event.queryStringParameters?.adminToken) {
    adminToken = event.queryStringParameters.adminToken;
  }

  if (!adminToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Admin authentication required" }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Try with the full column set first. If `source` hasn't been added yet on
  // an older schema, fall back to the baseline columns so the panel still
  // loads. The admin migration adds the missing columns on next run.
  let data = null;
  let error = null;
  {
    const full = await supabase
      .from("early_access_signups")
      .select("id, email, confirmed, created_at, source")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (full.error && /column .* does not exist/i.test(full.error.message || "")) {
      const fallback = await supabase
        .from("early_access_signups")
        .select("id, email, confirmed, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      data = (fallback.data || []).map((r) => ({ ...r, source: null }));
      error = fallback.error;
    } else {
      data = full.data;
      error = full.error;
    }
  }

  if (error) {
    console.error("admin-list-waitlist: query failed", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not load the waitlist." }),
    };
  }

  const rows = (data || []).map((r) => ({
    id: r.id,
    email: r.email,
    confirmed: !!r.confirmed,
    created_at: r.created_at,
    source: r.source ?? null,
  }));

  const now = Date.now();
  const last24h = rows.filter(
    (r) => now - new Date(r.created_at).getTime() < 24 * 60 * 60 * 1000,
  ).length;
  const confirmed = rows.filter((r) => r.confirmed).length;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      entries: rows,
      stats: {
        total: rows.length,
        confirmed,
        pending: rows.length - confirmed,
        last24h,
      },
    }),
  };
};