// Get Verification Detail
// Returns detailed information about a specific verification

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
    const { verificationId } = JSON.parse(event.body);

    if (!verificationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Verification ID is required' }),
      };
    }

    // Mock detailed data (replace with actual database query)
    const isTampered = verificationId.includes('2') || verificationId.includes('5');
    const isFailed = verificationId.includes('6');

    const mockDetail = {
      id: verificationId,
      file_name: 'interview_recording_final.mp3',
      file_size: 4567890,
      file_type: 'audio/mp3',
      file_hash: 'a7f8d9e1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
      result: isFailed ? 'failed' : isTampered ? 'tampered' : 'authentic',
      confidence_score: isFailed ? null : isTampered ? 87.2 : 98.5,
      processing_time_ms: 342,
      api_key_name: 'Production App',
      created_at: new Date().toISOString(),
      metadata: {
        duration_seconds: 247,
        sample_rate: 44100,
        channels: 2,
        codec: 'MP3',
      },
      tamper_indicators: isTampered ? [
        'Spectral anomalies detected at 2:15 - 2:47',
        'Discontinuity in audio waveform at 3:12',
        'Metadata timestamp mismatch',
      ] : undefined,
      verification_method: 'Deep Neural Network Analysis v2.1',
      request_id: `req_${Math.random().toString(36).substr(2, 9)}`,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        verification: mockDetail,
      }),
    };
  } catch (error) {
    console.error('Get verification detail error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
