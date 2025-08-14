-- Create a table to track processed Stripe sessions to prevent duplicate credit processing
CREATE TABLE IF NOT EXISTS public.processed_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  credits_added INTEGER NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.processed_sessions ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to insert and select (using service role key)
CREATE POLICY "Edge functions can manage processed sessions" 
ON public.processed_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_processed_sessions_session_id ON public.processed_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_processed_sessions_user_id ON public.processed_sessions(user_id);