import { supabase } from './client';
import { Tables } from './types';

export interface FavoriteRestaurant {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_data: any; // Complete restaurant data
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  priceRange: string;
  vicinity?: string;
  openingHours?: string[];
  cuisine?: string;
  description?: string;
  tags?: string[];
}

export class FavoritesService {
  /**
   * Add a restaurant to user's favorites
   */
  async addFavorite(userId: string, restaurant: Restaurant): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          restaurant_id: restaurant.id,
          restaurant_data: restaurant as any
        });

      return { error };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return { error };
    }
  }

  /**
   * Remove a restaurant from user's favorites
   */
  async removeFavorite(userId: string, restaurantId: string): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);

      return { error };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return { error };
    }
  }

  /**
   * Get all favorites for a user
   */
  async getFavorites(userId: string): Promise<{ data: FavoriteRestaurant[] | null; error: any | null }> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error getting favorites:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a restaurant is favorited by a user
   */
  async isFavorited(userId: string, restaurantId: string): Promise<{ isFavorited: boolean; error: any | null }> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return { isFavorited: false, error };
      }

      return { isFavorited: !!data, error: null };
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return { isFavorited: false, error };
    }
  }

  /**
   * Toggle favorite status for a restaurant
   */
  async toggleFavorite(userId: string, restaurant: Restaurant): Promise<{ isFavorited: boolean; error: any | null }> {
    try {
      const { isFavorited, error: checkError } = await this.isFavorited(userId, restaurant.id);
      
      if (checkError) {
        return { isFavorited: false, error: checkError };
      }

      if (isFavorited) {
        const { error } = await this.removeFavorite(userId, restaurant.id);
        return { isFavorited: false, error };
      } else {
        const { error } = await this.addFavorite(userId, restaurant);
        return { isFavorited: true, error };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { isFavorited: false, error };
    }
  }

  /**
   * Get favorite restaurants as Restaurant objects
   */
  async getFavoriteRestaurants(userId: string): Promise<{ data: Restaurant[] | null; error: any | null }> {
    try {
      const { data: favorites, error } = await this.getFavorites(userId);
      
      if (error) {
        return { data: null, error };
      }

      if (!favorites) {
        return { data: [], error: null };
      }

      // Convert favorite data to Restaurant objects
      const restaurants: Restaurant[] = favorites.map(fav => fav.restaurant_data);
      
      return { data: restaurants, error: null };
    } catch (error) {
      console.error('Error getting favorite restaurants:', error);
      return { data: null, error };
    }
  }
}

export const getFavoritesService = () => new FavoritesService(); 