import { useState, useEffect, useRef } from 'react';
import { getHybridRestaurantsAPI } from '@/integrations/supabase/hybridRestaurants';
import { getRoomService, RoomData } from '@/integrations/supabase/roomService';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, defaultFilters } from '@/utils/restaurantFilters';
import { useAuth } from './useAuth';

export interface RoomState {
  id: string;
  hostId: string;
  participants: Array<{
    id: string;
    name: string;
  }>;
  currentRestaurantId?: string; // Changed from currentRestaurantIndex to currentRestaurantId
  viewedRestaurantIds: string[]; // Track which restaurants user has seen
  restaurantSwipes: Record<string, Record<string, 'left' | 'right'>>;
  foodTypeSwipes: Record<string, Record<string, 'left' | 'right'>>;
  restaurants: any[];
  location: string; // Coordinates for API calls
  formattedAddress?: string; // Formatted address for UI display
  lastUpdated: number;
  filters?: FilterState;
  nextPageToken?: string;
}

const useRoom = () => {
  const { user } = useAuth();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantId, setParticipantId] = useState<string>('');
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isLoadingMoreRestaurants, setIsLoadingMoreRestaurants] = useState(false); // Add separate state for background loading
  const [hasReachedEnd, setHasReachedEnd] = useState(false); // Track if we've reached the end of available restaurants
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roomService = getRoomService();

  // Set participant ID based on authenticated user or generate one for guests
  useEffect(() => {
    if (user?.id) {
      setParticipantId(user.id);
    } else if (!participantId) {
      setParticipantId(`guest_${Math.random().toString(36).substr(2, 12)}`);
    }
  }, [user?.id, participantId]);
  
  // Reset loading state when there's no room to prevent stuck loading screen
  useEffect(() => {
    if (!roomState) {
      setIsLoadingRestaurants(false);
    }
  }, [roomState]);
  // Convert RoomData to RoomState
  const convertRoomDataToState = (roomData: RoomData): RoomState => {
    return {
      id: roomData.id,
      hostId: roomData.host_id,
      participants: roomData.participants,
      currentRestaurantId: roomData.current_restaurant_id,
      viewedRestaurantIds: roomData.viewed_restaurant_ids || [],
      restaurantSwipes: roomData.restaurant_swipes || {},
      foodTypeSwipes: roomData.food_type_swipes || {},
      restaurants: roomData.restaurants || [],
      location: roomData.location, // Coordinates for API calls
      lastUpdated: Date.now(),
      filters: roomData.filters,
      nextPageToken: roomData.next_page_token
    };
  };

  // Poll for room updates to detect matches from other participants
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

  // Periodic cleanup of empty rooms
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await roomService.cleanupEmptyRooms();
      } catch (error) {
        console.error('Error cleaning up empty rooms:', error);
      }
    }, 30000); // Run every 30 seconds

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Handle page unload/refresh to ensure user leaves room
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomState) {
        // Use synchronous storage to ensure this runs before page unloads
        sessionStorage.setItem('toss_leaving_room', roomState.id);
        sessionStorage.setItem('toss_participant_id', participantId);
      }
    };

    const handlePageShow = () => {
      // Check if we're returning to a page that was leaving a room
      const leavingRoomId = sessionStorage.getItem('toss_leaving_room');
      const leavingParticipantId = sessionStorage.getItem('toss_participant_id');
      
      if (leavingRoomId && leavingParticipantId) {
        // Clean up the session storage
        sessionStorage.removeItem('toss_leaving_room');
        sessionStorage.removeItem('toss_participant_id');
        
        // Leave the room asynchronously
        roomService.leaveRoom(leavingRoomId, leavingParticipantId).catch(error => {
          console.error('Error leaving room on page return:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [roomState?.id, participantId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (roomState) {
        // Leave room when component unmounts
        roomService.leaveRoom(roomState.id, participantId).catch(error => {
          console.error('Error leaving room on unmount:', error);
        });
      }
    };
  }, [roomState?.id, participantId]);

  const createRoom = async (hostName: string, location: string, filters: FilterState, formattedAddress?: string) => {
    console.log('🏠 DEBUG: createRoom function called with:');
    console.log('🏠 DEBUG: - hostName:', hostName);
    console.log('🏠 DEBUG: - location:', location);
    console.log('🏠 DEBUG: - filters:', filters);
    console.log('🏠 DEBUG: - formattedAddress:', formattedAddress);
    console.log('🏠 DEBUG: - participantId:', participantId);
    
    try {
      // Set loading state immediately
      console.log('🏠 DEBUG: Setting isLoadingRestaurants to true');
      setIsLoadingRestaurants(true);
      
      console.log('🏠 DEBUG: About to call roomService.createRoom');
      const roomData = await roomService.createRoom({
        hostId: participantId,
        hostName,
        location, // Coordinates for API calls
        filters
      });

      console.log('🏠 DEBUG: roomService.createRoom completed successfully');
      console.log('🏠 DEBUG: roomData:', roomData);
      console.log('🏠 DEBUG: roomData.id:', roomData.id);
      console.log(`Created room ${roomData.id} from ${location}`);
      
      // Load initial 3 restaurants first, then set room state immediately
      console.log('🏠 DEBUG: About to call loadInitialRestaurants');
      const success = await loadInitialRestaurants(roomData.id, location, filters, true);
      console.log('🏠 DEBUG: loadInitialRestaurants result:', success);
      
      if (success) {
        console.log('🏠 DEBUG: loadInitialRestaurants succeeded, getting updated room data');
        // Set room state immediately after initial 3 restaurants are loaded
        const updatedRoomData = await roomService.getRoom(roomData.id);
        console.log('🏠 DEBUG: updatedRoomData:', updatedRoomData);
        
        if (updatedRoomData) {
          console.log('🏠 DEBUG: Converting room data to state');
          const roomState = convertRoomDataToState(updatedRoomData);
          console.log('🏠 DEBUG: converted roomState:', roomState);
          
          // Set the formatted address in the room state
          if (formattedAddress) {
            console.log('🏠 DEBUG: Setting formattedAddress in room state:', formattedAddress);
            roomState.formattedAddress = formattedAddress;
          }
          console.log('🏠 DEBUG: Setting room state');
          setRoomState(roomState);
          setIsHost(true);
          console.log(`Room ready with ${updatedRoomData.restaurants?.length || 0} initial restaurants`);
        } else {
          console.error('🏠 DEBUG: Failed to get updated room data');
        }
      } else {
        console.log('🏠 DEBUG: loadInitialRestaurants failed, creating room with empty restaurants');
        // If loading failed, still create the room but with empty restaurants
        const roomState = convertRoomDataToState(roomData);
        // Set the formatted address in the room state
        if (formattedAddress) {
          roomState.formattedAddress = formattedAddress;
        }
        setRoomState(roomState);
        setIsHost(true);
        console.log('Room created but restaurant loading failed');
      }
      
      console.log('🏠 DEBUG: Setting isLoadingRestaurants to false');
      setIsLoadingRestaurants(false);
      console.log('🏠 DEBUG: Returning room ID:', roomData.id);
      return roomData.id;
    } catch (error) {
      console.error('🏠 DEBUG: Error in createRoom:', error);
      console.error('🏠 DEBUG: Error type:', typeof error);
      console.error('🏠 DEBUG: Error message:', error?.message);
      console.error('🏠 DEBUG: Error stack:', error?.stack);
      setRoomState(null);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      throw error;
    }
  };

  const createDemoRoom = async (hostName: string, formattedAddress?: string) => {
    try {
      console.log('Creating demo room for food types only...');
      console.log('Host name:', hostName);
      console.log('Participant ID:', participantId);
      
      // Create room in Supabase but with minimal data
      const roomData = await roomService.createRoom({
        hostId: participantId,
        hostName,
        location: 'demo', // Special location for demo rooms
        filters: defaultFilters // Use default filters for demo
      });

      console.log(`Created demo room ${roomData.id}`);
      console.log('Room data:', roomData);
      
      // Create room state immediately without loading restaurants
      const roomState = convertRoomDataToState(roomData);
      if (formattedAddress) {
        roomState.formattedAddress = formattedAddress;
      }
      
      console.log('Setting room state:', roomState);
      setRoomState(roomState);
      setIsHost(true);
      setIsLoadingRestaurants(false);
      
      console.log('Demo room ready - food types only');
      return roomData.id;
    } catch (error) {
      console.error('Error creating demo room:', error);
      setRoomState(null);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      throw error;
    }
  };

  const loadInitialRestaurants = async (roomId: string, location: string, filters: FilterState, isInitialLoad: boolean = false) => {
    try {
      console.log('🚀 Loading 20 restaurants for room entry...');
      console.log('Applied filters:', filters);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: filters.distance[0] * 1609, // Convert miles to meters, use filter distance
        openNow: filters.openNow, // Use filter value directly
        limit: 20 // Load 20 restaurants initially since API is now fast
      };

      // Add price range filter - use "or-less" logic
      apiParams.minPrice = 0; // Start from lowest price (Google uses 0-4)
      apiParams.maxPrice = filters.priceRange[0]; // Use the selected price level directly

      // Add cuisine keyword if specified
      if (filters?.selectedCuisines && filters.selectedCuisines.length > 0) {
        apiParams.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`✅ COMPLETE: Fetched ${result.restaurants.length} restaurants from API`);
      
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
      
      // No longer need background loading since we load all 20 upfront
      // The smart loading in SwipeInterface will handle loading more when needed
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load initial restaurants:', error);
      return false;
    }
  };

  const loadMoreRestaurantsInBackground = async (roomId: string, location: string, filters: FilterState, pageToken?: string, batchSize: number = 20) => {
    try {
      const stageName = batchSize === 10 ? 'STAGE 2' : 'BACKGROUND';
      console.log(`🔄 ${stageName}: Loading ${batchSize} more restaurants in background...`);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: filters.distance[0] * 1609, // Convert miles to meters, use filter distance
        openNow: filters.openNow, // Use filter value directly
        limit: batchSize,
        pageToken
      };

      // Add price range filter
      apiParams.minPrice = 0;
      apiParams.maxPrice = filters.priceRange[0];

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
    // Only log the count, don't treat it as insufficient
    console.log(`📊 Found ${totalFound} restaurants from API`);
    return restaurants; // Return restaurants as-is
  };

  // Simple restaurant loading system
  const loadNextBatch = async () => {
    if (!roomState?.location) return false;
    if (isLoadingMoreRestaurants) return false;
    
    setIsLoadingMoreRestaurants(true);
    
    try {
      const api = getHybridRestaurantsAPI();
      const filters = roomState.filters;
      
      const params: any = {
        location: roomState.location,
        radius: filters.distance[0] * 1609,
        openNow: filters.openNow,
        limit: 20,
        pageToken: roomState.nextPageToken,
        minPrice: 0,
        maxPrice: filters.priceRange[0]
      };
      
      if (filters.selectedCuisines?.length > 0) {
        params.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await api.searchRestaurants(params);
      
      if (result.restaurants.length > 0) {
        const newRestaurants = [...roomState.restaurants, ...result.restaurants];
        
        const updatedRoom = {
          ...roomState,
          restaurants: newRestaurants,
          nextPageToken: result.nextPageToken,
          lastUpdated: Date.now()
        };
        
        setRoomState(updatedRoom);
        await roomService.updateRestaurants(roomState.id, newRestaurants, result.nextPageToken);
        
        // Check if we've hit the end
        if (!result.nextPageToken) {
          setHasReachedEnd(true);
        } else {
          setHasReachedEnd(false);
        }
        
        return true;
      } else {
        setHasReachedEnd(true);
        return false;
      }
    } catch (error) {
      console.error('Failed to load next batch:', error);
      return false;
    } finally {
      setIsLoadingMoreRestaurants(false);
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
    setHasReachedEnd(false);
  };

  return {
    roomState,
    isHost,
    participantId,
    isLoadingRestaurantsFromHook: isLoadingRestaurants,
    isLoadingMoreRestaurants,
    hasReachedEnd,
    createRoom,
    createDemoRoom,
    joinRoom,
    addSwipe,
    checkForMatch,
    getParticipantSwipe,
    loadMoreRestaurants: loadNextBatch, // Use the new simple function
    reloadRestaurantsWithFilters,
    testDuplicateAPI,
    leaveRoom
  };
};

export default useRoom;