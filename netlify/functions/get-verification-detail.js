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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Query actual verification record
      const { data: verification, error } = await supabase
        .from('verification_activity')
        .select(`
          id,
          audio_filename,
          audio_size_bytes,
          audio_format,
          audio_hash,
          verification_result,
          confidence_score,
          processing_time_ms,
          tamper_detected,
          tamper_details,
          policy_used,
          watermark_version,
          origin_detected,
          created_at,
          api_key_id
        `)
        .eq('id', verificationId)
        .single();

      if (error) throw error;

      if (!verification) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Verification not found' }),
        };
      }

      // Get API key name if exists
      let apiKeyName = 'Unknown';
      if (verification.api_key_id) {
        const { data: apiKey } = await supabase
          .from('api_keys')
          .select('name')
          .eq('id', verification.api_key_id)
          .single();
        
        if (apiKey) apiKeyName = apiKey.name;
      }

      // Format response
      const detail = {
        id: verification.id,
        file_name: verification.audio_filename || 'Unknown file',
        file_size: verification.audio_size_bytes || 0,
        file_type: verification.audio_format || 'audio/unknown',
        file_hash: verification.audio_hash || null,
        result: verification.tamper_detected ? 'tampered' :
                verification.verification_result === 'verified' ? 'authentic' : 
                verification.verification_result === 'unverified' ? 'failed' : verification.verification_result,
        confidence_score: verification.confidence_score ? parseFloat(verification.confidence_score) * 100 : null,
        processing_time_ms: verification.processing_time_ms || 0,
        api_key_name: apiKeyName,
        created_at: verification.created_at,
        metadata: {
          origin_detected: verification.origin_detected,
          watermark_version: verification.watermark_version,
          policy_used: verification.policy_used,
        },
        tamper_indicators: verification.tamper_detected && verification.tamper_details 
          ? (Array.isArray(verification.tamper_details) ? verification.tamper_details : [verification.tamper_details])
          : undefined,
        verification_method: 'Fusion Audio Verification Engine',
        request_id: `req_${verification.id.split('-')[0]}`,
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          verification: detail,
        }),
      };
    } catch (dbError) {
      console.log('Verification detail query error:', dbError.message);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Verification not found' }),
      };
    }
  } catch (error) {
    console.error('Get verification detail error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
