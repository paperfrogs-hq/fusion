-- Create users table for individual creators/artists
-- This is separate from client_users (business portal) and admin_users (admin panel)

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'creator', -- creator, artist, platform, developer
  password_hash TEXT NOT NULL,
  api_key TEXT UNIQUE,
  
  -- Verification & Status
  email_verified BOOLEAN DEFAULT false,
  account_status TEXT NOT NULL DEFAULT 'active', -- active, suspended, pending_verification
  
  -- Metadata & Settings
  metadata JSONB DEFAULT '{}', -- Flexible storage for verification tokens, preferences, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add metadata column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.users ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Sessions table for user authentication
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User audio files table
CREATE TABLE IF NOT EXISTS public.user_audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  audio_registry_id UUID REFERENCES public.audio_registry(id) ON DELETE SET NULL,
  
  -- File Info
  original_filename TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_format TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- Provenance
  provenance_status TEXT DEFAULT 'pending', -- pending, verified, tampered
  confidence_score DECIMAL(5,4) DEFAULT 0.0000,
  watermark_embedded BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  verification_count INTEGER DEFAULT 0
);

-- User verification history
CREATE TABLE IF NOT EXISTS public.user_verification_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  audio_file_id UUID REFERENCES public.user_audio_files(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL, -- verified, tampered, failed
  confidence_score DECIMAL(5,4),
  verification_method TEXT,
  details JSONB,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON public.users(api_key);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_audio_files_user_id ON public.user_audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audio_files_registry_id ON public.user_audio_files(audio_registry_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_history_user_id ON public.user_verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_history_audio_id ON public.user_verification_history(audio_file_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verification_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for Netlify functions using service role)
CREATE POLICY "Service role can do everything on users"
ON public.users FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_sessions"
ON public.user_sessions FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_audio_files"
ON public.user_audio_files FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_verification_history"
ON public.user_verification_history FOR ALL
USING (true)
WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Individual user accounts for creators, artists, and developers';
COMMENT ON COLUMN public.users.metadata IS 'JSONB storage for verification tokens, preferences, and flexible data';
COMMENT ON TABLE public.user_sessions IS 'Authentication sessions with 24-hour expiry';
COMMENT ON TABLE public.user_audio_files IS 'Audio files uploaded by users with provenance tracking';
COMMENT ON TABLE public.user_verification_history IS 'History of all verification attempts';
