const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const formidable = require('formidable');
const fs = require('fs').promises;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse multipart form data
    const form = formidable({ multiples: false, maxFileSize: 100 * 1024 * 1024 });
    
    const parseForm = () => new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { files } = await parseForm();
    const file = files.file;

    if (!file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File is required' })
      };
    }

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Read file content
    const fileBuffer = await fs.readFile(file.filepath);
    
    // Generate audio hash
    const audioHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // TODO: Implement actual watermark extraction here
    // For now, we'll simulate verification by looking up the hash

    // Look up audio in registry
    const { data: audioRegistry, error: registryError } = await supabase
      .from('audio_registry')
      .select('*, user_audio_files(*)')
      .eq('audio_hash', audioHash)
      .single();

    if (registryError || !audioRegistry) {
      // Audio not found in registry - not protected
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          verified: false,
          watermarkFound: false,
          confidence: 0.0,
          message: 'No provenance watermark detected',
          metadata: null
        })
      };
    }

    // Fetch provenance chain
    const { data: provenanceChain } = await supabase
      .from('provenance_chain')
      .select('*')
      .eq('audio_id', audioRegistry.id)
      .order('chain_index', { ascending: true });

    // Calculate confidence score
    // In production, this would be based on watermark integrity
    let confidenceScore = 0.95;

    // Check for tampering indicators
    const currentHash = audioHash;
    const originalHash = audioRegistry.audio_hash;
    
    if (currentHash !== originalHash) {
      confidenceScore = 0.3; // Low confidence if hash doesn't match
    }

    // Record verification
    await supabase
      .from('verification_results')
      .insert([{
        audio_id: audioRegistry.id,
        verification_status: currentHash === originalHash ? 'verified' : 'tampered',
        confidence_score: confidenceScore,
        details: {
          hash_match: currentHash === originalHash,
          verification_method: 'hash_comparison',
          timestamp: new Date().toISOString()
        }
      }]);

    // Update user file verification count if exists
    if (audioRegistry.user_audio_files && audioRegistry.user_audio_files.length > 0) {
      const userFile = audioRegistry.user_audio_files[0];
      await supabase
        .from('user_audio_files')
        .update({
          verification_count: (userFile.verification_count || 0) + 1,
          last_verified_at: new Date().toISOString()
        })
        .eq('id', userFile.id);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        verified: currentHash === originalHash,
        watermarkFound: true,
        confidence: confidenceScore,
        metadata: {
          title: audioRegistry.metadata?.title,
          artist: audioRegistry.metadata?.artist,
          origin: audioRegistry.origin,
          uploadedAt: audioRegistry.created_at,
          watermarkId: audioRegistry.watermark_id
        },
        provenanceChain: provenanceChain || [],
        tamperedSections: currentHash !== originalHash ? ['hash_mismatch'] : []
      })
    };

  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};
