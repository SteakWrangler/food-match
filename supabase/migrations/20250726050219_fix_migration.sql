-- Create a security definer function to handle profile updates
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id_param uuid,
  first_name_param text DEFAULT NULL,
  last_name_param text DEFAULT NULL,
  avatar_url_param text DEFAULT NULL,
  preferences_param jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_profile json;
BEGIN
  -- Check if the requesting user matches the profile being updated
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update another user''s profile';
  END IF;

  -- Update the profile
  UPDATE public.profiles 
  SET 
    first_name = COALESCE(first_name_param, first_name),
    last_name = COALESCE(last_name_param, last_name), 
    avatar_url = COALESCE(avatar_url_param, avatar_url),
    preferences = COALESCE(preferences_param, preferences),
    updated_at = now()
  WHERE id = user_id_param;

  -- Return the updated profile
  SELECT to_json(profiles.*) INTO result_profile
  FROM public.profiles 
  WHERE id = user_id_param;

  RETURN result_profile;
END;
$$;