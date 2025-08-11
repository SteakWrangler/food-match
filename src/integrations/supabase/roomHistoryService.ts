import { supabase } from './client';
import { FilterState } from '@/utils/restaurantFilters';

export interface RoomHistoryEntry {
  id: string;
  user_id: string;
  room_id: string;
  room_name: string | null;
  location: string;
  restaurants: any[];
  matches: string[];
  filters: FilterState | null;
  created_at: string;
  last_accessed: string;
}

export interface SaveRoomHistoryParams {
  userId: string;
  roomId: string;
  roomName?: string;
  location: string;
  restaurants: any[];
  matches?: string[];
  filters?: FilterState;
}

export interface RecreateRoomParams {
  userId: string;
  roomName?: string;
  location: string;
  restaurants: any[];
  matches?: string[];
  filters?: FilterState;
}

export class RoomHistoryService {
  /**
   * Save a room to user's history
   */
  async saveRoomHistory(params: SaveRoomHistoryParams): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from('room_history')
        .insert({
          user_id: params.userId,
          room_id: params.roomId,
          room_name: params.roomName,
          location: params.location,
          restaurants: params.restaurants,
          matches: params.matches || [],
          filters: params.filters
        });

      return { error };
    } catch (error) {
      console.error('Error saving room history:', error);
      return { error };
    }
  }

  /**
   * Get all room history for a user
   */
  async getRoomHistory(userId: string): Promise<{ data: RoomHistoryEntry[] | null; error: any | null }> {
    try {
      const { data, error } = await supabase
        .from('room_history')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error getting room history:', error);
      return { data: null, error };
    }
  }

  /**
   * Update last_accessed timestamp for a room history entry
   */
  async updateLastAccessed(historyId: string): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from('room_history')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', historyId);

      return { error };
    } catch (error) {
      console.error('Error updating last accessed:', error);
      return { error };
    }
  }

  /**
   * Delete a room history entry
   */
  async deleteRoomHistory(historyId: string): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase
        .from('room_history')
        .delete()
        .eq('id', historyId);

      return { error };
    } catch (error) {
      console.error('Error deleting room history:', error);
      return { error };
    }
  }

  /**
   * Get a specific room history entry
   */
  async getRoomHistoryEntry(historyId: string): Promise<{ data: RoomHistoryEntry | null; error: any | null }> {
    try {
      const { data, error } = await supabase
        .from('room_history')
        .select('*')
        .eq('id', historyId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error getting room history entry:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a room exists in user's history
   */
  async roomExistsInHistory(userId: string, roomId: string): Promise<{ exists: boolean; error: any | null }> {
    try {
      const { data, error } = await supabase
        .from('room_history')
        .select('id')
        .eq('user_id', userId)
        .eq('room_id', roomId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return { exists: false, error };
      }

      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Error checking room history:', error);
      return { exists: false, error };
    }
  }

  /**
   * Add a match to an existing room history entry
   */
  async addMatchToRoomHistory(userId: string, roomId: string, matchName: string): Promise<{ error: any | null }> {
    try {
      // Get the existing room history entry
      const { data: existingEntries, error: fetchError } = await supabase
        .from('room_history')
        .select('id, matches')
        .eq('user_id', userId)
        .eq('room_id', roomId);

      if (fetchError || !existingEntries || existingEntries.length === 0) {
        console.log('No room history entry found for roomId:', roomId);
        return { error: fetchError };
      }

      const entry = existingEntries[0];
      const currentMatches = entry.matches || [];
      
      // Only add if not already in matches
      if (!currentMatches.includes(matchName)) {
        const updatedMatches = [...currentMatches, matchName];
        
        const { error } = await supabase
          .from('room_history')
          .update({ matches: updatedMatches })
          .eq('id', entry.id);

        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error adding match to room history:', error);
      return { error };
    }
  }

  /**
   * Save room to history if it doesn't already exist
   */
  async saveRoomHistoryIfNotExists(params: SaveRoomHistoryParams): Promise<{ error: any | null }> {
    try {
      const { exists, error: checkError } = await this.roomExistsInHistory(params.userId, params.roomId);
      
      if (checkError) {
        return { error: checkError };
      }

      if (exists) {
        // Room already exists in history, just update last_accessed
        const { data: historyEntry } = await this.getRoomHistory(params.userId);
        if (historyEntry) {
          const existingEntry = historyEntry.find(entry => entry.room_id === params.roomId);
          if (existingEntry) {
            return await this.updateLastAccessed(existingEntry.id);
          }
        }
        return { error: null };
      } else {
        // Save new room to history
        return await this.saveRoomHistory(params);
      }
    } catch (error) {
      console.error('Error saving room history if not exists:', error);
      return { error };
    }
  }
}

export const getRoomHistoryService = () => new RoomHistoryService(); 