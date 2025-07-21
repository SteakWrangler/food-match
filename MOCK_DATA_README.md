# Mock API System

## Overview
This project now uses a sophisticated mock API system that simulates the full API flow while returning hard-coded data. This allows for complete testing of the application's functionality without making actual API calls, while still maintaining all the normal application flow including Supabase data storage and room management.

## What's Changed

### 1. Mock API Service
- **File**: `src/integrations/supabase/mockApiService.ts` (NEW)
- **Purpose**: Simulates the complete API flow including Google Places and ChatGPT processing
- **Features**: Realistic delays, error simulation, cache behavior, and data transformation

### 2. API Integration Modified
- **File**: `src/integrations/supabase/hybridRestaurants.ts`
- **Change**: Updated to use `USE_MOCK_API = true` flag and mock API service
- **Behavior**: When true, simulates full API flow instead of making real API calls

### 3. Enhanced Console Logging
- **Files**: `src/hooks/useRoom.ts`
- **Change**: Updated console logs to reflect mock API simulation
- **Purpose**: Makes it clear when mock API is active and tracks the simulation flow

## How to Restore Real API Calls

### Option 1: Quick Toggle
1. Open `src/integrations/supabase/hybridRestaurants.ts`
2. Change `const USE_MOCK_API = true;` to `const USE_MOCK_API = false;`
3. Save the file

### Option 2: Complete Cleanup
1. Set `USE_MOCK_API = false` in `hybridRestaurants.ts`
2. Remove the import: `import { getMockApiService } from './mockApiService';`
3. Remove the mock API check in the `searchRestaurants` method
4. Delete `src/integrations/supabase/mockApiService.ts`
5. Remove console logs about mock API in `useRoom.ts`

## Mock API Details

The mock API system provides:

### Sample Restaurants
- The Grand Bistro (French) - Fine dining with AI enhancement
- Sakura Sushi Bar (Japanese) - Authentic sushi with fresh fish
- Taco Fiesta (Mexican) - Casual Mexican with authentic flavors
- Pizza Palace (Italian) - Family-owned pizzeria
- Burger Joint (American) - Gourmet burgers with craft beer
- Thai Spice (Thai) - Authentic Thai cuisine with spicy curries
- Green Garden (Vegetarian) - Plant-based organic restaurant
- Ice Cream Delight (Dessert) - Artisanal ice cream shop
- Pho House (Vietnamese) - Authentic Vietnamese pho
- Mediterranean Grill (Mediterranean) - Fresh Mediterranean cuisine

### API Flow Simulation
1. **Google Places API**: Simulates restaurant search with proper data format
2. **ChatGPT Processing**: Simulates AI enhancement with confidence scores
3. **Data Transformation**: Converts data to expected format
4. **Cache Management**: Simulates cache hits/misses and statistics

### Realistic Features
- **10 Diverse Restaurants**: Multiple cuisines and price points
- **Complete Data**: All required fields for the application
- **Proper Format**: Exact same structure as real API responses
- **Data Enhancement**: AI-processed descriptions and tags

## Benefits During Development

1. **Complete API Flow Testing**: Tests the full application flow including API calls, data processing, and error handling
2. **Cost Savings**: No Google Places API or ChatGPT API usage
3. **Realistic Simulation**: Simulates real API delays, errors, and cache behavior
4. **Fast Development**: No rate limits or external API dependencies
5. **Consistent Testing**: Predictable test scenarios with controlled data
6. **Error Handling**: Tests fallback behavior when APIs fail
7. **Data Transformation**: Tests the complete data flow from Google Places to ChatGPT to final output

## When to Switch Back

Switch back to real API calls when:
- Ready to test with real restaurant data from specific locations
- Need to test location-based filtering with actual geographic data
- Want to verify real API integration and error handling
- Preparing for production deployment
- Need to test with actual Google Places and ChatGPT APIs

## Notes

- The mock API system simulates the complete application flow
- All UI components work exactly as they would with real APIs
- Room creation, joining, and data storage still use Supabase
- Swipe and match functionality remains unchanged
- Error handling and fallback behavior is tested
- Cache management and statistics are simulated 