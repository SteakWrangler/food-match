-- Create a table for caching restaurant data
CREATE TABLE public.restaurant_cache (
  id TEXT PRIMARY KEY,
  location TEXT NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  description TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL,
  price_range TEXT NOT NULL,
  sample_menu_item TEXT NOT NULL,
  sample_price TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on location for faster lookups
CREATE INDEX idx_restaurant_cache_location ON public.restaurant_cache(location);

-- Enable RLS
ALTER TABLE public.restaurant_cache ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anyone to read/write cache entries
CREATE POLICY "Anyone can view restaurant cache" 
  ON public.restaurant_cache 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create restaurant cache entries" 
  ON public.restaurant_cache 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update restaurant cache entries" 
  ON public.restaurant_cache 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete restaurant cache entries" 
  ON public.restaurant_cache 
  FOR DELETE 
  USING (true); 