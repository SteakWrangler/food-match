
import { useQuery } from '@tanstack/react-query';
import { Restaurant } from '@/data/restaurants';

interface FetchRestaurantsParams {
  location: string;
  radius?: number;
  limit?: number;
}

const fetchRestaurants = async ({ location, radius = 5000, limit = 20 }: FetchRestaurantsParams): Promise<Restaurant[]> => {
  const response = await fetch(`https://ahfytcfndbnwrabryjnz.supabase.co/functions/v1/fetch-restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8`,
    },
    body: JSON.stringify({ location, radius, limit })
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText}`);
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
