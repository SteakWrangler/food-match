-- Test RLS by checking what auth.uid() returns and if it matches profile
DO $$
DECLARE
    current_auth_uid uuid;
    profile_exists boolean;
BEGIN
    -- This is just a test to see what's happening with RLS
    -- We'll create a temporary function to help debug
    
    -- First, let's see if there are any issues with the profiles RLS policies
    -- and temporarily make them more permissive for debugging
    
    -- Current policy: "Users can view own profile" using auth.uid() = id
    -- Let's make sure this is working correctly
    
    RAISE NOTICE 'Testing RLS policies for profiles table';
END $$;

-- Let's check if the policy is working by creating a test function
CREATE OR REPLACE FUNCTION public.test_profile_access()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    current_user_id uuid;
BEGIN
    -- Get current authenticated user
    SELECT auth.uid() INTO current_user_id;
    
    -- Try to fetch the profile
    SELECT to_json(profiles.*) INTO result
    FROM public.profiles 
    WHERE id = current_user_id;
    
    RETURN json_build_object(
        'auth_uid', current_user_id,
        'profile_data', result,
        'profile_exists', (result IS NOT NULL)
    );
END;
$$;