
import { Restaurant } from '@/data/restaurants';

export interface FilterState {
  distance: number[];
  priceRange: number[];
  selectedCuisines: string[];
  openNow: boolean;
}

export const defaultFilters: FilterState = {
  distance: [5],
  priceRange: [2], // Default to $$ (price level 2)
  selectedCuisines: [],
  openNow: true, // Show open restaurants by default
};

export const filterRestaurants = (restaurants: Restaurant[], filters: FilterState): Restaurant[] => {
  return restaurants.filter(restaurant => {
    // Price range filter - only filter if a price range is selected
    if (filters.priceRange.length > 0) {
      const priceLevel = restaurant.priceRange.length; // $ = 1, $$ = 2, $$$ = 3, $$$$ = 4
      // If user selects $$$, show $, $$, and $$$ restaurants (or-less logic)
      if (priceLevel > filters.priceRange[0]) {
        return false;
      }
    }

    // Open now filter (for now, we'll assume all restaurants are open)
    // In a real app, this would check actual opening hours
    if (filters.openNow) {
      // For demo purposes, assume all restaurants are open
      return true;
    }

    return true;
  });
};
