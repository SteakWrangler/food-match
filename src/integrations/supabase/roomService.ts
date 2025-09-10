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
    rejoinToken: string;
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
  rejoinToken?: string;
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
        rejoinToken: crypto.randomUUID()
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
    const { roomId, participantId, participantName, rejoinToken } = params;
    
    // Implement atomic join with retry mechanism
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get current room state atomically
        const { data: currentRoom, error: fetchError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (fetchError || !currentRoom) {
          throw new Error('Room not found');
        }
        
        // Check for existing participant using token+name combination
        if (rejoinToken) {
          const existingParticipant = currentRoom.participants.find(p => 
            p.rejoinToken === rejoinToken && p.name === participantName
          );
          
          if (existingParticipant) {
            // Exact match found: restore as existing participant
            console.log(`Restoring existing participant: ${participantName} with token ${rejoinToken}`);
            return currentRoom as unknown as RoomData;
          }
        }
        
        // No exact match found: create new participant
        const newRejoinToken = rejoinToken || crypto.randomUUID();
        
        const updatedParticipants = [
          ...currentRoom.participants,
          {
            id: participantId,
            name: participantName,
            rejoinToken: newRejoinToken
          }
        ];
        
        // Atomic update with optimistic concurrency control
        const { data, error } = await supabase
          .from('rooms')
          .update({ 
            participants: updatedParticipants as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', roomId)
          .eq('updated_at', currentRoom.updated_at) // Optimistic lock check
          .select()
          .single();
        
        if (error) {
          // Check if it's a concurrency conflict
          if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
            console.log(`Join room conflict detected, retrying attempt ${attempt}/${maxRetries}`);
            lastError = error;
            
            // Add exponential backoff delay
            await new Promise(resolve => setTimeout(resolve, attempt * 100));
            continue;
          }
          
          // Other errors are not recoverable
          throw error;
        }
        
        // Success
        console.log(`Room join successful on attempt ${attempt}`);
        return data as unknown as RoomData;
        
      } catch (error) {
        lastError = error;
        console.error(`Join room attempt ${attempt} failed:`, error);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Add delay before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
      }
    }
    
    // All attempts failed
    console.error('All join room attempts failed:', lastError);
    throw new Error(`Failed to join room after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  async updateSwipe(params: UpdateSwipeParams): Promise<RoomData> {
    const { roomId, participantId, itemId, direction, type } = params;
    
    // Implement atomic updates with retry mechanism
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Start a transaction-like atomic update
        const { data: currentRoom, error: fetchError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (fetchError || !currentRoom) {
          throw new Error('Room not found');
        }
        
        // Prepare the atomic update data
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
        
        // Perform atomic update with optimistic concurrency control
        // Use the updated_at timestamp as a version check
        const { data, error } = await supabase
          .from('rooms')
          .update(updateData)
          .eq('id', roomId)
          .eq('updated_at', currentRoom.updated_at) // Optimistic lock check
          .select()
          .single();
        
        if (error) {
          // Check if it's a concurrency conflict
          if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
            // Row was updated by another operation, retry
            console.log(`Swipe update conflict detected, retrying attempt ${attempt}/${maxRetries}`);
            lastError = error;
            
            // Add exponential backoff delay
            await new Promise(resolve => setTimeout(resolve, attempt * 100));
            continue;
          }
          
          // Other errors are not recoverable
          throw error;
        }
        
        // Success - return updated room data
        console.log(`Swipe update successful on attempt ${attempt}`);
        return data as unknown as RoomData;
        
      } catch (error) {
        lastError = error;
        console.error(`Swipe update attempt ${attempt} failed:`, error);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Add delay before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
      }
    }
    
    // All attempts failed - implement graceful degradation
    console.error('All swipe update attempts failed:', lastError);
    
    // If it's a concurrency issue, try one final time with a longer delay
    if (lastError?.code === 'PGRST116' || lastError?.message?.includes('0 rows')) {
      console.log('Attempting final swipe update with extended delay...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        
        const { data: finalRoom, error: finalFetchError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (!finalFetchError && finalRoom) {
          const updateData: any = { updated_at: new Date().toISOString() };
          
          if (type === 'restaurant') {
            const updatedRestaurantSwipes = {
              ...finalRoom.restaurant_swipes,
              [participantId]: {
                ...finalRoom.restaurant_swipes[participantId],
                [itemId]: direction
              }
            };
            updateData.restaurant_swipes = updatedRestaurantSwipes as any;
          } else {
            const updatedFoodTypeSwipes = {
              ...finalRoom.food_type_swipes,
              [participantId]: {
                ...finalRoom.food_type_swipes[participantId],
                [itemId]: direction
              }
            };
            updateData.food_type_swipes = updatedFoodTypeSwipes as any;
          }
          
          const { data: finalData, error: finalError } = await supabase
            .from('rooms')
            .update(updateData)
            .eq('id', roomId)
            .select()
            .single();
          
          if (!finalError && finalData) {
            console.log('Final swipe update attempt succeeded!');
            return finalData as unknown as RoomData;
          }
        }
      } catch (finalError) {
        console.error('Final swipe update attempt also failed:', finalError);
      }
    }
    
    // Provide helpful error context for debugging
    const errorContext = {
      roomId,
      participantId,
      itemId,
      direction,
      type,
      lastErrorCode: lastError?.code,
      lastErrorMessage: lastError?.message,
      attemptsMade: maxRetries
    };
    
    console.error('Swipe update failed with context:', errorContext);
    throw new Error(`Failed to update swipe after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}. This may be due to high server load or network issues.`);
  }

  async updateRestaurants(roomId: string, restaurants: any[], nextPageToken?: string): Promise<RoomData> {
    // Implement atomic restaurant update with retry mechanism
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get current room state for optimistic concurrency control
        const { data: currentRoom, error: fetchError } = await supabase
          .from('rooms')
          .select('updated_at')
          .eq('id', roomId)
          .single();
        
        if (fetchError || !currentRoom) {
          throw new Error('Room not found');
        }
        
        const updateData: any = {
          restaurants: restaurants as any,
          updated_at: new Date().toISOString()
        };
        
        if (nextPageToken !== undefined) {
          updateData.next_page_token = nextPageToken;
        }
        
        // Atomic update with optimistic concurrency control
        const { data, error } = await supabase
          .from('rooms')
          .update(updateData)
          .eq('id', roomId)
          .eq('updated_at', currentRoom.updated_at) // Optimistic lock check
          .select()
          .single();
        
        if (error) {
          // Check if it's a concurrency conflict
          if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
            console.log(`Restaurant update conflict detected, retrying attempt ${attempt}/${maxRetries}`);
            lastError = error;
            
            // Add exponential backoff delay
            await new Promise(resolve => setTimeout(resolve, attempt * 100));
            continue;
          }
          
          throw error;
        }
        
        // Success
        console.log(`Restaurant update successful on attempt ${attempt}`);
        return data as unknown as RoomData;
        
      } catch (error) {
        lastError = error;
        console.error(`Restaurant update attempt ${attempt} failed:`, error);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Add delay before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
      }
    }
    
    // All attempts failed
    console.error('All restaurant update attempts failed:', lastError);
    throw new Error(`Failed to update restaurants after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
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
    // Implement atomic leave with retry mechanism
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get current room state atomically
        const { data: currentRoom, error: fetchError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (fetchError || !currentRoom) {
          // Room doesn't exist, nothing to do
          return;
        }
        
        // Remove participant from the room
        const updatedParticipants = currentRoom.participants.filter(p => p.id !== participantId);
        
        if (updatedParticipants.length === 0) {
          // If no participants left, delete the room atomically
          const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', roomId)
            .eq('updated_at', currentRoom.updated_at); // Ensure room hasn't changed
          
          if (error) {
            // Check if it's a concurrency conflict
            if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
              console.log(`Leave room (delete) conflict detected, retrying attempt ${attempt}/${maxRetries}`);
              lastError = error;
              
              // Add exponential backoff delay
              await new Promise(resolve => setTimeout(resolve, attempt * 100));
              continue;
            }
            
            throw error;
          }
          
          console.log(`Room deleted successfully on attempt ${attempt}`);
          return;
        } else {
          // Update room with remaining participants atomically
          const { error } = await supabase
            .from('rooms')
            .update({ 
              participants: updatedParticipants as any,
              updated_at: new Date().toISOString()
            })
            .eq('id', roomId)
            .eq('updated_at', currentRoom.updated_at); // Optimistic lock check
          
          if (error) {
            // Check if it's a concurrency conflict
            if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
              console.log(`Leave room (update) conflict detected, retrying attempt ${attempt}/${maxRetries}`);
              lastError = error;
              
              // Add exponential backoff delay
              await new Promise(resolve => setTimeout(resolve, attempt * 100));
              continue;
            }
            
            throw error;
          }
          
          console.log(`Participant removed successfully on attempt ${attempt}`);
          return;
        }
        
      } catch (error) {
        lastError = error;
        console.error(`Leave room attempt ${attempt} failed:`, error);
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Add delay before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
      }
    }
    
    // All attempts failed
    console.error('All leave room attempts failed:', lastError);
    throw new Error(`Failed to leave room after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  async cleanupEmptyRooms(): Promise<void> {
    try {
      // Delete rooms that have no participants
      const { error: emptyRoomsError } = await supabase
        .from('rooms')
        .delete()
        .eq('participants', '[]');

      if (emptyRoomsError) {
        console.error('Error cleaning up empty rooms:', emptyRoomsError);
        // Don't throw here, continue with other cleanup tasks
      } else {
        console.log('Empty rooms cleanup completed');
      }
    } catch (error) {
      console.error('Error in empty rooms cleanup:', error);
    }
  }

  async cleanupOldRooms(): Promise<void> {
    try {
      // Calculate cutoff time (24 hours ago)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const cutoffTime = twentyFourHoursAgo.toISOString();
      
      console.log(`Cleaning up rooms older than ${cutoffTime}`);
      
      // Delete rooms created more than 24 hours ago
      const { data: deletedRooms, error } = await supabase
        .from('rooms')
        .delete()
        .lt('created_at', cutoffTime)
        .select('id'); // Select ID to see how many were deleted
      
      if (error) {
        console.error('Error cleaning up old rooms:', error);
        throw new Error(`Failed to cleanup old rooms: ${error.message}`);
      }
      
      const deletedCount = deletedRooms?.length || 0;
      if (deletedCount > 0) {
        console.log(`Successfully deleted ${deletedCount} rooms older than 24 hours`);
      } else {
        console.log('No old rooms found to delete');
      }
      
    } catch (error) {
      console.error('Error in old rooms cleanup:', error);
      throw error;
    }
  }

  async runFullCleanup(): Promise<void> {
    try {
      console.log('Starting full room cleanup process...');
      
      // Run both cleanup operations
      await Promise.allSettled([
        this.cleanupEmptyRooms(),
        this.cleanupOldRooms()
      ]);
      
      console.log('Full room cleanup process completed');
    } catch (error) {
      console.error('Error in full cleanup process:', error);
      // Don't throw - cleanup should be non-blocking
    }
  }
}

export const getRoomService = () => new RoomService();

// Utility function to schedule room cleanup (can be called from app initialization)
export const scheduleRoomCleanup = () => {
  const roomService = getRoomService();
  
  // Run cleanup immediately on startup
  roomService.runFullCleanup().catch(error => {
    console.error('Initial room cleanup failed:', error);
  });
  
  // Schedule cleanup every 6 hours
  const cleanupInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  setInterval(() => {
    roomService.runFullCleanup().catch(error => {
      console.error('Scheduled room cleanup failed:', error);
    });
  }, cleanupInterval);
  
  console.log('Room cleanup scheduled to run every 6 hours');
}; 