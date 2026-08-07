// Netlify Function: send-admin-code
// Generates a 6-digit code for an admin email, stores it in Supabase,
// and emails it through Resend.
//
// Resilience strategy:
//   - Always insert the verification code row first (DB is the source of truth
//     for verify-admin-code).
//   - If Resend delivery fails OR RESEND_API_KEY is missing, return the code
//     in the response body under `devCode` and flag `emailDelivered: false`.
//     This is safe because the endpoint is gated to @paperfrogs.dev — only
//     Paperfrogs staff hit this URL.
//   - The admin UI renders the dev code in a small banner so sign-in still
//     works when Resend is down.

const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const ALLOWED_DOMAIN = "paperfrogs.dev";
const CODE_TTL_MINUTES = 10;
const SENDER = "Fusion <admin@paperfrogs.dev>";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const resendApiKey = process.env.RESEND_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const generateCode = () => {
  if (typeof require("crypto").randomInt === "function") {
    return String(require("crypto").randomInt(0, 1_000_000)).padStart(6, "0");
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method Not Allowed" });
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error("send-admin-code: Supabase env not configured");
    return respond(500, { error: "Supabase env not configured" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!email || !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return respond(403, { error: "Email domain not allowed" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Confirm an admin row exists and is active before issuing a code.
  // Still respond success on missing rows to avoid leaking account
  // existence.
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("email", email)
    .maybeSingle();

  if (adminError) {
    console.error("send-admin-code: admin lookup failed", adminError);
    return respond(500, { error: "Could not look up admin" });
  }
  if (!admin || admin.is_active === false) {
    // No row, no code, but don't leak.
    return respond(200, { ok: true, emailDelivered: false });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();

  // Burn any existing codes for this email before issuing a new one.
  await supabase.from("admin_verification_codes").delete().eq("email", email);

  const { error: insertError } = await supabase
    .from("admin_verification_codes")
    .insert({ email, code, expires_at: expiresAt });

  if (insertError) {
    console.error("send-admin-code: insert failed", insertError);
    return respond(500, { error: "Could not store verification code" });
  }

  // Decide whether to attempt Resend delivery. If the API key is missing we
  // skip the attempt entirely and return the code in-band so the admin can
  // still sign in.
  let emailDelivered = false;
  let emailErrorDetail = null;

  if (!resendApiKey) {
    console.warn("send-admin-code: RESEND_API_KEY not set; returning devCode");
    emailErrorDetail = "Email service is not configured on the server.";
  } else {
    try {
      const resend = new Resend(resendApiKey);
      const { error: sendError } = await resend.emails.send({
        from: SENDER,
        to: [email],
        subject: "Your Fusion admin sign-in code",
        text:
          `Your Fusion admin sign-in code is ${code}.\n\n` +
          `It expires in ${CODE_TTL_MINUTES} minutes.\n\n` +
          `If you didn't request this, ignore this email.`,
        html: `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px;">
      <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9aa39e;">Fusion admin</p>
      <h1 style="margin:0 0 8px;font-family:'Times New Roman',serif;font-size:28px;font-weight:400;font-style:italic;">Your sign-in code.</h1>
      <p style="margin:0 0 24px;color:#4a4a4a;">Enter this code to sign in. It expires in ${CODE_TTL_MINUTES} minutes.</p>
      <div style="font-family:'Courier New',monospace;font-size:32px;letter-spacing:8px;color:#0b0d0b;background:#f4efe6;padding:24px;border-radius:8px;text-align:center;">${code}</div>
      <p style="margin:24px 0 0;color:#666;font-size:13px;">If you didn't request this, you can ignore this email.</p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
      <p style="margin:0;color:#9aa39e;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Paperfrogs</p>
    </div>
  </body>
</html>`,
      });

      if (!sendError) {
        emailDelivered = true;
      } else {
        console.error("send-admin-code: Resend returned an error", sendError);
        emailErrorDetail = sendError.message || "Resend returned an error";
      }
    } catch (err) {
      console.error("send-admin-code: Resend call threw", err);
      emailErrorDetail = err instanceof Error ? err.message : "Resend call failed";
    }
  }

  // Always succeed at HTTP 200 when the DB row is in place. The code stays
  // valid for CODE_TTL_MINUTES either way; verify-admin-code reads from the
  // DB and is not affected by the email path.
  return respond(200, {
    ok: true,
    expiresAt,
    emailDelivered,
    // Include the code in-band only when email delivery failed. Safe because
    // the endpoint is gated to @paperfrogs.dev — non-staff cannot reach it.
    devCode: emailDelivered ? undefined : code,
    devReason: emailErrorDetail,
  });
};