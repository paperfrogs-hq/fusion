// Safe error helpers
// Map internal exceptions to user-facing copy that does not leak schema
// names, SQL fragments, or stack traces. The original error is logged
// to the browser console so it stays debuggable for the team.

export type SafeErrorOptions = {
  fallback?: string;
  logTag?: string;
};

const PUBLIC_MESSAGES: Array<{ test: RegExp; message: string }> = [
  // Schema / RLS / Postgres errors
  {
    test: /schema cache|could not find the .* column|relation .* does not exist|column .* does not exist|permission denied|row-level security/i,
    message:
      "We could not save your request right now. The team has been notified.",
  },
  // Network
  {
    test: /failed to fetch|networkerror|load failed|network request failed/i,
    message: "Network hiccup. Check your connection and try again.",
  },
  // Duplicate key (waitlist)
  {
    test: /duplicate|already exists|unique constraint|23505/i,
    message: "Looks like that email is already on the list.",
  },
  // Rate limiting
  {
    test: /rate limit|429|too many requests/i,
    message: "Slow down a touch and try again in a moment.",
  },
  // Auth / session
  {
    test: /jwt|invalid token|unauthorized|401|403/i,
    message: "Your session expired. Sign in again to continue.",
  },
  // Bad input / validation
  {
    test: /invalid email|invalid json|400/i,
    message: "Please check what you entered and try again.",
  },
];

const FALLBACK =
  "Something went wrong on our side. The team has been notified.";

let requestCounter = 0;
const nextRequestId = (): string => {
  requestCounter = (requestCounter + 1) % 1_000_000;
  return `req_${Date.now().toString(36)}_${requestCounter.toString(36)}`;
};

export const safeErrorMessage = (
  error: unknown,
  options: SafeErrorOptions = {},
): string => {
  const fallback = options.fallback ?? FALLBACK;
  const tag = options.logTag ?? "safe-error";
  const requestId = nextRequestId();

  if (import.meta.env.DEV) {
    // In development we still log the full error so the developer can
    // debug. The user-facing message stays generic.
    // eslint-disable-next-line no-console
    console.error(`[${tag}] ${requestId}`, error);
  }

  if (error instanceof Error) {
    for (const rule of PUBLIC_MESSAGES) {
      if (rule.test.test(error.message)) return rule.message;
    }
  } else if (typeof error === "string") {
    for (const rule of PUBLIC_MESSAGES) {
      if (rule.test.test(error)) return rule.message;
    }
  }

  return fallback;
};

export const isDuplicateEmailError = (error: unknown): boolean => {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /duplicate|already exists|unique constraint|23505/i.test(message);
};

/**
 * Safely extract an error message from a parsed JSON response body of a
 * Netlify function (or similar backend). We never render the raw `error`
 * string from the server to end users because functions occasionally
 * surface Supabase messages, table names, or stack hints in that field.
 *
 * Only allow short, generic, hand-curated copy through. Anything else
 * falls back to the provided default.
 */
const ALLOWED_PUBLIC_ERRORS = new Set<string>([
  "Invalid email or password.",
  "Email already in use.",
  "Invalid invitation.",
  "Invitation expired.",
  "Code is invalid or expired.",
  "Code is 6 digits.",
  "Please enter a valid email.",
  "Passwords do not match.",
  "Password must be at least 8 characters.",
  "You must be logged in.",
  "You do not have permission to update organization settings.",
  "Failed to send message. Please try again.",
  "Failed to send reset link",
  "Failed to reset password",
  "Failed to update profile",
  "Failed to update webhook",
  "Failed to send test webhook",
  "Failed to delete webhook",
  "Failed to load organization",
  "Failed to create organization",
  "Failed to create account",
  "Failed to accept invitation",
  "Failed to load invitation",
  "Invalid invitation",
  "Organization not found",
  "Login failed",
  "Signup failed",
  "Verification failed",
  "Failed to rotate key",
  "Failed to revoke key",
  "Failed to update role",
  "Failed to remove member",
  "Failed to generate report",
  "Failed to cancel subscription",
  "Payment failed. Please try again.",
  "Failed to start trial. Please try again.",
  "Failed to load API keys",
]);

const SAFE_PUBLIC_ERROR_PATTERNS: Array<{ test: RegExp; message: string }> = [
  { test: /^invalid email or password/i, message: "Invalid email or password." },
  { test: /^email already in use/i, message: "Email already in use." },
  { test: /^user already registered/i, message: "Email already in use." },
  { test: /^invalid (login )?credentials/i, message: "Invalid email or password." },
  { test: /^invalid invitation/i, message: "Invalid invitation." },
  { test: /^invitation expired/i, message: "Invitation expired." },
  { test: /^code (is )?invalid/i, message: "Code is invalid or expired." },
  { test: /^code expired/i, message: "Code is invalid or expired." },
  { test: /^password.*too short|at least 8/i, message: "Password must be at least 8 characters." },
  { test: /^passwords do not match/i, message: "Passwords do not match." },
  { test: /^must be logged in|not authenticated|unauthenticated/i, message: "You must be logged in." },
  { test: /^permission denied|not allowed|forbidden/i, message: "You do not have permission to do that." },
  { test: /^payment (failed|declined)/i, message: "Payment failed. Please try again." },
];

export const safeFunctionErrorMessage = (
  body: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  let raw = "";
  if (typeof body === "string") {
    raw = body;
  } else if (body && typeof body === "object") {
    const candidate = (body as { error?: unknown; message?: unknown });
    if (typeof candidate.error === "string") raw = candidate.error;
    else if (typeof candidate.message === "string") raw = candidate.message;
  }

  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  if (ALLOWED_PUBLIC_ERRORS.has(trimmed)) return trimmed;

  for (const rule of SAFE_PUBLIC_ERROR_PATTERNS) {
    if (rule.test.test(trimmed)) return rule.message;
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn("[safe-error] dropped unsafe function error message:", trimmed);
  }

  return fallback;
};