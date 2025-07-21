// MOCK API SIMULATION MODE
// =========================
// This file has been modified to use a mock API service that simulates
// the full API flow but returns hard-coded data instead of making actual API calls.
//
// TO RESTORE REAL API CALLS:
// 1. Set USE_MOCK_API to false below
// 2. Remove the import of getMockApiService
// 3. Remove the mock API check in searchRestaurants method
// 4. Delete src/integrations/supabase/mockApiService.ts when no longer needed
//
// TO ENABLE MOCK API SIMULATION:
// 1. Set USE_MOCK_API to true (current state)
// 2. Mock API will simulate the full API flow with hard-coded data
//
// =========================

import { supabase } from './client';
import { Restaurant } from '@/data/restaurants';
import { getMockApiService } from './mockApiService';

// MOCK API: Use mock API service instead of real API calls
// TODO: Restore real API calls by setting USE_MOCK_API to false
const USE_MOCK_API = true;

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
}

export class HybridRestaurantsAPI {
  private mockApiService = getMockApiService();

  async searchRestaurants(params: HybridRestaurantSearchParams): Promise<{ restaurants: Restaurant[], nextPageToken?: string }> {
    try {
      // MOCK API: Use mock API service instead of real API calls
      if (USE_MOCK_API) {
        console.log('🔧 MOCK API: Using mock API service instead of real API calls');
        console.log('🔧 To restore real API calls, set USE_MOCK_API to false in hybridRestaurants.ts');
        return this.mockApiService.getMockRestaurantsWithAPISimulation(params);
      }

      const { useHybrid = true, ...searchParams } = params;

      // Always use hybrid system (Google Places + ChatGPT)
      return await this.searchWithHybridSystem(searchParams);
    } catch (error) {
      console.error('Error in hybrid restaurant search:', error);
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

      // Step 2: Process with ChatGPT (with caching)
      const { data: chatGPTData, error: chatGPTError } = await supabase.functions.invoke('chatgpt-processor', {
        body: {
          action: 'process-restaurants',
          restaurants: googlePlacesData.restaurants,
          google_place_id: params.location
        },
      });

      if (chatGPTError) {
        console.warn('ChatGPT processing failed, using Google Places data only:', chatGPTError.message);
        return this.transformGooglePlacesData(googlePlacesData.restaurants);
      }

      if (!chatGPTData || !chatGPTData.restaurants) {
        console.warn('No ChatGPT data returned, using Google Places data only');
        return this.transformGooglePlacesData(googlePlacesData.restaurants);
      }

      console.log(`Processed ${chatGPTData.processed_count} restaurants with ChatGPT`);
      console.log('Sample ChatGPT processed data:', chatGPTData.restaurants[0]);

      // Step 3: Transform and return final data with nextPageToken
      const transformedData = this.transformHybridData(chatGPTData.restaurants);
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
        description: restaurant.description || '',
        tags: restaurant.tags || [],
        tagsWithConfidence: [], // Empty array when ChatGPT fails
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        googleTypes: restaurant.googleTypes,
        processedByChatGPT: false,
        chatGPTConfidence: 0
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
        description: restaurant.description || '',
        tags: restaurant.tags || [],
        tagsWithConfidence: restaurant.tags_with_confidence || [],
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        openingHours: restaurant.openingHours,
        googleTypes: restaurant.googleTypes,
        processedByChatGPT: restaurant.processedByChatGPT || false,
        chatGPTConfidence: restaurant.chatGPTConfidence || 0
      })),
      nextPageToken: undefined // ChatGPT doesn't return a page token directly in this response
    };
  }

  // Cache management methods
  async getCacheStats(): Promise<any> {
    try {
      if (USE_MOCK_API) {
        // Use mock API service for cache stats
        const result = await this.mockApiService.simulateCacheManagerAPI({ action: 'get-stats' });
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result.data;
      }

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
      if (USE_MOCK_API) {
        // Use mock API service for cache cleanup
        const result = await this.mockApiService.simulateCacheManagerAPI({ action: 'cleanup-expired' });
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result.data;
      }

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