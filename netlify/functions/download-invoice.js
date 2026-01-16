// Download Invoice
// Generates and returns invoice PDF

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
    const { invoiceId } = JSON.parse(event.body);

    if (!invoiceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invoice ID is required' }),
      };
    }

    // In production, this would:
    // 1. Fetch invoice from Stripe
    // 2. Generate PDF (or redirect to Stripe hosted invoice)
    // 3. Return PDF blob

    // Mock HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { margin: 0; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; }
          .total { font-size: 20px; font-weight: bold; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice #${invoiceId}</h1>
          <p>Fusion Audio Verification</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h2>Bill To:</h2>
        <p>
          Your Organization Name<br>
          123 Business Street<br>
          San Francisco, CA 94102
        </p>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Professional Plan - Monthly Subscription</td>
              <td>1</td>
              <td>$199.00</td>
            </tr>
          </tbody>
        </table>

        <p class="total">Total: $199.00</p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 12px;">
          Thank you for your business!<br>
          For questions, contact billing@fusion.audio
        </p>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.html"`,
      },
      body: invoiceHTML,
    };
  } catch (error) {
    console.error('Download invoice error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
