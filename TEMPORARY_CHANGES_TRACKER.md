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

## UI Fixes Applied

### Background Cards Opacity ✅ DONE
**Files Modified:**
- `src/components/SwipeInterface.tsx`
- `src/components/GeneralSwipeInterface.tsx`

**What Changed:**
- Set background cards opacity to 0 instead of 0.6 - index * 0.2
- Background cards are now completely hidden until they become the top card
- Prevents accidental overlap and visual confusion

**Result:**
- Cleaner card display with no overlapping background cards
- Better focus on the current card being swiped
- Improved user experience for both restaurant and food type tabs

### Swipe Animation Improvement ✅ DONE
**Files Modified:**
- `src/components/SwipeInterface.tsx`
- `src/components/GeneralSwipeInterface.tsx`

**What Changed:**
- Modified `handleSwipe` function to animate cards off-screen instead of snapping back
- Cards now fully swipe off the screen in the direction they were swiped
- Added proper timing to wait for animation completion before showing next card
- Updated transition to use `'all 0.3s ease-out'` for smoother animations

**Result:**
- Natural swipe animation where cards fully exit the screen
- No more "snap back" effect that looked jarring
- Smooth transition between cards
- Better visual feedback for swipe gestures

### Instant Card Appearance ✅ DONE
**Files Modified:**
- `src/components/SwipeInterface.tsx`
- `src/components/GeneralSwipeInterface.tsx`

**What Changed:**
- Modified transition logic to disable animation when position is reset
- Cards now swipe off screen naturally
- When position resets to center, no transition animation occurs
- Next card appears instantly without rollback animation

**Result:**
- Cards swipe off screen naturally in swipe direction
- Next card appears instantly in center (no rolling animation)
- No visual rollback or transition when position resets
- Clean, instant card transitions

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