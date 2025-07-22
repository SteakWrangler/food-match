-- Update rooms table to use restaurant IDs instead of array indices
-- This enables proper tracking when restaurants are added to the array

-- Add new columns for ID-based tracking
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS current_restaurant_id TEXT,
ADD COLUMN IF NOT EXISTS viewed_restaurant_ids TEXT[] NOT NULL DEFAULT '{}';

-- Drop the old index-based column
ALTER TABLE public.rooms DROP COLUMN IF EXISTS current_restaurant_index;

-- Add index for better performance on current_restaurant_id lookups
CREATE INDEX IF NOT EXISTS idx_rooms_current_restaurant_id ON public.rooms(current_restaurant_id); 