
import { useState, useEffect, useRef } from 'react';

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
    const roomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const restaurants = getStaticRestaurants();
    
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
      restaurants,
      location,
      lastUpdated: Date.now()
    };

    setRoomState(newRoom);
    setIsHost(true);
    
    // Store in memory and localStorage
    activeRooms.set(roomId, newRoom);
    localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
    
    console.log(`Created room ${roomId} with ${restaurants.length} restaurants`);
    return roomId;
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
    
    // Update storage
    activeRooms.set(roomState.id, updatedRoom);
    localStorage.setItem(`room_${roomState.id}`, JSON.stringify(updatedRoom));
  };

  const checkForMatch = (itemId: string, type: 'restaurant' | 'foodType' = 'restaurant'): boolean => {
    if (!roomState) return false;

    const allParticipants = roomState.participants;
    
    // Check that ALL participants have swiped right on this specific item
    const participantsWhoSwipedRight = allParticipants.filter(participant => 
      roomState.swipes[participant.id]?.[itemId] === 'right'
    );

    // Only return true if the number of right swipes equals the total number of participants
    // AND there are at least 2 participants (no matches with just 1 person)
    const hasMatch = participantsWhoSwipedRight.length === allParticipants.length && 
                     allParticipants.length >= 2;

    console.log(`Checking match for ${type} ${itemId}:`);
    console.log(`Total participants: ${allParticipants.length}`);
    console.log(`Participants who swiped right: ${participantsWhoSwipedRight.length}`);
    console.log(`Has match: ${hasMatch}`);
    console.log('All swipes for this item:', allParticipants.map(p => ({
      participant: p.name,
      swipe: roomState.swipes[p.id]?.[itemId]
    })));

    return hasMatch;
  };

  const getParticipantSwipe = (participantId: string, restaurantId: string) => {
    return roomState?.swipes[participantId]?.[restaurantId];
  };

  const leaveRoom = () => {
    if (roomState) {
      // Remove from memory and localStorage
      activeRooms.delete(roomState.id);
      localStorage.removeItem(`room_${roomState.id}`);
    }
    setRoomState(null);
    setIsHost(false);
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
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

// Helper function to get static restaurant data (same as before)
function getStaticRestaurants() {
  return [
    // Mexican
    {
      id: '1',
      name: 'Chipotle Mexican Grill',
      cuisine: 'Mexican',
      image: 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
      rating: 4.2,
      priceRange: '$$',
      distance: '0.3 mi',
      estimatedTime: '15 min',
      description: 'Fast-casual Mexican restaurant chain serving burritos, bowls, and tacos with fresh ingredients.',
      tags: ['Mexican', 'Fast Casual', 'Healthy', 'Customizable']
    },
    {
      id: '2',
      name: 'Taco Bell',
      cuisine: 'Mexican',
      image: 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
      rating: 3.8,
      priceRange: '$',
      distance: '0.5 mi',
      estimatedTime: '10 min',
      description: 'Quick-service Mexican-inspired fast food with tacos, burritos, and nachos.',
      tags: ['Mexican', 'Fast Food', 'Late Night', 'Budget Friendly']
    },
    {
      id: '3',
      name: 'Qdoba Mexican Eats',
      cuisine: 'Mexican',
      image: 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
      rating: 4.0,
      priceRange: '$$',
      distance: '0.8 mi',
      estimatedTime: '20 min',
      description: 'Fast-casual Mexican restaurant with customizable burritos, bowls, and tacos.',
      tags: ['Mexican', 'Fast Casual', 'Customizable', 'Fresh']
    },

    // American
    {
      id: '4',
      name: 'Chili\'s Grill & Bar',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      rating: 4.1,
      priceRange: '$$',
      distance: '1.2 mi',
      estimatedTime: '25 min',
      description: 'Casual dining chain known for ribs, burgers, and Tex-Mex favorites.',
      tags: ['American', 'Casual Dining', 'Ribs', 'Family Friendly']
    },
    {
      id: '5',
      name: 'Applebee\'s Grill + Bar',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      rating: 3.9,
      priceRange: '$$',
      distance: '1.5 mi',
      estimatedTime: '30 min',
      description: 'Neighborhood bar and grill serving American classics and comfort food.',
      tags: ['American', 'Casual Dining', 'Bar Food', 'Comfort Food']
    },
    {
      id: '6',
      name: 'Buffalo Wild Wings',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      rating: 4.3,
      priceRange: '$$',
      distance: '0.9 mi',
      estimatedTime: '20 min',
      description: 'Sports bar chain specializing in chicken wings and American pub fare.',
      tags: ['American', 'Sports Bar', 'Wings', 'Game Day']
    },

    // Italian
    {
      id: '7',
      name: 'Olive Garden',
      cuisine: 'Italian',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      rating: 4.0,
      priceRange: '$$',
      distance: '1.1 mi',
      estimatedTime: '25 min',
      description: 'Casual Italian restaurant chain known for pasta, breadsticks, and family dining.',
      tags: ['Italian', 'Casual Dining', 'Pasta', 'Family Style']
    },
    {
      id: '8',
      name: 'Carrabba\'s Italian Grill',
      cuisine: 'Italian',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      rating: 4.2,
      priceRange: '$$$',
      distance: '1.8 mi',
      estimatedTime: '35 min',
      description: 'Upscale casual Italian restaurant with wood-fired grills and authentic recipes.',
      tags: ['Italian', 'Upscale Casual', 'Wood Fired', 'Authentic']
    },

    // Asian
    {
      id: '9',
      name: 'P.F. Chang\'s',
      cuisine: 'Chinese',
      image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
      rating: 4.1,
      priceRange: '$$$',
      distance: '1.3 mi',
      estimatedTime: '30 min',
      description: 'Upscale casual Chinese restaurant with modern interpretations of classic dishes.',
      tags: ['Chinese', 'Upscale Casual', 'Modern', 'Authentic']
    },
    {
      id: '10',
      name: 'Pei Wei Asian Kitchen',
      cuisine: 'Asian',
      image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
      rating: 4.0,
      priceRange: '$$',
      distance: '0.7 mi',
      estimatedTime: '15 min',
      description: 'Fast-casual Asian restaurant serving Chinese, Thai, and Vietnamese dishes.',
      tags: ['Asian', 'Fast Casual', 'Fusion', 'Healthy']
    },

    // Japanese
    {
      id: '11',
      name: 'Benihana',
      cuisine: 'Japanese',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      rating: 4.3,
      priceRange: '$$$',
      distance: '2.1 mi',
      estimatedTime: '45 min',
      description: 'Japanese steakhouse chain featuring teppanyaki-style cooking and entertainment.',
      tags: ['Japanese', 'Steakhouse', 'Teppanyaki', 'Entertainment']
    },
    {
      id: '12',
      name: 'Sakura Japanese Steakhouse',
      cuisine: 'Japanese',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      rating: 4.2,
      priceRange: '$$$',
      distance: '1.6 mi',
      estimatedTime: '40 min',
      description: 'Japanese steakhouse with hibachi grills and sushi bar.',
      tags: ['Japanese', 'Steakhouse', 'Hibachi', 'Sushi']
    },

    // Indian
    {
      id: '13',
      name: 'Bombay Palace',
      cuisine: 'Indian',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      rating: 4.4,
      priceRange: '$$',
      distance: '1.4 mi',
      estimatedTime: '25 min',
      description: 'Authentic Indian restaurant serving traditional curries, tandoori, and naan bread.',
      tags: ['Indian', 'Authentic', 'Curry', 'Vegetarian Friendly']
    },

    // Thai
    {
      id: '14',
      name: 'Thai Express',
      cuisine: 'Thai',
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
      rating: 4.1,
      priceRange: '$$',
      distance: '0.9 mi',
      estimatedTime: '20 min',
      description: 'Fast-casual Thai restaurant with pad thai, curries, and fresh spring rolls.',
      tags: ['Thai', 'Fast Casual', 'Pad Thai', 'Spicy']
    },

    // Pizza
    {
      id: '15',
      name: 'Domino\'s Pizza',
      cuisine: 'Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      rating: 3.9,
      priceRange: '$',
      distance: '0.4 mi',
      estimatedTime: '25 min',
      description: 'Pizza delivery and carryout chain with quick service and online ordering.',
      tags: ['Pizza', 'Delivery', 'Fast Food', 'Online Ordering']
    },
    {
      id: '16',
      name: 'Pizza Hut',
      cuisine: 'Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      rating: 3.8,
      priceRange: '$',
      distance: '0.6 mi',
      estimatedTime: '30 min',
      description: 'Pizza chain with dine-in, delivery, and carryout options.',
      tags: ['Pizza', 'Delivery', 'Dine-in', 'Family Friendly']
    },

    // Burgers
    {
      id: '17',
      name: 'Five Guys',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      rating: 4.4,
      priceRange: '$$',
      distance: '0.8 mi',
      estimatedTime: '15 min',
      description: 'Fast-casual burger chain known for fresh beef and customizable toppings.',
      tags: ['American', 'Burgers', 'Fast Casual', 'Fresh']
    },
    {
      id: '18',
      name: 'Shake Shack',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      rating: 4.3,
      priceRange: '$$',
      distance: '1.2 mi',
      estimatedTime: '20 min',
      description: 'Modern roadside burger stand serving burgers, hot dogs, and frozen custard.',
      tags: ['American', 'Burgers', 'Fast Casual', 'Gourmet']
    },

    // Seafood
    {
      id: '19',
      name: 'Red Lobster',
      cuisine: 'Seafood',
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop',
      rating: 4.0,
      priceRange: '$$',
      distance: '1.7 mi',
      estimatedTime: '30 min',
      description: 'Casual seafood restaurant chain known for lobster, shrimp, and cheddar biscuits.',
      tags: ['Seafood', 'Casual Dining', 'Lobster', 'Family Friendly']
    },

    // Steakhouse
    {
      id: '20',
      name: 'Outback Steakhouse',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      rating: 4.1,
      priceRange: '$$$',
      distance: '2.0 mi',
      estimatedTime: '35 min',
      description: 'Australian-themed steakhouse with grilled steaks, ribs, and bloomin\' onion.',
      tags: ['American', 'Steakhouse', 'Grilled', 'Australian Theme']
    },

    // Coffee & Cafes
    {
      id: '21',
      name: 'Starbucks',
      cuisine: 'Coffee',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
      rating: 4.2,
      priceRange: '$$',
      distance: '0.2 mi',
      estimatedTime: '5 min',
      description: 'Global coffeehouse chain serving coffee, tea, and light food items.',
      tags: ['Coffee', 'Cafe', 'Quick Service', 'Beverages']
    },
    {
      id: '22',
      name: 'Panera Bread',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
      rating: 4.1,
      priceRange: '$$',
      distance: '0.5 mi',
      estimatedTime: '15 min',
      description: 'Fast-casual bakery-cafe chain serving sandwiches, soups, and fresh bread.',
      tags: ['American', 'Bakery', 'Sandwiches', 'Healthy']
    },

    // Fast Food
    {
      id: '23',
      name: 'McDonald\'s',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
      rating: 3.7,
      priceRange: '$',
      distance: '0.3 mi',
      estimatedTime: '10 min',
      description: 'Global fast food chain serving burgers, fries, and breakfast items.',
      tags: ['American', 'Fast Food', 'Burgers', 'Breakfast']
    },
    {
      id: '24',
      name: 'Subway',
      cuisine: 'American',
      image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
      rating: 3.8,
      priceRange: '$',
      distance: '0.4 mi',
      estimatedTime: '12 min',
      description: 'Fast food chain specializing in submarine sandwiches and salads.',
      tags: ['American', 'Fast Food', 'Sandwiches', 'Healthy']
    }
  ];
}

export default useRoom;
