// Export Verification Activity
// Exports verification activity to CSV format

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Convert object array to CSV
function arrayToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        `)
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

      // Order and limit to 1000 for export
      query = query
        .order('created_at', { ascending: false })
        .limit(1000);

      const { data: activities, error } = await query;

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

      // Format data for CSV
      const csvData = (activities || []).map(item => ({
        'Verification ID': item.id,
        'File Name': item.audio_filename || 'Unknown',
        'File Size (bytes)': item.audio_size_bytes || 0,
        'File Type': item.audio_format || 'unknown',
        'Result': item.tamper_detected ? 'tampered' :
                  item.verification_result === 'verified' ? 'authentic' : 
                  item.verification_result === 'unverified' ? 'failed' : item.verification_result,
        'Confidence Score (%)': item.confidence_score ? (parseFloat(item.confidence_score) * 100).toFixed(1) : 'N/A',
        'Processing Time (ms)': item.processing_time_ms || 0,
        'API Key': apiKeyMap[item.api_key_id] || 'Unknown',
        'Date': new Date(item.created_at).toLocaleString(),
      }));

      const csv = arrayToCSV(csvData);

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="verification-activity-${new Date().toISOString().split('T')[0]}.csv"`,
        },
        body: csv,
      };
    } catch (dbError) {
      // If table doesn't exist, return empty CSV
      console.log('Export verification activity error:', dbError.message);
      const emptyCsv = 'Verification ID,File Name,File Size (bytes),File Type,Result,Confidence Score (%),Processing Time (ms),API Key,Date\n';
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="verification-activity-${new Date().toISOString().split('T')[0]}.csv"`,
        },
        body: emptyCsv,
      };
    }
  } catch (error) {
    console.error('Export verification activity error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
