-- Create a table for tracking API usage for rate limiting
CREATE TABLE public.api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_api_usage_key ON public.api_usage(key);
CREATE INDEX idx_api_usage_timestamp ON public.api_usage(timestamp);
CREATE INDEX idx_api_usage_key_timestamp ON public.api_usage(key, timestamp);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anyone to read/write usage entries
CREATE POLICY "Anyone can view API usage" 
  ON public.api_usage 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create API usage entries" 
  ON public.api_usage 
  FOR INSERT 
  WITH CHECK (true);

-- Create a function to clean up old usage data (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM public.api_usage 
  WHERE timestamp < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old data (runs daily)
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- You can manually run this function or set up a cron job
-- SELECT cron.schedule('cleanup-api-usage', '0 0 * * *', 'SELECT cleanup_old_api_usage();'); 