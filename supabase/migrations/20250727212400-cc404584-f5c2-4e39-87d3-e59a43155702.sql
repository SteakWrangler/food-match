-- Fix existing profile data with improper name separation
UPDATE public.profiles 
SET 
  first_name = split_part(first_name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(first_name, ' '), 1) > 1 
    THEN array_to_string(string_to_array(first_name, ' ')[2:], ' ')
    ELSE last_name
  END
WHERE last_name IS NULL AND first_name LIKE '% %';

-- Update the trigger function to better handle name parsing from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  full_name text;
  name_parts text[];
BEGIN
  -- Get the full name from metadata, fallback to email prefix
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Split the name into parts
  name_parts := string_to_array(trim(full_name), ' ');
  
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    name_parts[1], -- First name
    CASE 
      WHEN array_length(name_parts, 1) > 1 
      THEN array_to_string(name_parts[2:], ' ') -- Last name(s)
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;