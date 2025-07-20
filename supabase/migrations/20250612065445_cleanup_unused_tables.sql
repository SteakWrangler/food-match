-- Drop unused tables since we're now using static restaurant data
DROP TABLE IF EXISTS public.restaurant_cache;
DROP TABLE IF EXISTS public.image_cache; 