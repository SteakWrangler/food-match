import { supabase } from './client';
import { FilterState } from '@/utils/restaurantFilters';
import { 
  createMockRoom, 
  getMockRoom, 
  joinMockRoom, 
  addMockSwipe, 
  updateMockRestaurants 
} from '@/data/mockRooms';

// TEMPORARY: Use mock room data instead of database calls
// TODO: Restore database calls by setting USE_MOCK_ROOMS to false
const USE_MOCK_ROOMS = true;

export interface RoomData {
  id: string;
  host_id: string;
  participants: Array<{
    id: string;
    name: string;
    isOnline: boolean;
  }>;
  current_restaurant_index: number;
  restaurant_swipes: Record<string, Record<string, 'left' | 'right'>>;
  food_type_swipes: Record<string, Record<string, 'left' | 'right'>>;
  restaurants: any[];
  location: string;
  filters?: FilterState;
  next_page_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomParams {
  hostId: string;
  hostName: string;
  location: string;
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

export class RoomService {
  async createRoom(params: CreateRoomParams): Promise<RoomData> {
    const { hostId, hostName, location, filters } = params;
    
    // TEMPORARY: Use mock room data instead of database calls
    if (USE_MOCK_ROOMS) {
      console.log('🔧 TEMPORARY: Using mock room data instead of database calls');
      console.log('🔧 To restore database calls, set USE_MOCK_ROOMS to false in roomService.ts');
      
      const roomId = Math.random().toString(36).substr(2, 9).toUpperCase();
      return createMockRoom(roomId, hostId, hostName, location, filters);
    }

    const roomData = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      host_id: hostId,
      participants: [{
        id: hostId,
        name: hostName,
        isOnline: true
      }],
      current_restaurant_index: 0,
      restaurant_swipes: {},
      food_type_swipes: {},
      restaurants: [],
      location,
      filters,
      next_page_token: null
    };

    const { data, error } = await supabase
      .from('rooms')
      .insert(roomData)
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }

    return data;
  }

  async getRoom(roomId: string): Promise<RoomData | null> {
    // TEMPORARY: Use mock room data instead of database calls
    if (USE_MOCK_ROOMS) {
      console.log('🔧 TEMPORARY: Getting mock room:', roomId);
      return getMockRoom(roomId);
    }

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Room not found
        return null;
      }
      console.error('Error getting room:', error);
      throw new Error(`Failed to get room: ${error.message}`);
    }

    return data;
  }

  async joinRoom(params: JoinRoomParams): Promise<RoomData> {
    const { roomId, participantId, participantName } = params;
    
    // TEMPORARY: Use mock room data instead of database calls
    if (USE_MOCK_ROOMS) {
      console.log('🔧 TEMPORARY: Joining mock room:', roomId);
      const result = joinMockRoom(roomId, participantId, participantName);
      if (!result) {
        throw new Error('Room not found');
      }
      return result;
    }

    // First get the current room
    const currentRoom = await this.getRoom(roomId);
    if (!currentRoom) {
      throw new Error('Room not found');
    }

    // Check if participant is already in the room
    const existingParticipant = currentRoom.participants.find(p => p.id === participantId);
    if (existingParticipant) {
      // Update existing participant
      const updatedParticipants = currentRoom.participants.map(p => 
        p.id === participantId ? { ...p, name: participantName, isOnline: true } : p
      );

      const { data, error } = await supabase
        .from('rooms')
        .update({ 
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        console.error('Error updating room:', error);
        throw new Error(`Failed to update room: ${error.message}`);
      }

      return data;
    } else {
      // Add new participant
      const updatedParticipants = [
        ...currentRoom.participants,
        {
          id: participantId,
          name: participantName,
          isOnline: true
        }
      ];

      const { data, error } = await supabase
        .from('rooms')
        .update({ 
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        console.error('Error updating room:', error);
        throw new Error(`Failed to update room: ${error.message}`);
      }

      return data;
    }
  }

  async updateSwipe(params: UpdateSwipeParams): Promise<RoomData> {
    const { roomId, participantId, itemId, direction, type } = params;
    
    // TEMPORARY: Use mock room data instead of database calls
    if (USE_MOCK_ROOMS) {
      console.log('🔧 TEMPORARY: Updating swipe in mock room:', roomId);
      const result = addMockSwipe(roomId, participantId, itemId, direction, type);
      if (!result) {
        throw new Error('Room not found');
      }
      return result;
    }

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
      updateData.restaurant_swipes = updatedRestaurantSwipes;
    } else {
      const updatedFoodTypeSwipes = {
        ...currentRoom.food_type_swipes,
        [participantId]: {
          ...currentRoom.food_type_swipes[participantId],
          [itemId]: direction
        }
      };
      updateData.food_type_swipes = updatedFoodTypeSwipes;
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

    return data;
  }

  async updateRestaurants(roomId: string, restaurants: any[], nextPageToken?: string): Promise<RoomData> {
    // TEMPORARY: Use mock room data instead of database calls
    if (USE_MOCK_ROOMS) {
      console.log('🔧 TEMPORARY: Updating restaurants in mock room:', roomId);
      const result = updateMockRestaurants(roomId, restaurants, nextPageToken);
      if (!result) {
        throw new Error('Room not found');
      }
      return result;
    }

    const updateData: any = {
      restaurants,
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

    return data;
  }

  async updateFilters(roomId: string, filters: FilterState): Promise<RoomData> {
    const { data, error } = await supabase
      .from('rooms')
      .update({ 
        filters,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Error updating filters:', error);
      throw new Error(`Failed to update filters: ${error.message}`);
    }

    return data;
  }

  async leaveRoom(roomId: string, participantId: string): Promise<void> {
    const currentRoom = await this.getRoom(roomId);
    if (!currentRoom) {
      return; // Room doesn't exist, nothing to do
    }

    // Remove participant from the room
    const updatedParticipants = currentRoom.participants.filter(p => p.id !== participantId);

    if (updatedParticipants.length === 0) {
      // If no participants left, delete the room
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
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) {
        console.error('Error updating room:', error);
        throw new Error(`Failed to update room: ${error.message}`);
      }
    }
  }

  async cleanupOldRooms(): Promise<void> {
    // Delete rooms older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('rooms')
      .delete()
      .lt('updated_at', twentyFourHoursAgo);

    if (error) {
      console.error('Error cleaning up old rooms:', error);
      throw new Error(`Failed to cleanup old rooms: ${error.message}`);
    }
  }
}

export const getRoomService = () => new RoomService(); 