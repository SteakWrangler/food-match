
import { useState, useEffect, useRef } from 'react';
import { getHybridRestaurantsAPI } from '@/integrations/supabase/hybridRestaurants';
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
  swipes: Record<string, Record<string, 'left' | 'right'>>; // participantId -> restaurantId -> swipe
  restaurants: any[];
  location: string;
  lastUpdated: number; // Add timestamp for sync
  filters?: FilterState; // Add filters to room state
  nextPageToken?: string; // Add nextPageToken for pagination
}

// In-memory storage for active rooms
const activeRooms = new Map<string, RoomState>();

const useRoom = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling mechanism to sync room state
  useEffect(() => {
    if (roomState) {
      // Temporarily disable polling for debugging
      // pollingIntervalRef.current = setInterval(() => {
      //   syncRoomState();
      // }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [roomState?.id]);

  const syncRoomState = () => {
    if (!roomState) return;

    // Check if there's a newer version in localStorage
    const storedRoom = localStorage.getItem(`room_${roomState.id}`);
    if (storedRoom) {
      const parsedRoom: RoomState = JSON.parse(storedRoom);
      
      // If the stored version is newer, update our state
      if (parsedRoom.lastUpdated > roomState.lastUpdated) {
        console.log('Syncing room state from localStorage');
        setRoomState(parsedRoom);
        activeRooms.set(roomState.id, parsedRoom);
      }
    }
  };

  const createRoom = async (hostName: string, location: string, filters?: FilterState) => {
    try {
      const roomId = Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Create room first without restaurants
      const newRoom: RoomState = {
        id: roomId,
        hostId: participantId,
        participants: [{
          id: participantId,
          name: hostName,
          isOnline: true
        }],
        currentRestaurantIndex: 0,
        swipes: {},
        restaurants: [], // Start with empty restaurants
        location,
        filters, // Store filters in room state
        lastUpdated: Date.now()
      };

      setRoomState(newRoom);
      setIsHost(true);
      
      // Store in memory and localStorage
      activeRooms.set(roomId, newRoom);
      localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
      
      console.log(`Created room ${roomId} from ${location}`);
      
      // Now load initial restaurants with hybrid system and filters
      const success = await loadInitialRestaurants(roomId, location, filters);
      
      return roomId;
    } catch (error) {
      console.error('Error creating room:', error);
      // Reset state on error
      setRoomState(null);
      setIsHost(false);
      throw error;
    }
  };

  const loadInitialRestaurants = async (roomId: string, location: string, filters?: FilterState) => {
    try {
      console.log('Loading initial restaurants with Google Places + ChatGPT system...');
      console.log('Applied filters:', filters);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: filters?.distance?.[0] ? filters.distance[0] * 1609 : 5000, // Convert miles to meters
        openNow: filters?.openNow ?? true,
        limit: 20
      };

      // Add price range filter - use "or-less" logic
      if (filters?.priceRange && filters.priceRange.length > 0) {
        apiParams.minPrice = 0; // Start from lowest price (Google uses 0-4)
        apiParams.maxPrice = filters.priceRange[0] - 1; // Up to selected price level
      }

      // Add cuisine keyword if specified
      if (filters?.selectedCuisines && filters.selectedCuisines.length > 0) {
        apiParams.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`Fetched ${result.restaurants.length} initial restaurants from Google Places + ChatGPT API`);
      
      // Get the current room from memory or localStorage
      let currentRoom = activeRooms.get(roomId);
      if (!currentRoom) {
        const storedRoom = localStorage.getItem(`room_${roomId}`);
        if (storedRoom) {
          currentRoom = JSON.parse(storedRoom);
        }
      }
      
      if (!currentRoom) {
        console.error('Room not found when trying to load initial restaurants');
        return false;
      }
      
      // Update the room with restaurants and filters
      const updatedRoom: RoomState = {
        ...currentRoom,
        restaurants: result.restaurants,
        filters, // Store the filters that were used
        nextPageToken: result.nextPageToken, // Store the nextPageToken for pagination
        lastUpdated: Date.now()
      };
      
      setRoomState(updatedRoom);
      activeRooms.set(roomId, updatedRoom);
      localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
      
      console.log(`Updated room ${roomId} with ${result.restaurants.length} restaurants`);
      return true;
    } catch (error) {
      console.error('Failed to load initial restaurants:', error);
      // Don't reset the room state on restaurant loading failure
      // The room was created successfully, just without restaurants
      return false;
    }
  };

  const joinRoom = async (roomId: string, participantName: string) => {
    console.log(`Attempting to join room: ${roomId}`);
    
    // Normalize room ID to uppercase
    const normalizedRoomId = roomId.toUpperCase();
    
    // Check memory first
    let room = activeRooms.get(normalizedRoomId);
    
    if (!room) {
      // Check localStorage
      const storedRoom = localStorage.getItem(`room_${normalizedRoomId}`);
      if (storedRoom) {
        room = JSON.parse(storedRoom);
        activeRooms.set(normalizedRoomId, room);
        console.log(`Found room in localStorage: ${normalizedRoomId}`);
      } else {
        console.log(`Room not found in localStorage: ${normalizedRoomId}`);
        // Debug: list all available rooms
        const allKeys = Object.keys(localStorage);
        const roomKeys = allKeys.filter(key => key.startsWith('room_'));
        console.log('Available rooms in localStorage:', roomKeys);
      }
    } else {
      console.log(`Found room in memory: ${normalizedRoomId}`);
    }

    if (!room) {
      console.error('Room not found');
      return false;
    }

    // Add participant to room
    const updatedRoom: RoomState = {
      ...room,
      participants: [
        ...room.participants,
        {
          id: participantId,
          name: participantName,
          isOnline: true
        }
      ],
      lastUpdated: Date.now()
    };

    setRoomState(updatedRoom);
    setIsHost(false);
    
    // Update storage
    activeRooms.set(normalizedRoomId, updatedRoom);
    localStorage.setItem(`room_${normalizedRoomId}`, JSON.stringify(updatedRoom));
    
    console.log(`Successfully joined room ${normalizedRoomId} with ${updatedRoom.restaurants?.length || 0} restaurants`);
    return true;
  };

  const addSwipe = async (restaurantId: string, direction: 'left' | 'right') => {
    if (!roomState) return;

    const updatedRoom: RoomState = {
      ...roomState,
      swipes: {
        ...roomState.swipes,
        [participantId]: {
          ...roomState.swipes[participantId],
          [restaurantId]: direction
        }
      },
      lastUpdated: Date.now()
    };

    setRoomState(updatedRoom);
    activeRooms.set(roomState.id, updatedRoom);
    localStorage.setItem(`room_${roomState.id}`, JSON.stringify(updatedRoom));
    
    console.log(`Added swipe: ${direction} on ${restaurantId}`);
  };

  const checkForMatch = (itemId: string, type: 'restaurant' | 'foodType' = 'restaurant'): boolean => {
    if (!roomState) return false;

    const allParticipants = roomState.participants;
    const allSwipes = roomState.swipes;

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

  const getParticipantSwipe = (participantId: string, restaurantId: string) => {
    if (!roomState) return null;
    return roomState.swipes[participantId]?.[restaurantId] || null;
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
      console.log('🚀 Starting to load more restaurants with Google Places + ChatGPT system...');
      console.log('🔍 Applied filters:', filters);
      
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Use filters from room state if not provided
      const appliedFilters = filters || roomState.filters;
      console.log('🔍 Applied filters after fallback:', appliedFilters);
      
      // Convert filters to API parameters
      const apiParams: any = {
        location: roomState.location,
        radius: appliedFilters?.distance?.[0] ? appliedFilters.distance[0] * 1609 : 5000, // Convert miles to meters
        openNow: appliedFilters?.openNow ?? true,
        limit: 20 // Request 20 more restaurants
      };

      // Add price range filter - use "or-less" logic
      if (appliedFilters?.priceRange && appliedFilters.priceRange.length > 0) {
        apiParams.minPrice = 0; // Start from lowest price (Google uses 0-4)
        apiParams.maxPrice = appliedFilters.priceRange[0] - 1; // Up to selected price level
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
      
      console.log(`📊 Received ${result.restaurants.length} restaurants from API`);
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
        activeRooms.set(roomState.id, updatedRoom);
        localStorage.setItem(`room_${roomState.id}`, JSON.stringify(updatedRoom));
        
        console.log(`✅ Successfully added ${result.restaurants.length} new restaurants (total: ${updatedRoom.restaurants.length})`);
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
      activeRooms.set(roomState.id, updatedRoom);
      localStorage.setItem(`room_${roomState.id}`, JSON.stringify(updatedRoom));
      
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

  const leaveRoom = () => {
    if (roomState) {
      // Remove from memory
      activeRooms.delete(roomState.id);
      // Remove from localStorage
      localStorage.removeItem(`room_${roomState.id}`);
    }
    setRoomState(null);
    setIsHost(false);
  };

  return {
    roomState,
    isHost,
    participantId,
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
