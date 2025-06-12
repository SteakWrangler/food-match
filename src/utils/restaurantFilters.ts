
import { Restaurant } from '@/data/restaurants';

export interface FilterState {
  distance: number[];
  priceRange: number[];
  selectedCuisines: string[];
  openNow: boolean;
}

export const defaultFilters: FilterState = {
  distance: [5],
  priceRange: [2],
  selectedCuisines: [],
  openNow: true,
};

export const filterRestaurants = (restaurants: Restaurant[], filters: FilterState): Restaurant[] => {
  return restaurants.filter(restaurant => {
    // Distance filter (convert distance string to number for comparison)
    const restaurantDistance = parseFloat(restaurant.distance.replace(' mi', ''));
    if (restaurantDistance > filters.distance[0]) {
      return false;
    }

    // Price range filter
    const priceLevel = restaurant.priceRange.length; // $ = 1, $$ = 2, $$$ = 3, $$$$ = 4
    if (priceLevel > filters.priceRange[0]) {
      return false;
    }

    // Cuisine filter
    if (filters.selectedCuisines.length > 0 && !filters.selectedCuisines.includes(restaurant.cuisine)) {
      return false;
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
