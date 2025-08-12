-- Grant permanent premium access to your account
-- This will set your subscription to active with no expiration date

UPDATE public.profiles 
SET 
    subscription_type = 'yearly',
    subscription_status = 'active',
    subscription_expires_at = NULL,  -- NULL means no expiration
    room_credits = 999999,           -- Large number of credits
    stripe_customer_id = 'test_customer_permanent',
    stripe_subscription_id = 'test_sub_permanent'
WHERE email = 'justinlink51@gmail.com';

-- Verify the update and test the subscription check function
SELECT 
    id,
    email,
    subscription_type,
    subscription_status,
    subscription_expires_at,
    room_credits,
    stripe_customer_id,
    stripe_subscription_id
FROM public.profiles 
WHERE email = 'justinlink51@gmail.com';

-- Test the has_active_subscription function
SELECT 
    id,
    has_active_subscription(id) as has_subscription
FROM public.profiles 
WHERE email = 'justinlink51@gmail.com';