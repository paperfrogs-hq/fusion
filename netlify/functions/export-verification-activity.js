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

    // Mock data for export (replace with actual database query)
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      id: `ver_${i + 1}`,
      file_name: [
        'interview_recording.mp3',
        'podcast_episode.wav',
        'voice_memo.m4a',
        'conference_call.mp3',
        'suspicious_audio.wav'
      ][i % 5],
      file_size: Math.floor(Math.random() * 10000000) + 100000,
      file_type: ['audio/mp3', 'audio/wav', 'audio/m4a'][i % 3],
      result: ['authentic', 'authentic', 'authentic', 'tampered', 'failed'][i % 5],
      confidence_score: i % 5 === 4 ? 'N/A' : (90 + Math.random() * 10).toFixed(1),
      processing_time_ms: Math.floor(Math.random() * 800) + 200,
      api_key_name: ['Production App', 'Mobile Client', 'Testing'][i % 3],
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    // Apply filters (same as get-verification-activity.js)
    let filtered = mockData;
    if (search) {
      filtered = filtered.filter(item => 
        item.file_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filters.result) {
      filtered = filtered.filter(item => item.result === filters.result);
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(item => new Date(item.created_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.created_at) <= toDate);
    }

    // Format data for CSV
    const csvData = filtered.map(item => ({
      'Verification ID': item.id,
      'File Name': item.file_name,
      'File Size (bytes)': item.file_size,
      'File Type': item.file_type,
      'Result': item.result,
      'Confidence Score (%)': item.confidence_score,
      'Processing Time (ms)': item.processing_time_ms,
      'API Key': item.api_key_name,
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
  } catch (error) {
    console.error('Export verification activity error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
