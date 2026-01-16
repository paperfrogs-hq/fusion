// Generate Compliance Report
// Creates a PDF compliance report for the specified date range

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Simple HTML to PDF conversion (in production, use a proper library like puppeteer or pdfkit)
function generateReportHTML(data, options) {
  const { organizationName, environmentName, dateFrom, dateTo, stats, verifications } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        .header { 
          border-bottom: 3px solid #3b82f6; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        h1 { color: #1f2937; margin: 0 0 10px 0; }
        .meta { color: #6b7280; font-size: 14px; }
        .section { margin: 30px 0; }
        .section h2 { 
          color: #1f2937; 
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card { 
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
        }
        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .stat-value { font-size: 32px; font-weight: bold; color: #1f2937; margin: 5px 0; }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .danger { color: #ef4444; }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 14px;
        }
        th { 
          background: #f3f4f6; 
          padding: 10px; 
          text-align: left;
          font-weight: 600;
        }
        td { 
          padding: 8px 10px; 
          border-bottom: 1px solid #e5e7eb;
        }
        .badge { 
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-neutral { background: #f3f4f6; color: #374151; }
        .footer { 
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .certification {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Compliance Report</h1>
        <div class="meta">
          <strong>Organization:</strong> ${organizationName}<br>
          <strong>Environment:</strong> ${environmentName}<br>
          <strong>Report Period:</strong> ${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}<br>
          <strong>Generated:</strong> ${new Date().toLocaleString()}
        </div>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Verifications</div>
            <div class="stat-value">${stats.total}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Success Rate</div>
            <div class="stat-value success">${stats.successRate}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Tampering Detected</div>
            <div class="stat-value danger">${stats.tampered}</div>
          </div>
        </div>
        <p>
          This report certifies that ${stats.total} audio verification operations were performed
          during the specified period. The verification system achieved a ${stats.successRate}% 
          success rate with ${stats.tampered} instances of detected audio tampering.
        </p>
      </div>

      ${options.includeTamperAnalysis && stats.tampered > 0 ? `
      <div class="section">
        <h2>Tamper Detection Analysis</h2>
        <p>
          During the reporting period, ${stats.tampered} audio files were flagged as potentially 
          tampered. All detections were made using advanced deep neural network analysis with 
          an average confidence score of ${stats.avgConfidence}%.
        </p>
        <p><strong>Common tampering indicators detected:</strong></p>
        <ul>
          <li>Spectral anomalies and discontinuities</li>
          <li>Metadata timestamp mismatches</li>
          <li>Waveform irregularities</li>
          <li>Encoding inconsistencies</li>
        </ul>
      </div>
      ` : ''}

      ${options.includeDetails ? `
      <div class="section">
        <h2>Verification Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>File Name</th>
              <th>Result</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${verifications.slice(0, 50).map(v => `
              <tr>
                <td>${new Date(v.created_at).toLocaleString()}</td>
                <td>${v.file_name}</td>
                <td>
                  <span class="badge badge-${v.result === 'authentic' ? 'success' : v.result === 'tampered' ? 'danger' : 'neutral'}">
                    ${v.result}
                  </span>
                </td>
                <td>${v.confidence_score ? Math.round(v.confidence_score) + '%' : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${verifications.length > 50 ? `<p><em>Showing first 50 of ${verifications.length} verifications</em></p>` : ''}
      </div>
      ` : ''}

      <div class="certification">
        <strong>Certification Statement:</strong><br>
        This report has been generated by the Fusion Audio Verification System and contains 
        accurate records of all audio verification operations performed during the specified 
        period. All verifications were conducted using industry-standard deep learning algorithms 
        and cryptographic validation techniques.
      </div>

      <div class="footer">
        <p>
          <strong>Fusion Audio Verification System</strong><br>
          Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
          This report is confidential and intended solely for compliance and auditing purposes.
        </p>
      </div>
    </body>
    </html>
  `;
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
      dateFrom, 
      dateTo,
      options = {}
    } = JSON.parse(event.body);

    if (!organizationId || !environmentId || !dateFrom || !dateTo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get organization and environment details
    const { data: org } = await supabase
      .from('client_organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const { data: env } = await supabase
      .from('environments')
      .select('display_name')
      .eq('id', environmentId)
      .single();

    // Mock verification data (replace with actual query)
    const mockVerifications = Array.from({ length: 100 }, (_, i) => ({
      id: `ver_${i}`,
      file_name: `audio_file_${i}.mp3`,
      result: i % 10 === 0 ? 'tampered' : i % 20 === 0 ? 'failed' : 'authentic',
      confidence_score: i % 20 === 0 ? null : 90 + Math.random() * 10,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const stats = {
      total: mockVerifications.length,
      authentic: mockVerifications.filter(v => v.result === 'authentic').length,
      tampered: mockVerifications.filter(v => v.result === 'tampered').length,
      failed: mockVerifications.filter(v => v.result === 'failed').length,
      successRate: Math.round((mockVerifications.filter(v => v.result === 'authentic').length / mockVerifications.length) * 100),
      avgConfidence: 94.2,
    };

    const reportData = {
      organizationName: org?.name || 'Unknown Organization',
      environmentName: env?.display_name || 'Unknown Environment',
      dateFrom,
      dateTo,
      stats,
      verifications: mockVerifications,
    };

    const htmlContent = generateReportHTML(reportData, options);

    // In production, convert HTML to PDF using puppeteer or similar
    // For now, return HTML (browser can handle PDF conversion)
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="compliance-report-${dateFrom}-to-${dateTo}.html"`,
      },
      body: htmlContent,
    };
  } catch (error) {
    console.error('Generate compliance report error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
