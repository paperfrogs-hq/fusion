// Load Supabase credentials from environment variables
// For local development: create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// For Netlify: Set environment variables in Netlify dashboard

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || window.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;

// Validate credentials are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not configured. Signups will be saved locally.');
    window.supabaseClient = null;
} else {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    console.log('✓ Supabase configured successfully');
}

