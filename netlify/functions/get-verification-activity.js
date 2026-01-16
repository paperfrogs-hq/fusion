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

    // Mock data for now (replace with actual verification_logs table query when it exists)
    // In production, this would query the verification_logs table with proper filtering
    
    const mockData = Array.from({ length: 147 }, (_, i) => ({
      id: `ver_${i + 1}`,
      file_name: [
        'interview_recording.mp3',
        'podcast_episode.wav',
        'voice_memo.m4a',
        'conference_call.mp3',
        'suspicious_audio.wav',
        'music_track.mp3',
        'news_broadcast.mp3',
        'lecture_recording.wav'
      ][i % 8],
      file_size: Math.floor(Math.random() * 10000000) + 100000,
      file_type: ['audio/mp3', 'audio/wav', 'audio/m4a'][i % 3],
      result: ['authentic', 'authentic', 'authentic', 'authentic', 'tampered', 'failed'][i % 6],
      confidence_score: i % 6 === 4 ? 87.2 : i % 6 === 5 ? null : 90 + Math.random() * 10,
      processing_time_ms: Math.floor(Math.random() * 800) + 200,
      api_key_name: ['Production App', 'Mobile Client', 'Testing', 'Staging'][i % 4],
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    // Apply search filter
    let filtered = mockData;
    if (search) {
      filtered = filtered.filter(item => 
        item.file_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply result filter
    if (filters.result) {
      filtered = filtered.filter(item => item.result === filters.result);
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(item => new Date(item.created_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.created_at) <= toDate);
    }

    // Pagination
    const total = filtered.length;
    const offset = (page - 1) * limit;
    const activities = filtered.slice(offset, offset + limit);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        activities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }),
    };
  } catch (error) {
    console.error('Get verification activity error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
