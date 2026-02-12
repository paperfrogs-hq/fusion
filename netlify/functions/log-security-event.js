// Security Event Logger - Tracks hack attempts and suspicious activities
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const {
      event_type,
      endpoint,
      request_method,
      request_body,
      response_status,
      threat_level,
      reason,
      metadata,
      location,
      blocked,
      user_id
    } = JSON.parse(event.body);

    // Extract IP address from headers
    const ip_address = 
      event.headers['x-forwarded-for']?.split(',')[0].trim() ||
      event.headers['x-real-ip'] ||
      event.headers['client-ip'] ||
      'unknown';

    // Extract user agent
    const user_agent = event.headers['user-agent'] || 'unknown';

    // Validate required fields
    if (!event_type || !endpoint || !threat_level || !reason) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // Log security event
    const { data, error } = await supabase
      .from("security_events")
      .insert([{
        event_type,
        ip_address,
        user_agent,
        endpoint,
        request_method: request_method || 'POST',
        request_body: request_body || null,
        response_status: response_status || 403,
        threat_level,
        reason,
        metadata: metadata || null,
        location: location || null,
        blocked: blocked || false,
        user_id: user_id || null
      }])
      .select()
      .single();

    if (error) {
      console.error("Error logging security event:", error);
      // Return success anyway - don't block the main flow if security logging fails
      // This allows the system to continue working even if the table doesn't exist
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          event_id: null,
          message: "Security event acknowledged (logging unavailable)"
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        event_id: data.id,
        message: "Security event logged successfully"
      })
    };

  } catch (error) {
    console.error("Security logging error:", error);
    // Return success anyway - security logging shouldn't break main functionality
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Security event acknowledged" })
    };
  }
};
