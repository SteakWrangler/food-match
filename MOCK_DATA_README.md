# Temporary Mock Data Mode

## Overview
This project has been temporarily configured to use hard-coded restaurant data instead of making API calls to save on API usage during development.

## What's Changed

### 1. Mock Data File
- **File**: `src/data/mockRestaurants.ts`
- **Purpose**: Contains 8 hard-coded restaurant objects with realistic data
- **Features**: Includes all required fields like images, ratings, descriptions, tags, etc.

### 2. API Integration Modified
- **File**: `src/integrations/supabase/hybridRestaurants.ts`
- **Change**: Added `USE_MOCK_DATA = true` flag
- **Behavior**: When true, returns mock data instead of making API calls

### 3. Console Logging
- **Files**: `src/hooks/useRoom.ts`
- **Change**: Added console logs to indicate mock data is being used
- **Purpose**: Makes it clear when mock data is active

## How to Restore API Calls

### Option 1: Quick Toggle
1. Open `src/integrations/supabase/hybridRestaurants.ts`
2. Change `const USE_MOCK_DATA = true;` to `const USE_MOCK_DATA = false;`
3. Save the file

### Option 2: Complete Cleanup
1. Set `USE_MOCK_DATA = false` in `hybridRestaurants.ts`
2. Remove the import: `import { getMockRestaurants } from '@/data/mockRestaurants';`
3. Remove the mock data check in the `searchRestaurants` method
4. Delete `src/data/mockRestaurants.ts`
5. Remove console logs about mock data in `useRoom.ts`

## Mock Data Details

The mock data includes 8 restaurants with diverse cuisines:
- The Grand Bistro (French)
- Sakura Sushi Bar (Japanese)
- Taco Fiesta (Mexican)
- Pizza Palace (Italian)
- Burger Joint (American)
- Thai Spice (Thai)
- Green Garden (Vegetarian)
- Ice Cream Delight (Dessert)

Each restaurant has:
- Realistic images from Unsplash
- Complete restaurant information
- Tags and confidence scores
- Opening hours and contact info
- All required fields for the app

## Benefits During Development

1. **No API Usage**: Saves on Google Places API and ChatGPT API costs
2. **Fast Loading**: No network delays during testing
3. **Consistent Data**: Same restaurants every time for reliable testing
4. **No Rate Limits**: Can test as much as needed
5. **Offline Development**: Works without internet connection

## When to Switch Back

Switch back to API calls when:
- Ready to test with real restaurant data
- Need to test location-based filtering
- Want to verify API integration
- Preparing for production deployment

## Notes

- The mock data is designed to work with all existing UI components
- Filtering and search functionality will work with the mock data
- Room creation and joining will work normally
- All swipe and match functionality remains unchanged 