
-- Create a table for storing room data
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_restaurant_index INTEGER NOT NULL DEFAULT 0,
  swipes JSONB NOT NULL DEFAULT '{}'::jsonb,
  restaurants JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anyone to read/write rooms (since we want cross-device access)
CREATE POLICY "Anyone can view rooms" 
  ON public.rooms 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create rooms" 
  ON public.rooms 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms" 
  ON public.rooms 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete rooms" 
  ON public.rooms 
  FOR DELETE 
  USING (true);
