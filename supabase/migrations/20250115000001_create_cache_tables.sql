-- Note: restaurant_cache table will be handled separately if needed

-- ChatGPT processing cache table
CREATE TABLE IF NOT EXISTS public.chatgpt_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_name TEXT NOT NULL,
  google_place_id TEXT,
  cuisine TEXT,
  tags TEXT[],
  description TEXT,
  confidence_score INTEGER,
  raw_chatgpt_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_name)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_chatgpt_cache_name ON chatgpt_cache(restaurant_name);
CREATE INDEX IF NOT EXISTS idx_chatgpt_cache_updated ON chatgpt_cache(updated_at);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chatgpt_cache_updated_at 
    BEFORE UPDATE ON chatgpt_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for chatgpt_cache
ALTER TABLE public.chatgpt_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for chatgpt_cache
CREATE POLICY "Anyone can view chatgpt cache" 
  ON public.chatgpt_cache 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create chatgpt cache entries" 
  ON public.chatgpt_cache 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update chatgpt cache entries" 
  ON public.chatgpt_cache 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete chatgpt cache entries" 
  ON public.chatgpt_cache 
  FOR DELETE 
  USING (true); 