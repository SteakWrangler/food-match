-- Fix data type mismatches in rooms table
-- Change host_id from TEXT to UUID to match auth.users
ALTER TABLE public.rooms ALTER COLUMN host_id TYPE UUID USING host_id::UUID;

-- Update the participants JSONB structure to use UUIDs for IDs
-- This will be handled in the application code since JSONB doesn't have typed constraints

-- Also ensure room IDs are proper length (current random generation might be too short)
-- We'll handle this in the application code

-- Add a function to safely get current user UUID for room operations
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;