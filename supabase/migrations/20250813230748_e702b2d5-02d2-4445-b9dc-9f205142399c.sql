-- Remove permanent premium access and reset to normal user
UPDATE public.profiles 
SET 
    subscription_type = 'none',
    subscription_status = 'inactive',
    subscription_expires_at = NULL,
    room_credits = 0,  -- Reset to 0 credits
    stripe_customer_id = NULL,
    stripe_subscription_id = NULL,
    updated_at = NOW()
WHERE email = 'justinlink51@gmail.com';

-- Verify the reset
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