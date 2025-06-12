
import { useQuery } from '@tanstack/react-query';
import { Restaurant } from '@/data/restaurants';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface FetchRestaurantsParams {
  location: string;
  radius?: number;
  limit?: number;
}

const fetchRestaurants = async ({ location, radius = 5000, limit = 20 }: FetchRestaurantsParams): Promise<Restaurant[]> => {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location, radius, limit })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch restaurants');
  }

  const data = await response.json();
  return data.restaurants;
};

export const useRestaurants = (location: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['restaurants', location],
    queryFn: () => fetchRestaurants({ location }),
    enabled: enabled && !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
