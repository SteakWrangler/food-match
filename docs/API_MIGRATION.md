# API Migration: Google Places to Worldwide Restaurants API

## Overview
We've migrated from Google Places API to the Worldwide Restaurants API from Zyla Labs to improve reliability and data quality.

## Changes Made

### 1. New Supabase Function
- Created `supabase/functions/worldwide-restaurants/index.ts`
- Replaces `supabase/functions/google-places/index.ts`
- Uses Zyla Labs API instead of Google Places API

### 2. Updated Integration
- Modified `src/integrations/supabase/googlePlaces.ts` to use Worldwide Restaurants API
- Updated `src/hooks/useRoom.ts` to use the new API

### 3. Environment Variables
You'll need to set this environment variable:

```bash
# Zyla Labs API Key for Worldwide Restaurants API
ZYLALABS_API_KEY=your_zyla_labs_api_key_here
```

**Note**: For now, the API requires coordinates format (e.g., "28.5383, -81.3792") instead of address strings. We can add geocoding later if needed.

## Key Differences

### Data Structure
- **Before**: Generated descriptions, tags, and cuisine types
- **After**: Only uses data that comes directly from the API
- **Result**: More accurate, less hardcoded content

### API Response
The new API returns data in this format:
```json
{
  "id": "restaurant_id",
  "name": "Restaurant Name",
  "cuisine": "Cuisine Type", // or null if not provided
  "image": "image_url", // or null if not provided
  "rating": 4.5, // or null if not provided
  "priceRange": "$", // or null if not provided
  "distance": "0.5 mi",
  "estimatedTime": "15-20 min",
  "description": "Restaurant description", // or null if not provided
  "tags": ["tag1", "tag2"], // or empty array if not provided
  "address": "Restaurant address", // or null if not provided
  "phone": "Phone number", // or null if not provided
  "website": "Website URL", // or null if not provided
  "openingHours": ["Monday: 9:00 AM - 10:00 PM", ...], // or empty array if not provided
  "debug": {
    "originalData": { /* raw API response */ }
  }
}
```

## Testing
Run the test script to verify the integration:
```bash
node test-worldwide-restaurants.js
```

## Deployment
1. Set up your Zyla Labs API key
2. Deploy the new Supabase function:
   ```bash
   cd supabase
   npx supabase functions deploy worldwide-restaurants
   ```
3. Test the integration with the provided test script

## Benefits
- More reliable API service
- Better data accuracy (no generated content)
- Cleaner codebase (removed hardcoded descriptions)
- More flexible data structure 