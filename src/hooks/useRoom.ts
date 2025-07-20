
import { useState, useEffect, useRef } from 'react';
import { getSupabaseWorldwideRestaurantsAPI } from '@/integrations/supabase/worldwideRestaurants';

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
      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        syncRoomState();
      }, 2000);

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

  const createRoom = async (hostName: string, location: string) => {
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
        lastUpdated: Date.now()
      };

      setRoomState(newRoom);
      setIsHost(true);
      
      // Store in memory and localStorage
      activeRooms.set(roomId, newRoom);
      localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
      
      console.log(`Created room ${roomId} from ${location}`);
      
      // Now load initial restaurants
      const success = await loadInitialRestaurants(roomId, location);
      
      return roomId;
    } catch (error) {
      console.error('Error creating room:', error);
      // Reset state on error
      setRoomState(null);
      setIsHost(false);
      throw error;
    }
  };

  const loadInitialRestaurants = async (roomId: string, location: string) => {
    try {
      console.log('Loading initial restaurants...');
      const worldwideRestaurantsAPI = getSupabaseWorldwideRestaurantsAPI();
      
      const restaurants = await worldwideRestaurantsAPI.searchRestaurants({
        location,
        radius: 5000,
        openNow: true,
        limit: 20
      });
      
      console.log(`Fetched ${restaurants.length} initial restaurants from Worldwide Restaurants API`);
      
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
      
      // Update the room with restaurants
      const updatedRoom: RoomState = {
        ...currentRoom,
        restaurants,
        lastUpdated: Date.now()
      };
      
      setRoomState(updatedRoom);
      activeRooms.set(roomId, updatedRoom);
      localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
      
      console.log(`Updated room ${roomId} with ${restaurants.length} restaurants`);
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

  const loadMoreRestaurants = async () => {
    if (!roomState || !roomState.location) {
      console.log('loadMoreRestaurants: No room state or location');
      return false;
    }
    
    try {
      console.log('Loading more restaurants in background...');
      
      const worldwideRestaurantsAPI = getSupabaseWorldwideRestaurantsAPI();
      
      // Request 50 restaurants (more than the initial 20)
      const moreRestaurants = await worldwideRestaurantsAPI.searchRestaurants({
        location: roomState.location,
        radius: 5000,
        openNow: true,
        limit: 50 // Request more than initial load
      });
      
      console.log(`Received ${moreRestaurants.length} restaurants from API`);
      
      // Filter out duplicates by restaurant ID to ensure we don't add the same restaurants
      const existingIds = new Set(roomState.restaurants.map(r => r.id));
      const newRestaurants = moreRestaurants.filter(r => !existingIds.has(r.id));
      
      console.log(`After filtering duplicates: ${newRestaurants.length} new restaurants`);
      
      if (newRestaurants.length > 0) {
        const updatedRoom: RoomState = {
          ...roomState,
          restaurants: [...roomState.restaurants, ...newRestaurants],
          lastUpdated: Date.now()
        };
        
        setRoomState(updatedRoom);
        activeRooms.set(roomState.id, updatedRoom);
        localStorage.setItem(`room_${roomState.id}`, JSON.stringify(updatedRoom));
        
        console.log(`Added ${newRestaurants.length} more restaurants in background`);
        return true;
      } else {
        console.log('No more unique restaurants available in the area');
        return false;
      }
    } catch (error) {
      console.error('Failed to load more restaurants:', error);
      return false;
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
    leaveRoom
  };
};

export default useRoom;
