// Security middleware to detect and log hack attempts
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL Injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /UNION.*SELECT/i,
  /SELECT.*FROM/i,
  /INSERT.*INTO/i,
  /DELETE.*FROM/i,
  /DROP.*TABLE/i,
  /UPDATE.*SET/i,
  /1=1/i,
  /1' OR '1'='1/i,
  /admin'--/i,
  /OR 1=1/i
];

// XSS patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onload=, onclick=, etc.
  /<img[^>]*onerror/gi,
  /<svg[^>]*onload/gi,
  /eval\(/gi,
  /expression\(/gi,
  /vbscript:/gi,
  /&#/gi // HTML entity encoding
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e\//gi,
  /\.\.%2f/gi
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /;\s*(ls|cat|curl|wget|nc|bash|sh|python|perl|ruby)\s/gi,
  /\|\s*(ls|cat|curl|wget|nc|bash|sh|python|perl|ruby)\s/gi,
  /`.*`/g,
  /\$\(.*\)/g
];

/**
 * Detect if input contains SQL injection patterns
 */
function detectSQLInjection(input) {
  if (typeof input !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Detect if input contains XSS patterns
 */
function detectXSS(input) {
  if (typeof input !== 'string') return false;
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Detect if input contains path traversal patterns
 */
function detectPathTraversal(input) {
  if (typeof input !== 'string') return false;
  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Detect if input contains command injection patterns
 */
function detectCommandInjection(input) {
  if (typeof input !== 'string') return false;
  return COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Scan all values in an object recursively
 */
function scanObject(obj, detector, threatType) {
  if (!obj || typeof obj !== 'object') return null;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && detector(value)) {
      return { key, value, threatType };
    }
    if (typeof value === 'object') {
      const result = scanObject(value, detector, threatType);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Main security check function
 */
async function checkSecurity(event, endpoint) {
  const ip_address = 
    event.headers['x-forwarded-for']?.split(',')[0].trim() ||
    event.headers['x-real-ip'] ||
    event.headers['client-ip'] ||
    'unknown';

  const user_agent = event.headers['user-agent'] || 'unknown';

  // Parse body if present
  let requestBody = null;
  try {
    if (event.body) {
      requestBody = JSON.parse(event.body);
    }
  } catch (e) {
    // If body is not JSON, treat as potential attack
    requestBody = { raw: event.body };
  }

  // Check SQL Injection
  const sqlInjection = requestBody ? scanObject(requestBody, detectSQLInjection, 'sql_injection') : null;
  if (sqlInjection) {
    await logSecurityEvent({
      event_type: 'sql_injection',
      ip_address,
      user_agent,
      endpoint,
      request_method: event.httpMethod,
      request_body: requestBody,
      threat_level: 'critical',
      reason: `SQL Injection detected in field: ${sqlInjection.key}`,
      blocked: true,
      metadata: { detected_pattern: sqlInjection.value }
    });
    return {
      blocked: true,
      reason: 'SQL Injection attempt detected',
      threatLevel: 'critical'
    };
  }

  // Check XSS
  const xss = requestBody ? scanObject(requestBody, detectXSS, 'xss_attempt') : null;
  if (xss) {
    await logSecurityEvent({
      event_type: 'xss_attempt',
      ip_address,
      user_agent,
      endpoint,
      request_method: event.httpMethod,
      request_body: requestBody,
      threat_level: 'high',
      reason: `XSS attempt detected in field: ${xss.key}`,
      blocked: true,
      metadata: { detected_pattern: xss.value }
    });
    return {
      blocked: true,
      reason: 'XSS attempt detected',
      threatLevel: 'high'
    };
  }

  // Check Path Traversal
  const pathTraversal = requestBody ? scanObject(requestBody, detectPathTraversal, 'path_traversal') : null;
  if (pathTraversal) {
    await logSecurityEvent({
      event_type: 'path_traversal',
      ip_address,
      user_agent,
      endpoint,
      request_method: event.httpMethod,
      request_body: requestBody,
      threat_level: 'high',
      reason: `Path traversal detected in field: ${pathTraversal.key}`,
      blocked: true,
      metadata: { detected_pattern: pathTraversal.value }
    });
    return {
      blocked: true,
      reason: 'Path traversal attempt detected',
      threatLevel: 'high'
    };
  }

  // Check Command Injection
  const commandInjection = requestBody ? scanObject(requestBody, detectCommandInjection, 'command_injection') : null;
  if (commandInjection) {
    await logSecurityEvent({
      event_type: 'command_injection',
      ip_address,
      user_agent,
      endpoint,
      request_method: event.httpMethod,
      request_body: requestBody,
      threat_level: 'critical',
      reason: `Command injection detected in field: ${commandInjection.key}`,
      blocked: true,
      metadata: { detected_pattern: commandInjection.value }
    });
    return {
      blocked: true,
      reason: 'Command injection attempt detected',
      threatLevel: 'critical'
    };
  }

  // Check for suspicious user agents
  const suspiciousAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /metasploit/i,
    /burp/i,
    /havij/i,
    /acunetix/i
  ];

  if (suspiciousAgents.some(pattern => pattern.test(user_agent))) {
    await logSecurityEvent({
      event_type: 'suspicious_activity',
      ip_address,
      user_agent,
      endpoint,
      request_method: event.httpMethod,
      request_body: requestBody,
      threat_level: 'high',
      reason: 'Suspicious user agent detected (hacking tool)',
      blocked: true,
      metadata: { user_agent }
    });
    return {
      blocked: true,
      reason: 'Suspicious user agent detected',
      threatLevel: 'high'
    };
  }

  // Check for rate limiting indicators (too many requests from same IP)
  // This would need Redis or similar for production, simplified here
  const { count } = await supabase
    .from('security_events')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip_address)
    .gte('detected_at', new Date(Date.now() - 60000).toISOString()); // Last minute

  if (count && count > 50) { // More than 50 requests per minute
    await logSecurityEvent({
      event_type: 'brute_force',
      ip_address,
      user_agent,
      endpoint,
      request_method: event.httpMethod,
      request_body: requestBody,
      threat_level: 'high',
      reason: 'Rate limit exceeded - Potential brute force attack',
      blocked: true,
      metadata: { requests_per_minute: count }
    });
    return {
      blocked: true,
      reason: 'Rate limit exceeded',
      threatLevel: 'high'
    };
  }

  return { blocked: false };
}

/**
 * Log security event to database
 */
async function logSecurityEvent(eventData) {
  try {
    await supabase.from('security_events').insert([{
      ...eventData,
      detected_at: new Date().toISOString()
    }]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

module.exports = {
  checkSecurity,
  logSecurityEvent,
  detectSQLInjection,
  detectXSS,
  detectPathTraversal,
  detectCommandInjection
};
