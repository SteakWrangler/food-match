
import { useState, useEffect, useRef } from 'react';
import { getHybridRestaurantsAPI } from '@/integrations/supabase/hybridRestaurants';
import { getRoomService, RoomData } from '@/integrations/supabase/roomService';
import { FilterState } from '@/utils/restaurantFilters';

export interface RoomState {
  id: string;
  hostId: string;
  participants: Array<{
    id: string;
    name: string;
    isOnline: boolean;
  }>;
  currentRestaurantIndex: number;
  restaurantSwipes: Record<string, Record<string, 'left' | 'right'>>;
  foodTypeSwipes: Record<string, Record<string, 'left' | 'right'>>;
  restaurants: any[];
  location: string;
  lastUpdated: number;
  filters?: FilterState;
  nextPageToken?: string;
}

const useRoom = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roomService = getRoomService();

  // Convert RoomData to RoomState
  const convertRoomDataToState = (roomData: RoomData): RoomState => ({
    id: roomData.id,
    hostId: roomData.host_id,
    participants: roomData.participants,
    currentRestaurantIndex: roomData.current_restaurant_index,
    restaurantSwipes: roomData.restaurant_swipes,
    foodTypeSwipes: roomData.food_type_swipes,
    restaurants: roomData.restaurants,
    location: roomData.location,
    filters: roomData.filters,
    nextPageToken: roomData.next_page_token,
    lastUpdated: new Date(roomData.updated_at).getTime()
  });

  // TEMPORARY: Disabled polling mechanism to use local state instead of API calls
  // TODO: Restore polling by uncommenting this useEffect when ready to use API calls
  /*
  useEffect(() => {
    if (roomState) {
      // Poll every 2 seconds to get updates from other participants
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const updatedRoomData = await roomService.getRoom(roomState.id);
          if (updatedRoomData) {
            const updatedRoomState = convertRoomDataToState(updatedRoomData);
            setRoomState(updatedRoomState);
          }
        } catch (error) {
          console.error('Error polling room state:', error);
        }
      }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [roomState?.id]);
  */

  const createRoom = async (hostName: string, location: string, filters?: FilterState) => {
    try {
      const roomData = await roomService.createRoom({
        hostId: participantId,
        hostName,
        location,
        filters
      });

      const roomState = convertRoomDataToState(roomData);
      setRoomState(roomState);
      setIsHost(true);
      
      console.log(`Created room ${roomData.id} from ${location}`);
      
      // Now load initial restaurants with hybrid system and filters
      setIsLoadingRestaurants(true);
      const success = await loadInitialRestaurants(roomData.id, location, filters);
      setIsLoadingRestaurants(false);
      
      return roomData.id;
    } catch (error) {
      console.error('Error creating room:', error);
      setRoomState(null);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      throw error;
    }
  };

  const loadInitialRestaurants = async (roomId: string, location: string, filters?: FilterState) => {
    try {
      console.log('Loading initial restaurants...');
      console.log('🔧 MOCK API: Using mock API service that simulates full API flow');
      console.log('🔧 To restore real API calls, set USE_MOCK_API to false in hybridRestaurants.ts');
      console.log('Applied filters:', filters);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: filters?.distance?.[0] ? filters.distance[0] * 1609 : 10000, // Convert miles to meters, increased default to 10km
        openNow: filters?.openNow ?? false, // Changed default to false to get more results
        limit: 40 // Increased from 20 to 40 to get more results
      };

      // Add price range filter - use "or-less" logic
      if (filters?.priceRange && filters.priceRange.length > 0) {
        apiParams.minPrice = 0; // Start from lowest price (Google uses 0-4)
        apiParams.maxPrice = filters.priceRange[0]; // Use the selected price level directly, not -1
      }

      // Add cuisine keyword if specified
      if (filters?.selectedCuisines && filters.selectedCuisines.length > 0) {
        apiParams.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`🔧 MOCK API: Fetched ${result.restaurants.length} initial restaurants from simulated API flow`);
      
      // Update room with restaurants (this still uses Supabase for data storage)
      const updatedRoomData = await roomService.updateRestaurants(roomId, result.restaurants, result.nextPageToken);
      const updatedRoomState = convertRoomDataToState(updatedRoomData);
      setRoomState(updatedRoomState);
      
      console.log(`Updated room ${roomId} with ${result.restaurants.length} restaurants`);
      return true;
    } catch (error) {
      console.error('Failed to load initial restaurants:', error);
      return false;
    }
  };

  const joinRoom = async (roomId: string, participantName: string) => {
    console.log(`Attempting to join room: ${roomId}`);
    
    // Normalize room ID to uppercase
    const normalizedRoomId = roomId.toUpperCase();
    
    try {
      const roomData = await roomService.joinRoom({
        roomId: normalizedRoomId,
        participantId,
        participantName
      });

      const roomState = convertRoomDataToState(roomData);
      setRoomState(roomState);
      setIsHost(false);
      
      console.log(`Successfully joined room ${normalizedRoomId} with ${roomData.restaurants?.length || 0} restaurants`);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      // Re-throw the error so the calling function can handle it
      throw error;
    }
  };

  const addSwipe = async (itemId: string, direction: 'left' | 'right', type: 'restaurant' | 'foodType' = 'restaurant') => {
    if (!roomState) return;

    console.log('addSwipe called:', { itemId, direction, type, participantId });
    console.log('Current room state before update:', roomState);

    try {
      const updatedRoomData = await roomService.updateSwipe({
        roomId: roomState.id,
        participantId,
        itemId,
        direction,
        type
      });

      const updatedRoomState = convertRoomDataToState(updatedRoomData);
      setRoomState(updatedRoomState);
      
      console.log(`Added ${type} swipe: ${direction} on ${itemId}`);
    } catch (error) {
      console.error('Error adding swipe:', error);
      throw error;
    }
  };

  const checkForMatch = (itemId: string, type: 'restaurant' | 'foodType' = 'restaurant'): boolean => {
    if (!roomState) return false;

    const allParticipants = roomState.participants;
    const allSwipes = type === 'restaurant' ? roomState.restaurantSwipes : roomState.foodTypeSwipes;

    // Don't show matches if there's only one person in the room
    if (allParticipants.length <= 1) return false;

    // Check if all participants have swiped right on this item
    const participantsWhoSwipedRight = allParticipants.filter(participant => {
      const participantSwipes = allSwipes[participant.id];
      return participantSwipes && participantSwipes[itemId] === 'right';
    });

    // Match if all participants swiped right (and there are multiple participants)
    return participantsWhoSwipedRight.length === allParticipants.length;
  };

  const getParticipantSwipe = (participantId: string, itemId: string, type: 'restaurant' | 'foodType' = 'restaurant') => {
    if (!roomState) return null;
    const swipes = type === 'restaurant' ? roomState.restaurantSwipes : roomState.foodTypeSwipes;
    return swipes[participantId]?.[itemId] || null;
  };

  const loadMoreRestaurants = async (filters?: FilterState) => {
    console.log('🔍 loadMoreRestaurants called with filters:', filters);
    console.log('🔍 Current room state:', roomState);
    console.log('🔍 Current room location:', roomState?.location);
    
    if (!roomState || !roomState.location) {
      console.log('❌ loadMoreRestaurants: No room state or location');
      return false;
    }
    
    try {
      console.log('🚀 Starting to load more restaurants...');
      console.log('🔧 MOCK API: Using mock API service that simulates full API flow');
      console.log('🔧 To restore real API calls, set USE_MOCK_API to false in hybridRestaurants.ts');
      console.log('🔍 Applied filters:', filters);
      
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Use filters from room state if not provided
      const appliedFilters = filters || roomState.filters;
      console.log('🔍 Applied filters after fallback:', appliedFilters);
      
      // Convert filters to API parameters
      const apiParams: any = {
        location: roomState.location,
        radius: appliedFilters?.distance?.[0] ? appliedFilters.distance[0] * 1609 : 10000, // Convert miles to meters, increased default to 10km
        openNow: appliedFilters?.openNow ?? false, // Changed default to false to get more results
        limit: 40 // Increased from 20 to 40 to get more results
      };

      // Add price range filter - use "or-less" logic
      if (appliedFilters?.priceRange && appliedFilters.priceRange.length > 0) {
        apiParams.minPrice = 0; // Start from lowest price (Google uses 0-4)
        apiParams.maxPrice = appliedFilters.priceRange[0]; // Use the selected price level directly, not -1
      }

      // Add cuisine keyword if specified
      if (appliedFilters?.selectedCuisines && appliedFilters.selectedCuisines.length > 0) {
        apiParams.keyword = appliedFilters.selectedCuisines.join(' ');
      }

      // Add pageToken if we have one for pagination
      if (roomState.nextPageToken) {
        apiParams.pageToken = roomState.nextPageToken;
        console.log('🔍 Using pageToken for pagination:', roomState.nextPageToken);
      } else {
        console.log('🔍 No pageToken available, this will be a fresh search');
      }
      
      console.log('🔍 API parameters being sent:', apiParams);
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`🔧 MOCK API: Received ${result.restaurants.length} restaurants from simulated API flow`);
      console.log('🔍 Sample new restaurant:', result.restaurants[0]);
      
      if (result.restaurants.length > 0) {
        console.log('✅ Adding new restaurants to room state');
        const updatedRoom: RoomState = {
          ...roomState,
          restaurants: [...roomState.restaurants, ...result.restaurants], // Append the new restaurants
          filters: appliedFilters,
          nextPageToken: result.nextPageToken, // Store the nextPageToken for future pagination
          lastUpdated: Date.now()
        };
        
        setRoomState(updatedRoom);
        // No need to update roomService here, as it's polled for updates
        return true;
      } else {
        console.log('⚠️ No restaurants returned from API');
        return false;
      }
    } catch (error) {
      console.error('💥 Failed to load more restaurants:', error);
      return false;
    }
  };

  // Add a new function to reload restaurants with new filters
  const reloadRestaurantsWithFilters = async (filters: FilterState) => {
    if (!roomState || !roomState.location) {
      console.log('reloadRestaurantsWithFilters: No room state or location');
      return false;
    }
    
    try {
      console.log('Reloading restaurants with new filters:', filters);
      
      // Clear existing restaurants and load new ones with filters
      const updatedRoom: RoomState = {
        ...roomState,
        restaurants: [], // Clear existing restaurants
        filters, // Update filters
        lastUpdated: Date.now()
      };
      
      setRoomState(updatedRoom);
      // No need to update roomService here, as it's polled for updates
      
      // Load new restaurants with filters
      const success = await loadInitialRestaurants(roomState.id, roomState.location, filters);
      return success;
    } catch (error) {
      console.error('Failed to reload restaurants with filters:', error);
      return false;
    }
  };

  // Add a test function to check for duplicates
  const testDuplicateAPI = async () => {
    if (!roomState?.location) {
      console.log('❌ No room location available for testing');
      return;
    }
    
    try {
      console.log('🧪 Testing for API duplicates...');
      console.log('🔧 MOCK API: Testing with simulated API flow');
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // First call - get 20 restaurants
      const firstCall = await hybridRestaurantsAPI.searchRestaurants({
        location: roomState.location,
        radius: 5000,
        openNow: true,
        limit: 20
      });
      
      console.log('🧪 First call returned:', firstCall.restaurants.length, 'restaurants');
      console.log('🧪 First call sample:', firstCall.restaurants.slice(0, 3).map(r => ({ id: r.id, name: r.name })));
      
      // Second call - get 50 restaurants
      const secondCall = await hybridRestaurantsAPI.searchRestaurants({
        location: roomState.location,
        radius: 5000,
        openNow: true,
        limit: 50
      });
      
      console.log('🧪 Second call returned:', secondCall.restaurants.length, 'restaurants');
      console.log('🧪 Second call sample:', secondCall.restaurants.slice(0, 3).map(r => ({ id: r.id, name: r.name })));
      
      // Check for duplicates
      const firstIds = new Set(firstCall.restaurants.map(r => r.id));
      const duplicates = secondCall.restaurants.filter(r => firstIds.has(r.id));
      
      console.log('🧪 Duplicates found:', duplicates.length, 'out of', secondCall.restaurants.length);
      console.log('🧪 Duplicate restaurants:', duplicates.map(r => ({ id: r.id, name: r.name })));
      
      // Check if first 20 of second call are the same as first call
      const first20OfSecond = secondCall.restaurants.slice(0, 20);
      const first20Duplicates = first20OfSecond.filter(r => firstIds.has(r.id));
      console.log('🧪 First 20 of second call duplicates:', first20Duplicates.length, 'out of 20');
      
      return {
        firstCallCount: firstCall.restaurants.length,
        secondCallCount: secondCall.restaurants.length,
        totalDuplicates: duplicates.length,
        first20Duplicates: first20Duplicates.length
      };
    } catch (error) {
      console.error('🧪 Test failed:', error);
      return null;
    }
  };

  const leaveRoom = async () => {
    if (roomState) {
      try {
        await roomService.leaveRoom(roomState.id, participantId);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    setRoomState(null);
    setIsHost(false);
  };

  return {
    roomState,
    isHost,
    participantId,
    isLoadingRestaurantsFromHook: isLoadingRestaurants,
    createRoom,
    joinRoom,
    addSwipe,
    checkForMatch,
    getParticipantSwipe,
    loadMoreRestaurants,
    reloadRestaurantsWithFilters,
    testDuplicateAPI, // Add test function
    leaveRoom
  };
};

export default useRoom;
