-- Update rooms table to support separate restaurant and food type swipes
ALTER TABLE public.rooms 
ADD COLUMN restaurant_swipes JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN food_type_swipes JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN filters JSONB,
ADD COLUMN next_page_token TEXT;

-- Add indexes for better performance
CREATE INDEX idx_rooms_host_id ON public.rooms(host_id);
CREATE INDEX idx_rooms_created_at ON public.rooms(created_at);
CREATE INDEX idx_rooms_updated_at ON public.rooms(updated_at);

-- Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 