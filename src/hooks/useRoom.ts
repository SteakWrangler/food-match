import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

const useRoom = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);

  const createRoom = async (hostName: string) => {
    const roomId = Math.random().toString(36).substr(2, 8).toUpperCase();
    const newRoom: RoomState = {
      id: roomId,
      hostId: participantId,
      participants: [{
        id: participantId,
        name: hostName,
        isOnline: true
      }],
      currentRestaurantIndex: 0,
      swipes: {}
    };
    
    // Store room data using Supabase edge function
    try {
      const { data, error } = await supabase.functions.invoke('rooms', {
        body: {
          action: 'create',
          roomId,
          roomData: newRoom
        }
      });

      if (!error) {
        setRoomState(newRoom);
        setIsHost(true);
        // Keep localStorage as backup
        localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
        console.log(`Room ${roomId} created successfully`);
        return roomId;
      } else {
        console.log('Edge function error, using localStorage fallback:', error);
      }
    } catch (error) {
      console.log('Using localStorage fallback for room creation:', error);
    }
    
    // Fallback to localStorage only
    setRoomState(newRoom);
    setIsHost(true);
    localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
    return roomId;
  };

  const joinRoom = async (roomId: string, participantName: string) => {
    // First try to fetch from Supabase edge function
    try {
      const { data, error } = await supabase.functions.invoke('rooms', {
        body: {
          action: 'get',
          roomId
        }
      });

      if (!error && data?.roomData) {
        const roomData = data.roomData;
        // Add participant if not already in room
        if (!roomData.participants.find((p: any) => p.id === participantId)) {
          roomData.participants.push({
            id: participantId,
            name: participantName,
            isOnline: true
          });
          
          // Update the room with new participant
          await supabase.functions.invoke('rooms', {
            body: {
              action: 'update',
              roomId,
              roomData
            }
          });
        }
        
        setRoomState(roomData);
        setIsHost(false);
        localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
        console.log(`Successfully joined room ${roomId}`);
        return true;
      } else {
        console.log('Room not found in edge function, trying localStorage');
      }
    } catch (error) {
      console.log('Edge function not available, trying localStorage:', error);
    }

    // Fallback to localStorage
    const storedRoom = localStorage.getItem(`room_${roomId}`);
    if (storedRoom) {
      const room: RoomState = JSON.parse(storedRoom);
      
      // Add participant if not already in room
      if (!room.participants.find(p => p.id === participantId)) {
        room.participants.push({
          id: participantId,
          name: participantName,
          isOnline: true
        });
        localStorage.setItem(`room_${roomId}`, JSON.stringify(room));
      }
      
      setRoomState(room);
      setIsHost(false);
      return true;
    }
    return false;
  };

  const addSwipe = async (restaurantId: string, direction: 'left' | 'right') => {
    if (!roomState) return;

    const updatedRoom = {
      ...roomState,
      swipes: {
        ...roomState.swipes,
        [participantId]: {
          ...roomState.swipes[participantId],
          [restaurantId]: direction
        }
      }
    };

    setRoomState(updatedRoom);
    
    // Update via edge function
    try {
      await supabase.functions.invoke('rooms', {
        body: {
          action: 'update',
          roomId: roomState.id,
          roomData: updatedRoom
        }
      });
    } catch (error) {
      console.log('Failed to update room via edge function, using localStorage only:', error);
    }
    
    localStorage.setItem(`room_${roomState.id}`, JSON.stringify(updatedRoom));
  };

  const checkForMatch = (restaurantId: string): boolean => {
    if (!roomState) return false;

    const allParticipants = roomState.participants;
    const rightSwipes = allParticipants.filter(participant => 
      roomState.swipes[participant.id]?.[restaurantId] === 'right'
    );

    return rightSwipes.length === allParticipants.length;
  };

  const getParticipantSwipe = (participantId: string, restaurantId: string) => {
    return roomState?.swipes[participantId]?.[restaurantId];
  };

  const leaveRoom = () => {
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
    leaveRoom
  };
};

export default useRoom;
