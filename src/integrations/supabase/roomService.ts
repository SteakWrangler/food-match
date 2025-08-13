import { supabase } from './client';
import { FilterState } from '@/utils/restaurantFilters';

// RESTORED: Use real database calls instead of mock data
const USE_MOCK_ROOMS = false;

/**
 * Simplified Room Management
 * 
 * This system treats any disconnection as leaving the room:
 * - Page refresh → leave room
 * - Browser crash → leave room  
 * - Internet drops → leave room
 * - Tab closes → leave room
 * - User clicks "Leave" → leave room
 * 
 * Rejoining always creates a new participant (no session persistence)
 * Empty rooms are deleted immediately
 * Name conflicts are resolved with number suffixes
 */
export interface RoomData {
  id: string;
  host_id: string;
  participants: Array<{
    id: string;
    name: string;
  }>;
  current_restaurant_id?: string; // Changed from current_restaurant_index to current_restaurant_id
  viewed_restaurant_ids: string[]; // Track which restaurants user has seen
  restaurant_swipes: Record<string, Record<string, 'left' | 'right'>>;
  food_type_swipes: Record<string, Record<string, 'left' | 'right'>>;
  restaurants: any[];
  location: string; // Coordinates for API calls
  filters?: FilterState;
  next_page_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomParams {
  hostId: string;
  hostName: string;
  location: string; // Coordinates for API calls
  filters?: FilterState;
}

export interface JoinRoomParams {
  roomId: string;
  participantId: string;
  participantName: string;
}

export interface UpdateSwipeParams {
  roomId: string;
  participantId: string;
  itemId: string;
  direction: 'left' | 'right';
  type: 'restaurant' | 'foodType';
}

export interface UpdateRestaurantProgressParams {
  roomId: string;
  restaurantId: string;
  viewedRestaurantIds: string[];
  currentRestaurantId?: string;
}

export class RoomService {
  // Helper function to resolve name conflicts
  private resolveNameConflict(name: string, existingParticipants: Array<{id: string, name: string}>): string {
    const existingNames = existingParticipants.map(p => p.name);
    if (!existingNames.includes(name)) {
      return name;
    }
    
    // Add a number suffix
    let counter = 1;
    while (existingNames.includes(`${name} (${counter})`)) {
      counter++;
    }
    return `${name} (${counter})`;
  }

  async createRoom(params: CreateRoomParams): Promise<RoomData> {
    console.log('🏢 DEBUG: roomService.createRoom called with params:', params);
    console.log('🏢 DEBUG: params type check:');
    console.log('🏢 DEBUG: - hostId type:', typeof params.hostId);
    console.log('🏢 DEBUG: - hostId value:', params.hostId);
    console.log('🏢 DEBUG: - hostName type:', typeof params.hostName);
    console.log('🏢 DEBUG: - hostName value:', params.hostName);
    console.log('🏢 DEBUG: - location type:', typeof params.location);
    console.log('🏢 DEBUG: - location value:', params.location);
    console.log('🏢 DEBUG: - filters:', params.filters);
    
    const { hostId, hostName, location, filters } = params;
    
    // Ensure hostId is a valid UUID
    console.log('🏢 DEBUG: Checking hostId validity');
    if (!hostId || typeof hostId !== 'string') {
      console.error('🏢 DEBUG: Invalid host ID provided:', hostId);
      throw new Error('Invalid host ID provided');
    }
    
    console.log('🏢 DEBUG: Creating room data object');
    const roomData = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      host_id: hostId, // This should now be a UUID
      participants: [{
        id: hostId, // This should now be a UUID
        name: hostName,
      }],
      restaurants: [],
      location, // Coordinates for API calls
      filters, // Include filters for regular rooms
      // The database will use defaults for:
      // - restaurant_swipes: '{}'
      // - food_type_swipes: '{}'
      // - current_restaurant_id: null
      // - viewed_restaurant_ids: '{}'
      // - next_page_token: null
    };

    console.log('🏢 DEBUG: Room data created:', roomData);
    console.log('🏢 DEBUG: About to insert room data into Supabase');

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        ...roomData,
        participants: roomData.participants as any,
        restaurants: roomData.restaurants as any,
        filters: roomData.filters as any
      })
      .select()
      .single();

    console.log('🏢 DEBUG: Supabase insert completed');
    console.log('🏢 DEBUG: Supabase response data:', data);
    console.log('🏢 DEBUG: Supabase response error:', error);

    if (error) {
      console.error('🏢 DEBUG: Error creating room - full error object:', error);
      console.error('🏢 DEBUG: Error message:', error.message);
      console.error('🏢 DEBUG: Error details:', error.details);
      console.error('🏢 DEBUG: Error hint:', error.hint);
      console.error('🏢 DEBUG: Error code:', error.code);
      throw new Error(`Failed to create room: ${error.message}`);
    }

    console.log('🏢 DEBUG: Room created successfully in database');
    console.log('🏢 DEBUG: Returning room data:', data);
    return data as unknown as RoomData;
  }

  async getRoom(roomId: string): Promise<RoomData | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error getting room:', error);
      return null;
    }

    return data as unknown as RoomData;
  }

  async joinRoom(params: JoinRoomParams): Promise<RoomData> {
    const { roomId, participantId, participantName } = params;
    
    // First get the current room
    const currentRoom = await this.getRoom(roomId);
    if (!currentRoom) {
      throw new Error('Room not found');
    }

    // Resolve name conflicts
    const resolvedName = this.resolveNameConflict(participantName, currentRoom.participants);

    // Always add as new participant (no checking for existing participants)
    const updatedParticipants = [
      ...currentRoom.participants,
      {
        id: participantId,
        name: resolvedName
      }
    ];

    const { data, error } = await supabase
      .from('rooms')
      .update({ 
        participants: updatedParticipants as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      throw new Error(`Failed to update room: ${error.message}`);
    }

    return data as unknown as RoomData;
  }

  async updateSwipe(params: UpdateSwipeParams): Promise<RoomData> {
    const { roomId, participantId, itemId, direction, type } = params;
    
    // First get the current room
    const currentRoom = await this.getRoom(roomId);
    if (!currentRoom) {
      throw new Error('Room not found');
    }

    // Update the appropriate swipes object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (type === 'restaurant') {
      const updatedRestaurantSwipes = {
        ...currentRoom.restaurant_swipes,
        [participantId]: {
          ...currentRoom.restaurant_swipes[participantId],
          [itemId]: direction
        }
      };
      updateData.restaurant_swipes = updatedRestaurantSwipes as any;
      
      // REMOVED: Global restaurant progress tracking
      // Each user should have their own progress through the restaurant list
      // The current_restaurant_id and viewed_restaurant_ids should be per-participant
      // This was causing all users to see the same restaurant
    } else {
      const updatedFoodTypeSwipes = {
        ...currentRoom.food_type_swipes,
        [participantId]: {
          ...currentRoom.food_type_swipes[participantId],
          [itemId]: direction
        }
      };
      updateData.food_type_swipes = updatedFoodTypeSwipes as any;
    }

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating swipe:', error);
      throw new Error(`Failed to update swipe: ${error.message}`);
    }

    return data as unknown as RoomData;
  }

  async updateRestaurants(roomId: string, restaurants: any[], nextPageToken?: string): Promise<RoomData> {
    const updateData: any = {
      restaurants: restaurants as any,
      updated_at: new Date().toISOString()
    };

    if (nextPageToken) {
      updateData.next_page_token = nextPageToken;
    }

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurants:', error);
      throw new Error(`Failed to update restaurants: ${error.message}`);
    }

    return data as unknown as RoomData;
  }

  async updateFilters(roomId: string, filters: FilterState): Promise<RoomData> {
    const { data, error } = await supabase
      .from('rooms')
      .update({ 
        filters: filters as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating filters:', error);
      throw new Error(`Failed to update filters: ${error.message}`);
    }

    return data as unknown as RoomData;
  }

  async leaveRoom(roomId: string, participantId: string): Promise<void> {
    const currentRoom = await this.getRoom(roomId);
    if (!currentRoom) {
      return; // Room doesn't exist, nothing to do
    }

    // Remove participant from the room
    const updatedParticipants = currentRoom.participants.filter(p => p.id !== participantId);

    if (updatedParticipants.length === 0) {
      // If no participants left, delete the room immediately
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Error deleting room:', error);
        throw new Error(`Failed to delete room: ${error.message}`);
      }
    } else {
      // Update room with remaining participants
      const { error } = await supabase
        .from('rooms')
        .update({ 
          participants: updatedParticipants as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) {
        console.error('Error updating room:', error);
        throw new Error(`Failed to update room: ${error.message}`);
      }
    }
  }

  async cleanupEmptyRooms(): Promise<void> {
    // Delete rooms that have no participants
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('participants', '[]');

    if (error) {
      console.error('Error cleaning up empty rooms:', error);
      throw new Error(`Failed to cleanup empty rooms: ${error.message}`);
    }
  }
}

export const getRoomService = () => new RoomService(); 