// Get Organization by Slug
// Fetches public organization details by slug

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get slug from query params or body
    let slug;
    
    if (event.httpMethod === 'GET') {
      slug = event.queryStringParameters?.slug;
    } else {
      const body = JSON.parse(event.body || '{}');
      slug = body.slug;
    }

    if (!slug) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Slug is required' })
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch organization by slug (partial match since we add random suffix)
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, name, slug, plan_type, account_status, created_at')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      throw new Error('Database error');
    }

    if (!org) {
      // Try partial match (slug without the random suffix)
      const { data: orgs, error: searchError } = await supabase
        .from('organizations')
        .select('id, name, slug, plan_type, account_status, created_at')
        .ilike('slug', `${slug}%`)
        .limit(1);

      if (searchError) {
        console.error('Search error:', searchError);
        throw new Error('Database error');
      }

      if (!orgs || orgs.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Organization not found' })
        };
      }

      // Return first match
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          organization: {
            id: orgs[0].id,
            name: orgs[0].name,
            slug: orgs[0].slug,
            planType: orgs[0].plan_type,
            status: orgs[0].account_status,
            createdAt: orgs[0].created_at
          }
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          planType: org.plan_type,
          status: org.account_status,
          createdAt: org.created_at
        }
      })
    };

  } catch (error) {
    console.error('Get org by slug error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
