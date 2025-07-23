
import { useState, useEffect, useRef } from 'react';
import { getHybridRestaurantsAPI } from '@/integrations/supabase/hybridRestaurants';
import { getRoomService, RoomData } from '@/integrations/supabase/roomService';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, defaultFilters } from '@/utils/restaurantFilters';

export interface RoomState {
  id: string;
  hostId: string;
  participants: Array<{
    id: string;
    name: string;
    isOnline: boolean;
  }>;
  currentRestaurantId?: string; // Changed from currentRestaurantIndex to currentRestaurantId
  viewedRestaurantIds: string[]; // Track which restaurants user has seen
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
  const [isLoadingMoreRestaurants, setIsLoadingMoreRestaurants] = useState(false); // Add separate state for background loading
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roomService = getRoomService();

  // Convert RoomData to RoomState
  const convertRoomDataToState = (roomData: RoomData): RoomState => ({
    id: roomData.id,
    hostId: roomData.host_id,
    participants: roomData.participants,
    currentRestaurantId: roomData.current_restaurant_id, // Changed from current_restaurant_index to current_restaurant_id
    viewedRestaurantIds: roomData.viewed_restaurant_ids || [], // Changed from current_restaurant_index to viewed_restaurant_ids
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
      // Set loading state immediately
      setIsLoadingRestaurants(true);
      
      const roomData = await roomService.createRoom({
        hostId: participantId,
        hostName,
        location,
        filters
      });

      console.log(`Created room ${roomData.id} from ${location}`);
      
      // Load initial 3 restaurants first, then set room state immediately
      const success = await loadInitialRestaurants(roomData.id, location, filters, true);
      
      if (success) {
        // Set room state immediately after initial 3 restaurants are loaded
        const updatedRoomData = await roomService.getRoom(roomData.id);
        if (updatedRoomData) {
          const roomState = convertRoomDataToState(updatedRoomData);
          setRoomState(roomState);
          setIsHost(true);
          console.log(`Room ready with ${updatedRoomData.restaurants?.length || 0} initial restaurants`);
        }
      } else {
        // If loading failed, still create the room but with empty restaurants
        const roomState = convertRoomDataToState(roomData);
        setRoomState(roomState);
        setIsHost(true);
        console.log('Room created but restaurant loading failed');
      }
      
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

  const loadInitialRestaurants = async (roomId: string, location: string, filters?: FilterState, isInitialLoad: boolean = false) => {
    try {
      console.log('🚀 STAGE 1: Loading initial 10 restaurants for quick room entry...');
      console.log('Applied filters:', filters);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: (filters?.distance?.[0] || defaultFilters.distance[0]) * 1609, // Convert miles to meters, use filter distance or default
        openNow: filters?.openNow ?? false, // Changed default to false to get more results
        limit: 10 // Load 10 restaurants initially for quick room entry
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
      
      console.log(`✅ STAGE 1 COMPLETE: Fetched ${result.restaurants.length} initial restaurants from API`);
      
      // Handle insufficient restaurants by adding end card if needed
      const processedRestaurants = handleInsufficientRestaurants(result.restaurants.length, result.restaurants);
      
      // Update room with restaurants (this still uses Supabase for data storage)
      const updatedRoomData = await roomService.updateRestaurants(roomId, processedRestaurants, result.nextPageToken);
      
      // Set initial current restaurant if this is the first load
      if (isInitialLoad && result.restaurants.length > 0) {
        const initialUpdateData = {
          current_restaurant_id: result.restaurants[0].id,
          viewed_restaurant_ids: [],
          updated_at: new Date().toISOString()
        };
        
        await supabase
          .from('rooms')
          .update(initialUpdateData)
          .eq('id', roomId);
      }
      
      const updatedRoomState = convertRoomDataToState(updatedRoomData);
      setRoomState(updatedRoomState);
      
      console.log(`✅ Room ready with ${result.restaurants.length} initial restaurants - User can enter room now!`);
      
      // If this was the initial load, start progressive loading in background
      if (isInitialLoad && result.nextPageToken) {
        console.log('🔄 Starting STAGE 2: Loading next 10 restaurants in background...');
        // Stage 2: Load next 10 restaurants in background
        setTimeout(() => {
          loadMoreRestaurantsInBackground(roomId, location, filters, result.nextPageToken, 10);
        }, 1000); // Wait 1 second before loading more
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load initial restaurants:', error);
      return false;
    }
  };

  const loadMoreRestaurantsInBackground = async (roomId: string, location: string, filters?: FilterState, pageToken?: string, batchSize: number = 20) => {
    try {
      const stageName = batchSize === 10 ? 'STAGE 2' : 'BACKGROUND';
      console.log(`🔄 ${stageName}: Loading ${batchSize} more restaurants in background...`);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: (filters?.distance?.[0] || defaultFilters.distance[0]) * 1609, // Convert miles to meters, use filter distance or default
        openNow: filters?.openNow ?? false,
        limit: batchSize,
        pageToken
      };

      // Add price range filter
      if (filters?.priceRange && filters.priceRange.length > 0) {
        apiParams.minPrice = 0;
        apiParams.maxPrice = filters.priceRange[0];
      }

      // Add cuisine keyword if specified
      if (filters?.selectedCuisines && filters.selectedCuisines.length > 0) {
        apiParams.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`✅ ${stageName} COMPLETE: Loaded ${result.restaurants.length} more restaurants in background`);
      
      if (result.restaurants.length > 0) {
        // Append new restaurants to current room state (preserve swipes)
        const updatedRestaurants = [...roomState.restaurants, ...result.restaurants];
        
        // Add a small delay to prevent user from seeing individual restaurants being added
        // This makes the batch loading appear more seamless
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedRoom: RoomState = {
          ...roomState,
          restaurants: updatedRestaurants,
          nextPageToken: result.nextPageToken,
          lastUpdated: Date.now()
        };
        setRoomState(updatedRoom);
        
        // Update the database in the background
        roomService.updateRestaurants(roomId, updatedRestaurants, result.nextPageToken).catch(error => {
          console.error('Failed to update room in database:', error);
        });
        
        console.log(`✅ Room updated with ${result.restaurants.length} additional restaurants (total: ${updatedRestaurants.length})`);
      }
      
      // Progressive loading logic: determine next stage based on current batch size
      if (result.nextPageToken) {
        let nextBatchSize = batchSize;
        let nextDelay = 1500; // Default delay
        let nextStageName = 'BACKGROUND';
        
        // Progressive loading stages - simplified to just 10→10
        if (batchSize === 10) {
          // Stage 2 (10 restaurants) → Continue with standard batches (20 restaurants)
          nextBatchSize = 20;
          nextDelay = 1500;
          nextStageName = 'BACKGROUND';
          console.log('🔄 Progressive loading: Moving to standard batch loading (20 restaurants)');
        }
        
        setTimeout(() => {
          loadMoreRestaurantsInBackground(roomId, location, filters, result.nextPageToken, nextBatchSize);
        }, nextDelay);
      } else {
        console.log('✅ Progressive loading complete - no more restaurants available');
      }
      
    } catch (error) {
      console.error('❌ Failed to load more restaurants in background:', error);
    }
  };

  const joinRoom = async (roomId: string, participantName: string) => {
    console.log(`Attempting to join room: ${roomId}`);
    
    // Normalize room ID to uppercase
    const normalizedRoomId = roomId.toUpperCase();
    
    try {
      // Set loading state
      setIsLoadingRestaurants(true);
      
      const roomData = await roomService.joinRoom({
        roomId: normalizedRoomId,
        participantId,
        participantName
      });

      // Check if room has restaurants, if not, wait a bit and check again
      if (!roomData.restaurants || roomData.restaurants.length === 0) {
        console.log('Room has no restaurants, waiting for host to load them...');
        // Wait up to 6 seconds for restaurants to be loaded
        for (let i = 0; i < 6; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const updatedRoomData = await roomService.getRoom(normalizedRoomId);
          if (updatedRoomData && updatedRoomData.restaurants && updatedRoomData.restaurants.length > 0) {
            console.log(`Restaurants loaded after ${i + 1} seconds`);
            const roomState = convertRoomDataToState(updatedRoomData);
            setRoomState(roomState);
            setIsHost(false);
            setIsLoadingRestaurants(false);
            return true;
          }
        }
        console.log('No restaurants loaded after 6 seconds, joining with empty room');
      }

      const roomState = convertRoomDataToState(roomData);
      setRoomState(roomState);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      
      console.log(`Successfully joined room ${normalizedRoomId} with ${roomData.restaurants?.length || 0} restaurants`);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      setIsLoadingRestaurants(false);
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

  // Helper function to get the next unviewed restaurant
  const getNextUnviewedRestaurant = (restaurants: any[], viewedIds: string[], currentId?: string) => {
    const unviewed = restaurants.filter(r => !viewedIds.includes(r.id));
    
    // If we have a current restaurant, find the next one after it
    if (currentId) {
      const currentIndex = unviewed.findIndex(r => r.id === currentId);
      if (currentIndex >= 0 && currentIndex < unviewed.length - 1) {
        return unviewed[currentIndex + 1];
      }
    }
    
    // Otherwise return the first unviewed restaurant
    return unviewed[0] || null;
  };

  // Helper function to update current restaurant and viewed restaurants
  const updateRestaurantProgress = async (restaurantId: string) => {
    if (!roomState) return;

    const viewedIds = [...(roomState.viewedRestaurantIds || []), restaurantId];
    const nextRestaurant = getNextUnviewedRestaurant(roomState.restaurants, viewedIds, restaurantId);

    const updatedRoom: RoomState = {
      ...roomState,
      currentRestaurantId: nextRestaurant?.id,
      viewedRestaurantIds: viewedIds,
      lastUpdated: Date.now()
    };

    setRoomState(updatedRoom);
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

    // Prevent multiple simultaneous background loads
    if (isLoadingMoreRestaurants) {
      console.log('⚠️ Already loading more restaurants, skipping duplicate request');
      return false;
    }
    
    try {
      console.log('🚀 Starting to load more restaurants...');
      console.log('🔍 Applied filters:', filters);
      
      setIsLoadingMoreRestaurants(true);
      
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Use filters from room state if not provided
      const appliedFilters = filters || roomState.filters;
      console.log('🔍 Applied filters after fallback:', appliedFilters);
      
      // Convert filters to API parameters
      const apiParams: any = {
        location: roomState.location,
        radius: (appliedFilters?.distance?.[0] || defaultFilters.distance[0]) * 1609, // Convert miles to meters, use filter distance or default
        openNow: appliedFilters?.openNow ?? false, // Changed default to false to get more results
        limit: 20 // Load 20 restaurants per request for proper pagination
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
      
      console.log(`Received ${result.restaurants.length} restaurants from API`);
      console.log('🔍 Sample new restaurant:', result.restaurants[0]);
      
      if (result.restaurants.length > 0) {
        console.log('✅ Adding new restaurants to room state');
        
        // Handle insufficient restaurants by adding end card if needed
        const processedRestaurants = handleInsufficientRestaurants(result.restaurants.length, result.restaurants);
        
        // Add a small delay to prevent user from seeing individual restaurants being added
        // This makes the batch loading appear more seamless
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedRoom: RoomState = {
          ...roomState,
          restaurants: [...roomState.restaurants, ...processedRestaurants], // Append the new restaurants
          filters: appliedFilters,
          nextPageToken: result.nextPageToken, // Store the nextPageToken for future pagination
          lastUpdated: Date.now(),
          // Preserve existing swipes to prevent losing likes
          restaurantSwipes: roomState.restaurantSwipes,
          foodTypeSwipes: roomState.foodTypeSwipes,
          // Preserve current restaurant ID - don't change it when adding new restaurants
          currentRestaurantId: roomState.currentRestaurantId,
          viewedRestaurantIds: roomState.viewedRestaurantIds
        };
        
        setRoomState(updatedRoom);
        console.log(`✅ Smart loading: Added ${result.restaurants.length} new restaurants (total: ${updatedRoom.restaurants.length})`);
        return true;
      } else {
        console.log('⚠️ No restaurants returned from API');
        return false;
      }
    } catch (error) {
      console.error('💥 Failed to load more restaurants:', error);
      return false;
    } finally {
      setIsLoadingMoreRestaurants(false);
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

  // Helper function to handle insufficient restaurants
  const handleInsufficientRestaurants = (totalFound: number, restaurants: any[]) => {
    if (totalFound < 20) {
      console.log(`⚠️ Insufficient restaurants found: ${totalFound} (less than 20)`);
      console.log('ℹ️ Users will see "No more restaurants" screen when they reach the end');
    }
    
    return restaurants; // Return restaurants as-is, let SwipeInterface handle the end state
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
    isLoadingMoreRestaurants, // Add the new loading state
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
