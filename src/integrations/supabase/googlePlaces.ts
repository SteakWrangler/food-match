import { supabase } from './client';
import { Restaurant } from '@/data/restaurants';

export interface RestaurantSearchParams {
  location: string;
  radius?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
}

export class SupabaseGooglePlacesAPI {
  async searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: {
          location: params.location,
          radius: params.radius || 5000,
          keyword: params.keyword,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          openNow: params.openNow,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.restaurants) {
        throw new Error('Invalid response from Supabase function');
      }

      return data.restaurants;
    } catch (error) {
      console.error('Error calling Supabase Google Places function:', error);
      throw error;
    }
  }
}

export const getSupabaseGooglePlacesAPI = () => new SupabaseGooglePlacesAPI(); 