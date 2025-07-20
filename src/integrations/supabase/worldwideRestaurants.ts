import { supabase } from './client';
import { Restaurant } from '@/data/restaurants';

export interface RestaurantSearchParams {
  location: string;
  radius?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  limit?: number;
}

export class SupabaseWorldwideRestaurantsAPI {
  async searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase.functions.invoke('worldwide-restaurants', {
        body: {
          action: 'search-restaurants',
          location: params.location,
          radius: params.radius || 5000,
          keyword: params.keyword,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          openNow: params.openNow,
          limit: params.limit,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from Supabase function');
      }

      if (!data.restaurants) {
        throw new Error('Invalid response from Supabase function');
      }

      return data.restaurants;
    } catch (error) {
      console.error('Error calling Supabase Worldwide Restaurants function:', error);
      throw error;
    }
  }
}

export const getSupabaseWorldwideRestaurantsAPI = () => new SupabaseWorldwideRestaurantsAPI(); 