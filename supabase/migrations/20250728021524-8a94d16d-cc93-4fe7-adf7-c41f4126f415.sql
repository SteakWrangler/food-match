-- Create room_history table to save user's created rooms for recreation
CREATE TABLE public.room_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  room_id text NOT NULL,
  room_name text,
  location text NOT NULL,
  restaurants jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.room_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own room history" 
ON public.room_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own room history" 
ON public.room_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room history" 
ON public.room_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own room history" 
ON public.room_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_room_history_updated_at
BEFORE UPDATE ON public.room_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_room_history_user_id ON public.room_history(user_id);
CREATE INDEX idx_room_history_room_id ON public.room_history(room_id);
CREATE INDEX idx_room_history_last_accessed ON public.room_history(last_accessed DESC);