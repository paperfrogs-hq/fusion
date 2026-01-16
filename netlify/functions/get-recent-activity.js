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

    // Mock recent activity data (replace with actual verification_logs table query when it exists)
    // This would typically be:
    // const { data: activities } = await supabase
    //   .from('verification_logs')
    //   .select('id, type, file_name, result, confidence_score, created_at, api_key_name')
    //   .eq('organization_id', organizationId)
    //   .eq('environment_id', environmentId)
    //   .order('created_at', { ascending: false })
    //   .limit(limit);

    const mockActivities = [
      {
        id: '1',
        type: 'verification.completed',
        file_name: 'interview_recording.mp3',
        result: 'authentic',
        confidence_score: 98.5,
        created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        api_key_name: 'Production App',
      },
      {
        id: '2',
        type: 'tamper.detected',
        file_name: 'suspicious_audio.wav',
        result: 'tampered',
        confidence_score: 87.2,
        created_at: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        api_key_name: 'Mobile Client',
      },
      {
        id: '3',
        type: 'verification.completed',
        file_name: 'podcast_episode_12.mp3',
        result: 'authentic',
        confidence_score: 99.1,
        created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        api_key_name: 'Production App',
      },
      {
        id: '4',
        type: 'verification.completed',
        file_name: 'voice_memo_2024.m4a',
        result: 'authentic',
        confidence_score: 96.8,
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        api_key_name: 'Testing',
      },
      {
        id: '5',
        type: 'verification.failed',
        file_name: 'corrupted_file.mp3',
        result: 'failed',
        confidence_score: null,
        created_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        api_key_name: 'Mobile Client',
      },
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        activities: mockActivities.slice(0, limit),
        count: mockActivities.length,
      }),
    };
  } catch (error) {
    console.error('Get recent activity error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
