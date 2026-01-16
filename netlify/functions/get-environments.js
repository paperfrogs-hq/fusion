// Get Environments for Organization
// Returns sandbox and production environments for a specific organization

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { organizationId } = JSON.parse(event.body);

    if (!organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID is required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all environments for this organization
    const { data: environments, error } = await supabase
      .from('environments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_production', { ascending: true }); // Sandbox first

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch environments' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        environments: environments || [],
        count: environments?.length || 0
      }),
    };
  } catch (error) {
    console.error('Get environments error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
