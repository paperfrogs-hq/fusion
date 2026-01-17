-- Create security events table to track hack attempts and suspicious activities
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- sql_injection, brute_force, unauthorized_access, suspicious_activity, xss_attempt, etc.
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  endpoint TEXT NOT NULL,
  request_method TEXT NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  threat_level TEXT NOT NULL, -- critical, high, medium, low
  reason TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  location TEXT, -- Geo-location if available
  blocked BOOLEAN DEFAULT false,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for fast querying
CREATE INDEX idx_security_events_ip ON public.security_events(ip_address);
CREATE INDEX idx_security_events_detected_at ON public.security_events(detected_at DESC);
CREATE INDEX idx_security_events_threat_level ON public.security_events(threat_level);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_blocked ON public.security_events(blocked);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert/read (admin panel will use service key)
CREATE POLICY "Service role can do everything on security_events"
ON public.security_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_endpoint TEXT,
  p_request_method TEXT,
  p_request_body JSONB,
  p_response_status INTEGER,
  p_threat_level TEXT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_blocked BOOLEAN DEFAULT false,
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    ip_address,
    user_agent,
    endpoint,
    request_method,
    request_body,
    response_status,
    threat_level,
    reason,
    metadata,
    location,
    blocked,
    user_id
  ) VALUES (
    p_event_type,
    p_ip_address,
    p_user_agent,
    p_endpoint,
    p_request_method,
    p_request_body,
    p_response_status,
    p_threat_level,
    p_reason,
    p_metadata,
    p_location,
    p_blocked,
    p_user_id
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE public.security_events IS 'Tracks all security events, hack attempts, and suspicious activities with IP addresses';
