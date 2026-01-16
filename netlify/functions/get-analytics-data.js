// Get Analytics Data
// Returns comprehensive analytics for charts and metrics

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
    const { organizationId, environmentId, timeRange = '30d' } = JSON.parse(event.body);

    if (!organizationId || !environmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and environment ID are required' }),
      };
    }

    // Calculate date range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[timeRange] || 30;

    // Mock analytics data (replace with actual verification_logs queries)
    const analytics = {
      overview: {
        total_verifications: 1247,
        authentic_count: 1123,
        tampered_count: 98,
        failed_count: 26,
        avg_confidence: 94.2,
        avg_processing_time: 342,
      },
      timeSeriesData: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          authentic: Math.floor(Math.random() * 50) + 20,
          tampered: Math.floor(Math.random() * 8) + 1,
          failed: Math.floor(Math.random() * 3),
        };
      }),
      topApiKeys: [
        { name: 'Production App', count: 543 },
        { name: 'Mobile Client', count: 412 },
        { name: 'Testing', count: 198 },
        { name: 'Staging', count: 94 },
      ],
      fileTypeDistribution: [
        { type: 'audio/mp3', count: 687 },
        { type: 'audio/wav', count: 412 },
        { type: 'audio/m4a', count: 148 },
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.floor(Math.random() * 80) + (hour >= 9 && hour <= 17 ? 40 : 10),
      })),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ analytics }),
    };
  } catch (error) {
    console.error('Get analytics data error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
