-- Add foreign key constraint with CASCADE DELETE for processed_sessions table
-- Note: user_favorites and room_history already have proper foreign key constraints

-- Add foreign key constraint to processed_sessions.user_id
ALTER TABLE public.processed_sessions 
ADD CONSTRAINT fk_processed_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify existing constraints for other tables are properly set
-- user_favorites.user_id already has: REFERENCES auth.users(id) ON DELETE CASCADE
-- room_history.user_id already has: REFERENCES auth.users(id) ON DELETE CASCADE

-- Note: profiles table should also cascade delete, but it's typically handled 
-- by the application since it may contain the primary user data
-- If needed, add: ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_user_id FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;