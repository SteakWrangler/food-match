-- Create a table for caching image URLs
CREATE TABLE public.image_cache (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cuisine TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on cuisine for faster lookups
CREATE INDEX idx_image_cache_cuisine ON public.image_cache(cuisine);

-- Enable RLS
ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anyone to read/write cache entries
CREATE POLICY "Anyone can view image cache" 
  ON public.image_cache 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create image cache entries" 
  ON public.image_cache 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update image cache entries" 
  ON public.image_cache 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete image cache entries" 
  ON public.image_cache 
  FOR DELETE 
  USING (true); 