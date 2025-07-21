# Temporary Changes Tracker

## Overview
This file tracks all temporary changes made to disable API calls and use hard-coded data during development.

## Changes Made

### 1. Restaurant API Calls ✅ DONE
**Files Modified:**
- `src/integrations/supabase/hybridRestaurants.ts`
- `src/data/mockRestaurants.ts` (new file)

**What Changed:**
- Added `USE_MOCK_DATA = true` flag
- Created mock restaurant data
- Added helper function `getMockRestaurants()`

**To Restore:**
- Set `USE_MOCK_DATA = false`
- Remove import of `getMockRestaurants`
- Remove mock data check in `searchRestaurants`
- Delete `src/data/mockRestaurants.ts`

### 2. Geocoding API Calls ✅ DONE
**Files Modified:**
- `src/components/LocationModal.tsx`
- `src/data/mockLocations.ts` (new file)

**What Changed:**
- Added `USE_MOCK_LOCATION = true` flag
- Created mock location data with 8 cities
- Added helper functions for location lookup
- Disabled reverse geocoding API calls

**To Restore:**
- Set `USE_MOCK_LOCATION = false`
- Remove import of `getMockLocationFromCoords`
- Remove mock location check in `handleUseCurrentLocation`
- Delete `src/data/mockLocations.ts`

### 3. Room Creation API Calls ✅ DONE
**Files Modified:**
- `src/integrations/supabase/roomService.ts`
- `src/data/mockRooms.ts` (new file)

**What Changed:**
- Added `USE_MOCK_ROOMS = true` flag
- Created mock room data with in-memory storage
- Added helper functions for room operations
- Disabled all database calls (create, get, join, update)

**To Restore:**
- Set `USE_MOCK_ROOMS = false`
- Remove imports of mock room functions
- Remove mock room checks in all methods
- Delete `src/data/mockRooms.ts`

### 4. Room Polling API Calls ✅ DONE
**Files Modified:**
- `src/hooks/useRoom.ts`

**What Changed:**
- Commented out polling useEffect
- Added clear instructions on how to restore
- Disabled automatic room state syncing

**To Restore:**
- Uncomment the polling useEffect
- Remove the comment block
- Restore automatic room state updates

## Mock Data Needed

### Location Data
```typescript
const MOCK_LOCATIONS = [
  { name: "Downtown", coordinates: "40.7128,-74.0060" },
  { name: "Midtown", coordinates: "40.7589,-73.9851" },
  { name: "Brooklyn", coordinates: "40.6782,-73.9442" }
];
```

### Room Data
```typescript
const MOCK_ROOM_STATE = {
  id: "MOCK123",
  hostId: "mock_host",
  participants: [],
  currentRestaurantIndex: 0,
  restaurantSwipes: {},
  foodTypeSwipes: {},
  restaurants: MOCK_RESTAURANTS,
  location: "Downtown",
  lastUpdated: Date.now(),
  filters: defaultFilters,
  nextPageToken: undefined
};
```

## Implementation Plan

1. **Fix LocationModal.tsx** - Disable geocoding API
2. **Fix roomService.ts** - Use mock room creation
3. **Fix useRoom.ts** - Disable polling and use local state
4. **Test all functionality** - Ensure everything works with mock data

## Files to Create/Modify

### New Files:
- `src/data/mockLocations.ts` - Mock location data
- `src/data/mockRooms.ts` - Mock room data

### Files to Modify:
- `src/components/LocationModal.tsx` - Disable geocoding
- `src/integrations/supabase/roomService.ts` - Use mock rooms
- `src/hooks/useRoom.ts` - Disable polling

## Testing Checklist

- [x] Location selection works without API
- [x] Room creation works without database
- [x] Room joining works without database
- [x] Restaurant loading works with mock data
- [x] Swiping works with local state
- [x] Matching works with local state
- [x] No console errors
- [x] No API calls made

## Restore Instructions

When ready to restore API calls:

1. **Restaurant API:**
   - Set `USE_MOCK_DATA = false` in `hybridRestaurants.ts`
   - Delete `mockRestaurants.ts`

2. **Location API:**
   - Remove mock location logic from `LocationModal.tsx`
   - Restore geocoding API calls

3. **Room API:**
   - Remove mock room logic from `roomService.ts`
   - Restore database calls
   - Fix database schema if needed

4. **Polling:**
   - Re-enable polling in `useRoom.ts`
   - Remove local state management

5. **Cleanup:**
   - Delete all mock data files
   - Remove console logs about mock data
   - Remove temporary flags and comments 