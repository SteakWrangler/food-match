// TEMPORARY MOCK ROOM DATA
// TODO: Remove this file when restoring API calls

import { RoomData } from '@/integrations/supabase/roomService';
import { MOCK_RESTAURANTS } from './mockRestaurants';
import { FilterState } from '@/utils/restaurantFilters';

// Default filters
const defaultFilters: FilterState = {
  distance: [5],
  priceRange: [],
  selectedCuisines: [],
  openNow: false
};

// In-memory storage for mock rooms
const mockRooms = new Map<string, RoomData>();

// Helper function to create a mock room
export const createMockRoom = (roomId: string, hostId: string, hostName: string, location: string, filters?: FilterState): RoomData => {
  const roomData: RoomData = {
    id: roomId,
    host_id: hostId,
    participants: [
      {
        id: hostId,
        name: hostName,
        isOnline: true
      }
    ],
    current_restaurant_index: 0,
    restaurant_swipes: {},
    food_type_swipes: {},
    restaurants: MOCK_RESTAURANTS,
    location: location,
    filters: filters || defaultFilters,
    next_page_token: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Store in memory
  mockRooms.set(roomId, roomData);
  
  console.log('🔧 TEMPORARY: Created mock room:', roomId);
  console.log('🔧 Mock room data:', roomData);
  
  return roomData;
};

// Helper function to get a mock room
export const getMockRoom = (roomId: string): RoomData | null => {
  const room = mockRooms.get(roomId);
  if (room) {
    console.log('🔧 TEMPORARY: Retrieved mock room:', roomId);
  }
  return room || null;
};

// Helper function to update a mock room
export const updateMockRoom = (roomId: string, updates: Partial<RoomData>): RoomData | null => {
  const room = mockRooms.get(roomId);
  if (!room) return null;

  const updatedRoom: RoomData = {
    ...room,
    ...updates,
    updated_at: new Date().toISOString()
  };

  mockRooms.set(roomId, updatedRoom);
  console.log('🔧 TEMPORARY: Updated mock room:', roomId);
  
  return updatedRoom;
};

// Helper function to join a mock room
export const joinMockRoom = (roomId: string, participantId: string, participantName: string): RoomData | null => {
  const room = mockRooms.get(roomId);
  if (!room) return null;

  // Check if participant already exists
  const existingParticipant = room.participants.find(p => p.id === participantId);
  if (!existingParticipant) {
    room.participants.push({
      id: participantId,
      name: participantName,
      isOnline: true
    });
  }

  const updatedRoom = updateMockRoom(roomId, {
    participants: room.participants,
    updated_at: new Date().toISOString()
  });

  console.log('🔧 TEMPORARY: Joined mock room:', roomId, 'with participant:', participantName);
  
  return updatedRoom;
};

// Helper function to add a swipe to a mock room
export const addMockSwipe = (roomId: string, participantId: string, itemId: string, direction: 'left' | 'right', type: 'restaurant' | 'foodType'): RoomData | null => {
  const room = mockRooms.get(roomId);
  if (!room) return null;

  const swipes = type === 'restaurant' ? room.restaurant_swipes : room.food_type_swipes;
  
  if (!swipes[participantId]) {
    swipes[participantId] = {};
  }
  
  swipes[participantId][itemId] = direction;

  const updatedRoom = updateMockRoom(roomId, {
    [type === 'restaurant' ? 'restaurant_swipes' : 'food_type_swipes']: swipes,
    updated_at: new Date().toISOString()
  });

  console.log('🔧 TEMPORARY: Added swipe to mock room:', roomId, 'participant:', participantId, 'item:', itemId, 'direction:', direction);
  
  return updatedRoom;
};

// Helper function to update restaurants in a mock room
export const updateMockRestaurants = (roomId: string, restaurants: any[], nextPageToken?: string): RoomData | null => {
  const room = mockRooms.get(roomId);
  if (!room) return null;

  const updatedRoom = updateMockRoom(roomId, {
    restaurants: restaurants,
    next_page_token: nextPageToken,
    updated_at: new Date().toISOString()
  });

  console.log('🔧 TEMPORARY: Updated restaurants in mock room:', roomId, 'count:', restaurants.length);
  
  return updatedRoom;
}; 