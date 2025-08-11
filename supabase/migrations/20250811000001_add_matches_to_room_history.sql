ALTER TABLE public.room_history ADD COLUMN matches JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_room_history_matches ON public.room_history USING gin (matches);