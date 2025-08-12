-- Add subscription and credits functionality to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_type TEXT CHECK (subscription_type IN ('none', 'monthly', 'yearly')) DEFAULT 'none',
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')) DEFAULT 'inactive',
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN room_credits INTEGER DEFAULT 0,
ADD COLUMN total_rooms_created INTEGER DEFAULT 0;

-- Create index for subscription queries
CREATE INDEX idx_profiles_subscription ON public.profiles (subscription_type, subscription_status);
CREATE INDEX idx_profiles_credits ON public.profiles (room_credits);
CREATE INDEX idx_profiles_stripe ON public.profiles (stripe_customer_id);

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND subscription_status = 'active' 
    AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has room credits
CREATE OR REPLACE FUNCTION public.get_room_credits(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  credits INTEGER;
BEGIN
  SELECT room_credits INTO credits 
  FROM public.profiles 
  WHERE id = user_id;
  
  RETURN COALESCE(credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to consume room credit
CREATE OR REPLACE FUNCTION public.consume_room_credit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT room_credits INTO current_credits 
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Check if user has credits
  IF COALESCE(current_credits, 0) > 0 THEN
    -- Consume one credit and increment rooms created
    UPDATE public.profiles 
    SET 
      room_credits = room_credits - 1,
      total_rooms_created = total_rooms_created + 1,
      updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add room credits
CREATE OR REPLACE FUNCTION public.add_room_credits(user_id UUID, credits_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    room_credits = room_credits + credits_to_add,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;