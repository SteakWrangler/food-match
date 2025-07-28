-- Create room_history table for storing past room data
CREATE TABLE public.room_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  room_name TEXT,
  location TEXT NOT NULL,
  restaurants JSONB NOT NULL, -- Store all restaurants from the room
  filters JSONB, -- Store filters used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_room_history_user_id ON public.room_history(user_id);
CREATE INDEX idx_room_history_created_at ON public.room_history(created_at);
CREATE INDEX idx_room_history_last_accessed ON public.room_history(last_accessed);

-- Enable RLS
ALTER TABLE public.room_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to manage their own room history
CREATE POLICY "Users can view own room history" 
  ON public.room_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own room history" 
  ON public.room_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own room history" 
  ON public.room_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own room history" 
  ON public.room_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION update_room_history_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update last_accessed
CREATE TRIGGER update_room_history_last_accessed 
    BEFORE UPDATE ON public.room_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_room_history_last_accessed(); 