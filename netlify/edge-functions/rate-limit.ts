// Netlify Edge Function - Rate Limiting & DDoS Protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (survives across requests in same edge instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
  signup: { requests: 5, window: 3600000 }, // 5 per hour
  login: { requests: 10, window: 900000 },  // 10 per 15 min
  api: { requests: 100, window: 60000 },    // 100 per minute
  default: { requests: 60, window: 60000 }, // 60 per minute
};

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function getRateLimit(path: string) {
  if (path.includes('/signup')) return RATE_LIMITS.signup;
  if (path.includes('/login')) return RATE_LIMITS.login;
  if (path.includes('/api/')) return RATE_LIMITS.api;
  return RATE_LIMITS.default;
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip, path);
  const limit = getRateLimit(path);
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + limit.window,
    };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: limit.requests - 1, resetTime: entry.resetTime };
  }
  
  if (entry.count >= limit.requests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: limit.requests - entry.count, resetTime: entry.resetTime };
}

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const path = url.pathname;
  
  // Skip rate limiting for static assets, HTML pages, and netlify functions - pass through directly
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|html)$/) || 
      path === '/' || 
      path.startsWith('/.netlify/functions/')) {
    return context.next();
  }
  
  const { allowed, remaining, resetTime } = checkRateLimit(ip, path);
  
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(getRateLimit(path).requests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
        },
      }
    );
  }
  
  // Pass through to the actual content with rate limit headers
  const response = await context.next();
  response.headers.set('X-RateLimit-Limit', String(getRateLimit(path).requests));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)));
  return response;
};

export const config = { path: "/*" };
