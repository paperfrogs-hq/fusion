// Public waitlist signup
// Receives { email, source } from the public form on /waitlist and inserts into
// early_access_signups using the service role key (anon insert would be blocked
// by RLS).
//
// Real column set on early_access_signups (verified against existing handlers
// confirm-waitlist.js, send-newyear.js, use-waitlist-invite.js): id, email,
// confirmed, created_at. We never write source/user_agent/ip_address directly
// because those columns are not guaranteed to exist on every schema.
//
// If the primary insert fails (transient DB error, schema drift, etc.) the
// attempt is captured into waitlist_failed_signups so the team can recover the
// lead from the admin panel.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_SOURCES = new Set([
  "waitlist_page",
  "home_page",
  "footer",
  "whitepaper",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (statusCode, body, headers) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    ...(headers || {}),
  },
  body: JSON.stringify(body),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(200, {});
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("add-to-waitlist: missing Supabase env vars");
    return json(500, { error: "Server is not configured for signups." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Please enter a valid email." });
  }

  const rawEmail =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!rawEmail || !EMAIL_RE.test(rawEmail) || rawEmail.length > 320) {
    return json(400, { error: "Please enter a valid email." });
  }

  const source =
    typeof payload.source === "string" && ALLOWED_SOURCES.has(payload.source)
      ? payload.source
      : "waitlist_page";

  const userAgent =
    typeof payload.userAgent === "string"
      ? payload.userAgent.slice(0, 512)
      : null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // 1. Probe — same shape the rest of the codebase uses.
  try {
    const { data: existing, error: lookupError } = await supabase
      .from("early_access_signups")
      .select("id, confirmed, created_at")
      .eq("email", rawEmail)
      .maybeSingle();

    if (!lookupError && existing) {
      return json(200, {
        status: "duplicate",
        message: "You are already on the list.",
      });
    }
  } catch (probeErr) {
    // Probe failures are not fatal — we'll still try the insert.
    console.warn("add-to-waitlist: probe failed (non-fatal)", probeErr);
  }

  // 2. Primary insert, retried once on transient failure.
  let insertError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { data: inserted, error } = await supabase
        .from("early_access_signups")
        .insert([
          {
            email: rawEmail,
            confirmed: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select("id, created_at")
        .single();

      if (!error) {
        // Best-effort welcome email. Never blocks the response.
        try {
          await fetch(
            `${
              process.env.URL || "https://fusion.paperfrogs.dev"
            }/.netlify/functions/send-welcome`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: rawEmail, source, userAgent }),
            },
          );
        } catch (e) {
          console.warn("add-to-waitlist: welcome email failed (non-blocking)", e);
        }

        return json(200, {
          status: "created",
          id: inserted?.id ?? null,
          message: "You are on the list.",
        });
      }

      insertError = error;

      // Race condition: row appeared between probe and insert.
      if (error.code === "23505") {
        return json(200, {
          status: "duplicate",
          message: "You are already on the list.",
        });
      }

      // Don't retry schema errors — they will keep failing.
      const msg = (error.message || "").toLowerCase();
      const isSchemaError =
        msg.includes("does not exist") ||
        msg.includes("column") ||
        msg.includes("permission denied") ||
        msg.includes("row-level security") ||
        error.code === "42P01" || // undefined_table
        error.code === "42703"; // undefined_column
      if (isSchemaError) break;

      if (attempt < 2) await sleep(400);
    } catch (e) {
      insertError = e;
      if (attempt < 2) await sleep(400);
    }
  }

  // 3. Fallback — capture the lead to a parallel table so the team can
  //    recover it. If even this fails, we surface a real message and keep
  //    the original error in the server log.
  console.error("add-to-waitlist: primary insert failed", insertError);

  try {
    const { error: fallbackError } = await supabase
      .from("waitlist_failed_signups")
      .insert([
        {
          email: rawEmail,
          source,
          user_agent: userAgent,
          payload: {
            error_code: insertError?.code ?? null,
            error_message:
              typeof insertError?.message === "string"
                ? insertError.message.slice(0, 500)
                : null,
            received_at: new Date().toISOString(),
          },
          recovered: false,
          created_at: new Date().toISOString(),
        },
      ]);

    if (!fallbackError) {
      // Tell them we got it, just not where they'd expect.
      return json(202, {
        status: "queued",
        message:
          "We captured your request and will follow up by email once the queue is replayed.",
      });
    }

    console.error("add-to-waitlist: fallback insert also failed", fallbackError);
  } catch (fallbackErr) {
    console.error("add-to-waitlist: fallback threw", fallbackErr);
  }

  return json(500, {
    error:
      "Could not save your email just now. Please try again in a moment, or email hello@paperfrogs.dev and we will add you by hand.",
  });
};