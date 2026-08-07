import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️  Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  // Create a dummy client to prevent app crash - features requiring Supabase will fail gracefully
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export interface AddToWaitlistInput {
  email: string;
  source?: string;
}

export interface AddToWaitlistResult {
  status: "created" | "duplicate" | "queued";
}

const ALLOWED_SOURCES = new Set([
  "waitlist_page",
  "home_page",
  "footer",
  "whitepaper",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const addEmailToWaitlist = async (
  emailOrInput: string | AddToWaitlistInput,
): Promise<AddToWaitlistResult> => {
  const input: AddToWaitlistInput =
    typeof emailOrInput === "string" ? { email: emailOrInput } : emailOrInput;

  const normalized = (input.email ?? "").trim().toLowerCase();

  if (!normalized || !EMAIL_RE.test(normalized) || normalized.length > 320) {
    throw new Error("Please enter a valid email.");
  }

  const source =
    typeof input.source === "string" && ALLOWED_SOURCES.has(input.source)
      ? input.source
      : "waitlist_page";

  const userAgent =
    typeof window !== "undefined" ? window.navigator?.userAgent ?? null : null;

  let response: Response;
  try {
    response = await fetch("/.netlify/functions/add-to-waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, source, userAgent }),
    });
  } catch (err) {
    // Network / CORS / DNS — the user is probably offline or behind a proxy.
    console.error("[waitlist-insert] network failure", err);
    throw new Error("Network hiccup. Check your connection and try again.");
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 200 && body?.status === "duplicate") {
    return { status: "duplicate" };
  }

  if (response.status === 200 && body?.status === "created") {
    return { status: "created" };
  }

  // 202 — primary insert failed but we captured the lead into the fallback
  // table. Surface as a soft success so the user does not see an error toast
  // and the team can replay from the admin panel.
  if (response.status === 202 && body?.status === "queued") {
    return { status: "queued" };
  }

  if (response.status === 400) {
    throw new Error(body?.error || "Please enter a valid email.");
  }

  // 5xx, network failures after fetch returned, unexpected shape — surface a
  // helpful retry message instead of leaking server detail.
  console.error("[waitlist-insert] unexpected response", { status: response.status, body });
  throw new Error(
    "Could not save your email just now. Please try again in a moment, or email hello@paperfrogs.dev if it keeps failing.",
  );
};