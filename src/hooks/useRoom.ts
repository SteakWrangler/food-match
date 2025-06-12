
import { useState, useEffect } from 'react';

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

  const createRoom = (hostName: string) => {
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
    
    setRoomState(newRoom);
    setIsHost(true);
    
    // Store room in localStorage for persistence
    localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
    
    return roomId;
  };

  const joinRoom = (roomId: string, participantName: string) => {
    // In a real app, this would fetch from a server
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

  const addSwipe = (restaurantId: string, direction: 'left' | 'right') => {
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
