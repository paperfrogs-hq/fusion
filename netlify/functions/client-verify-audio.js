// Client Portal Audio Verification
// Handles audio file verification for enterprise clients
// Stores results in verification_activity table for real-time tracking

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simulated audio analysis - in production, this would call actual AI/ML services
async function analyzeAudio(audioBuffer, filename) {
  // Generate hash of the audio file
  const hash = crypto.createHash('sha256').update(audioBuffer).digest('hex');
  
  // Simulate analysis processing time (100-500ms)
  const processingTime = Math.floor(Math.random() * 400) + 100;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Simulate verification results
  // In production, this would use actual ML models for audio fingerprinting,
  // watermark detection, tampering analysis, etc.
  const random = Math.random();
  
  let verificationResult, confidenceScore, tamperDetected, originDetected;
  
  if (random < 0.85) {
    // 85% chance of verified/authentic
    verificationResult = 'verified';
    confidenceScore = 0.90 + (Math.random() * 0.10); // 90-100%
    tamperDetected = false;
    originDetected = Math.random() > 0.3 ? 'human' : 'ai';
  } else if (random < 0.95) {
    // 10% chance of tampered
    verificationResult = 'tampered';
    confidenceScore = 0.70 + (Math.random() * 0.20); // 70-90%
    tamperDetected = true;
    originDetected = 'unknown';
  } else {
    // 5% chance of unverified
    verificationResult = 'unverified';
    confidenceScore = 0.50 + (Math.random() * 0.30); // 50-80%
    tamperDetected = false;
    originDetected = 'unknown';
  }
  
  return {
    hash,
    verificationResult,
    confidenceScore,
    tamperDetected,
    originDetected,
    processingTime,
    tamperDetails: tamperDetected ? {
      indicators: [
        'Spectral discontinuity detected',
        'Audio signature mismatch in segment',
        'Metadata inconsistency'
      ],
      severity: 'medium'
    } : null,
    watermarkVersion: Math.random() > 0.5 ? 'v2.1' : null,
    policyUsed: 'default'
  };
}

function getAudioFormat(filename) {
  if (!filename) return 'unknown';
  const ext = filename.split('.').pop()?.toLowerCase();
  const formats = {
    'mp3': 'audio/mp3',
    'wav': 'audio/wav',
    'm4a': 'audio/m4a',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'wma': 'audio/wma',
  };
  return formats[ext] || `audio/${ext}`;
}

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
    // Check env vars
    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse JSON body with base64 file data
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    const { 
      organizationId, 
      environmentId, 
      userId,
      fileData,  // Base64 encoded audio
      fileName,
      fileSize 
    } = body;

    // Validate required fields
    if (!organizationId || !environmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Organization ID and environment ID are required' }),
      };
    }

    if (!fileData || !fileName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Audio file data and filename are required' }),
      };
    }

    // Convert base64 to buffer
    let audioBuffer;
    try {
      audioBuffer = Buffer.from(fileData, 'base64');
    } catch (bufferError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid base64 data' }),
      };
    }

    // Check organization quota
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('quota_limit, quota_used')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Organization not found' }),
      };
    }

    if (org.quota_used >= org.quota_limit) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Monthly quota exceeded',
          quotaUsed: org.quota_used,
          quotaLimit: org.quota_limit
        }),
      };
    }

    // Perform audio analysis
    const analysis = await analyzeAudio(audioBuffer, fileName);

    // Store verification result in database
    const verificationRecord = {
      organization_id: organizationId,
      environment_id: environmentId,
      audio_filename: fileName,
      audio_size_bytes: fileSize || audioBuffer.length,
      audio_format: getAudioFormat(fileName),
      audio_hash: analysis.hash,
      verification_result: analysis.verificationResult,
      confidence_score: analysis.confidenceScore,
      tamper_detected: analysis.tamperDetected,
      tamper_details: analysis.tamperDetails,
      origin_detected: analysis.originDetected,
      watermark_version: analysis.watermarkVersion,
      policy_used: analysis.policyUsed,
      processing_time_ms: analysis.processingTime,
      user_id: userId || null,
      ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
    };

    const { data: verification, error: insertError } = await supabase
      .from('verification_activity')
      .insert(verificationRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store verification:', insertError);
      // Continue even if storage fails - return results to user
    }

    // Update organization quota
    await supabase
      .from('organizations')
      .update({ quota_used: org.quota_used + 1 })
      .eq('id', organizationId);

    // Format response
    const response = {
      id: verification?.id || crypto.randomUUID(),
      filename: fileName,
      fileSize: fileSize || audioBuffer.length,
      result: analysis.verificationResult === 'verified' ? 'authentic' : 
              analysis.tamperDetected ? 'tampered' : 
              analysis.verificationResult,
      confidenceScore: Math.round(analysis.confidenceScore * 100),
      processingTimeMs: analysis.processingTime,
      originDetected: analysis.originDetected,
      tamperDetected: analysis.tamperDetected,
      tamperIndicators: analysis.tamperDetails?.indicators || [],
      hash: analysis.hash,
      timestamp: new Date().toISOString(),
      quotaUsed: org.quota_used + 1,
      quotaLimit: org.quota_limit,
      quotaRemaining: org.quota_limit - org.quota_used - 1,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        verification: response,
      }),
    };
  } catch (error) {
    console.error('Client verify audio error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
