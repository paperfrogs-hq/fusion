// Get Notifications
// Fetches user notifications

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const { userId, organizationId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to fetch from notifications table if it exists
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // Table doesn't exist or other error - return default notification
      console.log('Notifications table error (expected if table does not exist):', error.code);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'info',
              title: 'Welcome to Fusion!',
              message: 'Get started by creating your first API key or verifying audio content.',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      };
    }

    // Transform data to match frontend interface
    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      type: n.type || 'info',
      title: n.title,
      message: n.message,
      read: n.read || false,
      createdAt: n.created_at,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ notifications: formattedNotifications }),
    };

  } catch (error) {
    console.error('Get notifications error:', error);
    // Return default notification on error
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        notifications: [
          {
            id: '1',
            type: 'info',
            title: 'Welcome to Fusion!',
            message: 'Get started by creating your first API key.',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    };
  }
};
