-- Add logging to the profile update function to see what's happening
CREATE OR REPLACE FUNCTION public.update_user_profile_debug(
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
  current_auth_uid uuid;
BEGIN
  -- Log the function call
  RAISE NOTICE 'update_user_profile_debug called with user_id: %, first_name: %, last_name: %', user_id_param, first_name_param, last_name_param;
  
  -- Get the current auth uid
  SELECT auth.uid() INTO current_auth_uid;
  RAISE NOTICE 'Current auth.uid(): %', current_auth_uid;
  
  -- Check if the requesting user matches the profile being updated
  IF current_auth_uid != user_id_param THEN
    RAISE NOTICE 'Authorization failed: auth.uid() = %, user_id_param = %', current_auth_uid, user_id_param;
    RAISE EXCEPTION 'Unauthorized: Cannot update another user''s profile';
  END IF;

  RAISE NOTICE 'Authorization passed, proceeding with update';

  -- Update the profile
  UPDATE public.profiles 
  SET 
    first_name = COALESCE(first_name_param, first_name),
    last_name = COALESCE(last_name_param, last_name), 
    avatar_url = COALESCE(avatar_url_param, avatar_url),
    preferences = COALESCE(preferences_param, preferences),
    updated_at = now()
  WHERE id = user_id_param;

  RAISE NOTICE 'Update completed';

  -- Return the updated profile
  SELECT to_json(profiles.*) INTO result_profile
  FROM public.profiles 
  WHERE id = user_id_param;

  RAISE NOTICE 'Profile retrieved: %', result_profile;

  RETURN result_profile;
END;
$$;