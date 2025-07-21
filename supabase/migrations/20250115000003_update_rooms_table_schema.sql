-- Update rooms table to match the expected schema
-- Add missing columns and rename existing ones

-- Add missing columns
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS restaurant_swipes JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS food_type_swipes JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS filters JSONB,
ADD COLUMN IF NOT EXISTS next_page_token TEXT;

-- Drop the old swipes column since we now have separate restaurant_swipes and food_type_swipes
ALTER TABLE public.rooms DROP COLUMN IF EXISTS swipes; 