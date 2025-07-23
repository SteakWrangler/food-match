// RESTORED REAL API CALLS
// =========================
// This file has been restored to use real API calls instead of mock data.
//
// TO ENABLE MOCK API SIMULATION:
// 1. Set USE_MOCK_API to true below
// 2. Add the import of getMockApiService
// 3. Add the mock API check in searchRestaurants method
// 4. Create src/integrations/supabase/mockApiService.ts if needed
//
// TO RESTORE REAL API CALLS:
// 1. Set USE_MOCK_API to false (current state)
// 2. Remove the import of getMockApiService
// 3. Remove the mock API check in searchRestaurants method
// 4. Delete src/integrations/supabase/mockApiService.ts when no longer needed
//
// =========================

import { supabase } from './client';
import { Restaurant } from '@/data/restaurants';

// RESTORED: Use real API calls instead of mock data
const USE_MOCK_API = false;

export interface HybridRestaurantSearchParams {
  location: string;
  radius?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  limit?: number;
  useHybrid?: boolean;
  pageToken?: string; // Add pageToken parameter
  fastMode?: boolean; // Add fast mode for initial loads
}

export class HybridRestaurantsAPI {
  async searchRestaurants(params: HybridRestaurantSearchParams): Promise<{ restaurants: Restaurant[], nextPageToken?: string }> {
    try {
      const { useHybrid = true, fastMode = false, ...searchParams } = params;

      // Use fast mode for initial loads
      if (fastMode) {
        return await this.searchWithGooglePlacesOnly(searchParams);
      }

      // Always use hybrid system (Google Places)
      return await this.searchWithHybridSystem(searchParams);
    } catch (error) {
      console.error('Error in hybrid restaurant search:', error);
      throw error;
    }
  }

  private async searchWithGooglePlacesOnly(params: Omit<HybridRestaurantSearchParams, 'useHybrid' | 'fastMode'>): Promise<{ restaurants: Restaurant[], nextPageToken?: string }> {
    try {
      // Only get restaurants from Google Places
      const { data: googlePlacesData, error: googleError } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'search-restaurants',
          location: params.location,
          radius: params.radius || 5000,
          keyword: params.keyword,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          openNow: params.openNow,
          limit: params.limit || 20,
          pageToken: params.pageToken
        },
      });

      if (googleError) {
        throw new Error(`Google Places API error: ${googleError.message}`);
      }

      if (!googlePlacesData || !googlePlacesData.restaurants) {
        throw new Error('No restaurants returned from Google Places API');
      }

      console.log(`Found ${googlePlacesData.restaurants.length} restaurants from Google Places (fast mode)`);

      // Return Google Places data directly
      return this.transformGooglePlacesData(googlePlacesData.restaurants);

    } catch (error) {
      console.error('Error in Google Places only search:', error);
      throw error;
    }
  }

  private async searchWithHybridSystem(params: Omit<HybridRestaurantSearchParams, 'useHybrid'>): Promise<{ restaurants: Restaurant[], nextPageToken?: string }> {
    try {
      // Step 1: Get restaurants from Google Places
      const { data: googlePlacesData, error: googleError } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'search-restaurants',
          location: params.location,
          radius: params.radius || 5000,
          keyword: params.keyword,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          openNow: params.openNow,
          limit: params.limit || 20,
          pageToken: params.pageToken // Add pageToken parameter
        },
      });

      if (googleError) {
        throw new Error(`Google Places API error: ${googleError.message}`);
      }

      if (!googlePlacesData || !googlePlacesData.restaurants) {
        throw new Error('No restaurants returned from Google Places API');
      }

      console.log(`Found ${googlePlacesData.restaurants.length} restaurants from Google Places`);
      console.log('Sample restaurant data:', googlePlacesData.restaurants[0]);

      // Step 2: Processing removed - just return Google Places data
      console.log('Processing removed - using Google Places data only');

      // Step 3: Transform and return final data with nextPageToken
      const transformedData = this.transformGooglePlacesData(googlePlacesData.restaurants);
      return {
        restaurants: transformedData.restaurants,
        nextPageToken: googlePlacesData.nextPageToken // Pass through the nextPageToken from Google Places
      };

    } catch (error) {
      console.error('Error in hybrid system:', error);
      throw error;
    }
  }

  private transformGooglePlacesData(restaurants: any[]): { restaurants: Restaurant[], nextPageToken?: string } {
    return {
      restaurants: restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine || 'Unknown',
        image: restaurant.image || '',
        images: restaurant.images || [],
        rating: restaurant.rating || 0,
        priceRange: restaurant.priceRange || '',
        distance: restaurant.distance || '',
        estimatedTime: restaurant.estimatedTime || '',
        description: '', // No description needed
        tags: restaurant.tags || [],
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        googleTypes: restaurant.googleTypes
      })),
      nextPageToken: undefined // Google Places doesn't return a page token directly in this response
    };
  }

  private transformHybridData(restaurants: any[]): { restaurants: Restaurant[], nextPageToken?: string } {
    return {
      restaurants: restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine || 'Unknown',
        image: restaurant.image || '',
        images: restaurant.images || [],
        rating: restaurant.rating || 0,
        priceRange: restaurant.priceRange || '',
        distance: restaurant.distance || '',
        estimatedTime: restaurant.estimatedTime || '',
        description: '', // No description needed
        tags: restaurant.tags || [],
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        googleTypes: restaurant.googleTypes
      })),
      nextPageToken: undefined // No page token in this response
    };
  }

  // Cache management methods
  async getCacheStats(): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'get-stats' }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      throw error;
    }
  }

  async cleanupCache(): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'cleanup-expired' }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error cleaning up cache:', error);
      throw error;
    }
  }
}

export const getHybridRestaurantsAPI = () => new HybridRestaurantsAPI(); 