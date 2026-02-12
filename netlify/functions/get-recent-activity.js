// Get Recent Activity
// Returns recent verification events for the activity feed

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
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
    const { organizationId, environmentId, limit = 10 } = JSON.parse(event.body);

    if (!organizationId || !environmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and environment ID are required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Query real verification activity data
      const { data: activities, error } = await supabase
        .from('verification_activity')
        .select(`
          id,
          verification_result,
          audio_filename,
          confidence_score,
          tamper_detected,
          created_at,
          api_key_id
        `)
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get API key names for the activities
      const apiKeyIds = [...new Set(activities?.map(a => a.api_key_id).filter(Boolean) || [])];
      let apiKeyMap = {};
      
      if (apiKeyIds.length > 0) {
        const { data: apiKeys } = await supabase
          .from('api_keys')
          .select('id, name')
          .in('id', apiKeyIds);
        
        apiKeyMap = (apiKeys || []).reduce((acc, key) => {
          acc[key.id] = key.name;
          return acc;
        }, {});
      }

      // Transform data to expected format
      const formattedActivities = (activities || []).map(activity => ({
        id: activity.id,
        type: activity.tamper_detected ? 'tamper.detected' : 
              activity.verification_result === 'verified' ? 'verification.completed' :
              activity.verification_result === 'unverified' ? 'verification.failed' : 'verification.completed',
        file_name: activity.audio_filename || 'Unknown file',
        result: activity.verification_result === 'verified' ? 'authentic' : 
                activity.tamper_detected ? 'tampered' : activity.verification_result,
        confidence_score: activity.confidence_score ? parseFloat(activity.confidence_score) * 100 : null,
        created_at: activity.created_at,
        api_key_name: apiKeyMap[activity.api_key_id] || 'Unknown',
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          activities: formattedActivities,
          count: formattedActivities.length,
        }),
      };
    } catch (dbError) {
      // If table doesn't exist, return empty array
      console.log('Verification activity query error:', dbError.message);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          activities: [],
          count: 0,
        }),
      };
    }
  } catch (error) {
    console.error('Get recent activity error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
