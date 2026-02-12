// Get Verification Activity
// Returns paginated verification history with filters and search

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
    const { 
      organizationId, 
      environmentId,
      page = 1,
      limit = 20,
      search = '',
      filters = {}
    } = JSON.parse(event.body);

    if (!organizationId || !environmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and environment ID are required' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Build query for verification_activity table
      let query = supabase
        .from('verification_activity')
        .select(`
          id,
          audio_filename,
          audio_size_bytes,
          audio_format,
          verification_result,
          confidence_score,
          processing_time_ms,
          tamper_detected,
          created_at,
          api_key_id
        `, { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('environment_id', environmentId);

      // Apply search filter
      if (search) {
        query = query.ilike('audio_filename', `%${search}%`);
      }

      // Apply result filter
      if (filters.result) {
        const resultMap = {
          'authentic': 'verified',
          'tampered': 'tampered',
          'failed': 'unverified'
        };
        query = query.eq('verification_result', resultMap[filters.result] || filters.result);
      }

      // Apply date filters
      if (filters.dateFrom) {
        query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      // Order and pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: activities, count: total, error } = await query;

      if (error) throw error;

      // Get API key names
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
        file_name: activity.audio_filename || 'Unknown file',
        file_size: activity.audio_size_bytes || 0,
        file_type: activity.audio_format || 'audio/unknown',
        result: activity.tamper_detected ? 'tampered' :
                activity.verification_result === 'verified' ? 'authentic' : 
                activity.verification_result === 'unverified' ? 'failed' : activity.verification_result,
        confidence_score: activity.confidence_score ? parseFloat(activity.confidence_score) * 100 : null,
        processing_time_ms: activity.processing_time_ms || 0,
        api_key_name: apiKeyMap[activity.api_key_id] || 'Unknown',
        created_at: activity.created_at,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          activities: formattedActivities,
          total: total || 0,
          page,
          limit,
          totalPages: Math.ceil((total || 0) / limit),
        }),
      };
    } catch (dbError) {
      // If table doesn't exist, return empty data
      console.log('Verification activity query error:', dbError.message);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          activities: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        }),
      };
    }
  } catch (error) {
    console.error('Get verification activity error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
