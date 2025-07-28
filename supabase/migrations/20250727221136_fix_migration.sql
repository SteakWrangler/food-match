-- Update existing profiles with missing first_name/last_name from auth metadata
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN position(' ' in trim(COALESCE(
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
      split_part(profiles.email, '@', 1)
    ))) > 0 THEN 
      trim(substring(COALESCE(
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
        split_part(profiles.email, '@', 1)
      ) from 1 for position(' ' in trim(COALESCE(
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
        split_part(profiles.email, '@', 1)
      ))) - 1))
    ELSE 
      trim(COALESCE(
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
        split_part(profiles.email, '@', 1)
      ))
  END,
  last_name = CASE 
    WHEN position(' ' in trim(COALESCE(
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
      split_part(profiles.email, '@', 1)
    ))) > 0 THEN 
      trim(substring(COALESCE(
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
        split_part(profiles.email, '@', 1)
      ) from position(' ' in trim(COALESCE(
        (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
        split_part(profiles.email, '@', 1)
      ))) + 1))
    ELSE 
      NULL
  END
WHERE first_name IS NULL OR last_name IS NULL;