import { useState, useEffect, useRef } from 'react';
import { getHybridRestaurantsAPI } from '@/integrations/supabase/hybridRestaurants';
import { getRoomService, RoomData, scheduleRoomCleanup } from '@/integrations/supabase/roomService';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, defaultFilters } from '@/utils/restaurantFilters';
import { useAuth } from './useAuth';

export interface RoomState {
  id: string;
  hostId: string;
  participants: Array<{
    id: string;
    name: string;
  }>;
  currentRestaurantId?: string; // Changed from currentRestaurantIndex to currentRestaurantId
  viewedRestaurantIds: string[]; // Track which restaurants user has seen
  restaurantSwipes: Record<string, Record<string, 'left' | 'right'>>;
  foodTypeSwipes: Record<string, Record<string, 'left' | 'right'>>;
  restaurants: any[];
  location: string; // Coordinates for API calls
  formattedAddress?: string; // Formatted address for UI display
  lastUpdated: number;
  filters?: FilterState;
  nextPageToken?: string;
}

const useRoom = () => {
  const { user } = useAuth();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participantId, setParticipantId] = useState<string>('');
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isLoadingMoreRestaurants, setIsLoadingMoreRestaurants] = useState(false); // Add separate state for background loading
  const [hasReachedEnd, setHasReachedEnd] = useState(false); // Track if we've reached the end of available restaurants
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastKnownRoomState, setLastKnownRoomState] = useState<RoomState | null>(null); // Track previous state for change detection
  const roomService = getRoomService();

  // Set participant ID based on authenticated user or generate one for guests
  useEffect(() => {
    if (user?.id) {
      setParticipantId(user.id);
    } else if (!participantId) {
      // Generate a proper UUID for guest users to match database schema
      const guestUuid = crypto.randomUUID();
      setParticipantId(guestUuid);
      console.log('🔍 DEBUG: Generated guest UUID:', guestUuid);
    }
  }, [user?.id, participantId]);
  
  // Reset loading state when there's no room to prevent stuck loading screen
  useEffect(() => {
    if (!roomState) {
      setIsLoadingRestaurants(false);
    }
  }, [roomState]);
  // Convert RoomData to RoomState
  const convertRoomDataToState = (roomData: RoomData): RoomState => {
    return {
      id: roomData.id,
      hostId: roomData.host_id,
      participants: roomData.participants,
      currentRestaurantId: roomData.current_restaurant_id,
      viewedRestaurantIds: roomData.viewed_restaurant_ids || [],
      restaurantSwipes: roomData.restaurant_swipes || {},
      foodTypeSwipes: roomData.food_type_swipes || {},
      restaurants: roomData.restaurants || [],
      location: roomData.location, // Coordinates for API calls
      lastUpdated: Date.now(),
      filters: roomData.filters,
      nextPageToken: roomData.next_page_token
    };
  };

  // Enhanced real-time synchronization for match updates
  useEffect(() => {
    if (roomState) {
      // Use adaptive polling frequency based on recent activity
      let pollInterval = 2000; // Start with 2 second polling
      let consecutiveUnchangedPolls = 0;
      let consecutiveErrors = 0;
      let lastUpdateTime = roomState.lastUpdated;
      let isTabVisible = true;
      
      // Pause polling when tab is not visible to save resources
      const handleVisibilityChange = () => {
        isTabVisible = !document.hidden;
        if (isTabVisible) {
          console.log('🔄 Tab became visible, resuming active polling');
          pollInterval = 2000; // Resume with active polling
        } else {
          console.log('🔄 Tab hidden, using slower polling');
          pollInterval = 10000; // Slow polling when tab is hidden
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      const poll = async () => {
        try {
          // Skip polling if offline
          if (!navigator.onLine) {
            console.log('🔄 Offline detected, skipping poll');
            pollInterval = 5000; // Check again in 5 seconds
            pollingIntervalRef.current = setTimeout(poll, pollInterval);
            return;
          }
          
          const updatedRoomData = await roomService.getRoom(roomState.id);
          if (updatedRoomData) {
            consecutiveErrors = 0; // Reset error count on success
            
            const updatedRoomState = convertRoomDataToState(updatedRoomData);
            const hasChanges = updatedRoomState.lastUpdated !== lastUpdateTime;
            
            if (hasChanges) {
              // Room was updated - use faster polling and reset state
              consecutiveUnchangedPolls = 0;
              pollInterval = isTabVisible ? 1000 : 3000; // Faster when visible
              lastUpdateTime = updatedRoomState.lastUpdated;
              
              // Check for new matches or important state changes
              const hasNewSwipes = JSON.stringify(updatedRoomState.restaurantSwipes) !== JSON.stringify(roomState.restaurantSwipes) ||
                                JSON.stringify(updatedRoomState.foodTypeSwipes) !== JSON.stringify(roomState.foodTypeSwipes);
              const hasNewParticipants = updatedRoomState.participants.length !== roomState.participants.length;
              
              if (hasNewSwipes || hasNewParticipants) {
                console.log('🔄 Real-time sync: Important room changes detected', { 
                  hasNewSwipes, 
                  hasNewParticipants,
                  participantCount: updatedRoomState.participants.length 
                });
              }
              
              setRoomState(updatedRoomState);
            } else {
              // No changes - gradually slow down polling to reduce server load
              consecutiveUnchangedPolls++;
              
              // Adaptive polling intervals (adjust for tab visibility):
              const baseInterval = isTabVisible ? 1 : 3; // Multiplier based on visibility
              
              if (consecutiveUnchangedPolls <= 5) {
                pollInterval = Math.max(2000 * baseInterval, pollInterval);
              } else if (consecutiveUnchangedPolls <= 15) {
                pollInterval = 3000 * baseInterval;
              } else {
                pollInterval = 5000 * baseInterval;
              }
            }
          }
        } catch (error) {
          consecutiveErrors++;
          console.error(`Error in real-time sync (${consecutiveErrors} consecutive):`, error);
          
          // Exponential backoff on repeated errors
          if (consecutiveErrors >= 3) {
            pollInterval = Math.min(30000, 5000 * Math.pow(2, consecutiveErrors - 3)); // Cap at 30 seconds
            console.log(`🚨 Multiple sync errors, using ${pollInterval/1000}s interval`);
          } else {
            pollInterval = 5000;
          }
          
          // If too many consecutive errors, something might be seriously wrong
          if (consecutiveErrors >= 10) {
            console.error('🚨 Too many consecutive sync errors, may need user intervention');
            // Could potentially show a user notification here
          }
        }
        
        // Schedule next poll with current interval
        pollingIntervalRef.current = setTimeout(poll, pollInterval);
      };
      
      // Start polling
      poll();
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (pollingIntervalRef.current) {
          clearTimeout(pollingIntervalRef.current);
        }
      };
    }
  }, [roomState?.id]);

  // Initialize room cleanup system once
  useEffect(() => {
    // Schedule cleanup system on first mount
    const cleanupInitialized = sessionStorage.getItem('roomCleanupInitialized');
    if (!cleanupInitialized) {
      console.log('Initializing room cleanup system...');
      scheduleRoomCleanup();
      sessionStorage.setItem('roomCleanupInitialized', 'true');
    }
    
    // Also run periodic cleanup for empty rooms more frequently (local cleanup)
    const cleanupInterval = setInterval(async () => {
      try {
        await roomService.runFullCleanup();
      } catch (error) {
        console.error('Error in periodic room cleanup:', error);
      }
    }, 300000); // Run every 5 minutes (less frequent than before)

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Handle page unload/refresh to ensure user leaves room
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomState) {
        // Use synchronous storage to ensure this runs before page unloads
        sessionStorage.setItem('toss_leaving_room', roomState.id);
        sessionStorage.setItem('toss_participant_id', participantId);
      }
    };

    const handlePageShow = () => {
      // Check if we're returning to a page that was leaving a room
      const leavingRoomId = sessionStorage.getItem('toss_leaving_room');
      const leavingParticipantId = sessionStorage.getItem('toss_participant_id');
      
      if (leavingRoomId && leavingParticipantId) {
        // Clean up the session storage
        sessionStorage.removeItem('toss_leaving_room');
        sessionStorage.removeItem('toss_participant_id');
        
        // Leave the room asynchronously
        roomService.leaveRoom(leavingRoomId, leavingParticipantId).catch(error => {
          console.error('Error leaving room on page return:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [roomState?.id, participantId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (roomState) {
        // Leave room when component unmounts
        roomService.leaveRoom(roomState.id, participantId).catch(error => {
          console.error('Error leaving room on unmount:', error);
        });
      }
    };
  }, [roomState?.id, participantId]);

  const createRoom = async (hostName: string, location: string, filters: FilterState, formattedAddress?: string) => {
    console.log('🏠 DEBUG: createRoom function called with:');
    console.log('🏠 DEBUG: - hostName:', hostName);
    console.log('🏠 DEBUG: - location:', location);
    console.log('🏠 DEBUG: - filters:', filters);
    console.log('🏠 DEBUG: - formattedAddress:', formattedAddress);
    console.log('🏠 DEBUG: - participantId:', participantId);
    
    try {
      // Set loading state immediately
      console.log('🏠 DEBUG: Setting isLoadingRestaurants to true');
      setIsLoadingRestaurants(true);
      
      console.log('🏠 DEBUG: About to call roomService.createRoom');
      const roomData = await roomService.createRoom({
        hostId: participantId,
        hostName,
        location, // Coordinates for API calls
        filters
      });

      console.log('🏠 DEBUG: roomService.createRoom completed successfully');
      console.log('🏠 DEBUG: roomData:', roomData);
      console.log('🏠 DEBUG: roomData.id:', roomData.id);
      console.log(`Created room ${roomData.id} from ${location}`);
      
      // Store rejoin token in sessionStorage for room host
      const hostParticipant = roomData.participants.find(p => p.id === participantId);
      if (hostParticipant?.rejoinToken) {
        sessionStorage.setItem('rejoinToken', hostParticipant.rejoinToken);
        console.log('🏠 DEBUG: Stored rejoin token for host:', hostParticipant.rejoinToken);
      }
      
      // Load initial 3 restaurants first, then set room state immediately
      console.log('🏠 DEBUG: About to call loadInitialRestaurants');
      const success = await loadInitialRestaurants(roomData.id, location, filters, true);
      console.log('🏠 DEBUG: loadInitialRestaurants result:', success);
      
      if (success) {
        console.log('🏠 DEBUG: loadInitialRestaurants succeeded, getting updated room data');
        // Set room state immediately after initial 3 restaurants are loaded
        const updatedRoomData = await roomService.getRoom(roomData.id);
        console.log('🏠 DEBUG: updatedRoomData:', updatedRoomData);
        
        if (updatedRoomData) {
          console.log('🏠 DEBUG: Converting room data to state');
          const roomState = convertRoomDataToState(updatedRoomData);
          console.log('🏠 DEBUG: converted roomState:', roomState);
          
          // Set the formatted address in the room state
          if (formattedAddress) {
            console.log('🏠 DEBUG: Setting formattedAddress in room state:', formattedAddress);
            roomState.formattedAddress = formattedAddress;
          }
          console.log('🏠 DEBUG: Setting room state');
          setRoomState(roomState);
          setIsHost(true);
          console.log(`Room ready with ${updatedRoomData.restaurants?.length || 0} initial restaurants`);
        } else {
          console.error('🏠 DEBUG: Failed to get updated room data');
        }
      } else {
        console.log('🏠 DEBUG: loadInitialRestaurants failed, creating room with empty restaurants');
        // If loading failed, still create the room but with empty restaurants
        const roomState = convertRoomDataToState(roomData);
        // Set the formatted address in the room state
        if (formattedAddress) {
          roomState.formattedAddress = formattedAddress;
        }
        setRoomState(roomState);
        setIsHost(true);
        console.log('Room created but restaurant loading failed');
      }
      
      console.log('🏠 DEBUG: Setting isLoadingRestaurants to false');
      setIsLoadingRestaurants(false);
      console.log('🏠 DEBUG: Returning room ID:', roomData.id);
      return roomData.id;
    } catch (error) {
      console.error('🏠 DEBUG: Error in createRoom:', error);
      console.error('🏠 DEBUG: Error type:', typeof error);
      console.error('🏠 DEBUG: Error message:', error?.message);
      console.error('🏠 DEBUG: Error stack:', error?.stack);
      setRoomState(null);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      throw error;
    }
  };

  const createDemoRoom = async (hostName: string, formattedAddress?: string) => {
    try {
      console.log('Creating demo room for food types only...');
      console.log('Host name:', hostName);
      console.log('Participant ID:', participantId);
      
      // Create room in Supabase for multi-device coordination
      const roomData = await roomService.createRoom({
        hostId: participantId,
        hostName,
        location: 'demo', // Special location for demo rooms
        filters: defaultFilters // Use default filters for demo
      });

      console.log(`Created demo room ${roomData.id}`);
      console.log('Room data:', roomData);
      
      // Store rejoin token in sessionStorage for demo room host
      const hostParticipant = roomData.participants.find(p => p.id === participantId);
      if (hostParticipant?.rejoinToken) {
        sessionStorage.setItem('rejoinToken', hostParticipant.rejoinToken);
        console.log('🏠 DEBUG: Stored rejoin token for demo room host:', hostParticipant.rejoinToken);
      }
      
      // Create room state immediately without loading restaurants
      const roomState = convertRoomDataToState(roomData);
      if (formattedAddress) {
        roomState.formattedAddress = formattedAddress;
      }
      
      console.log('Setting room state:', roomState);
      setRoomState(roomState);
      setIsHost(true);
      setIsLoadingRestaurants(false);
      
      console.log('Demo room ready - food types only');
      return roomData.id;
    } catch (error) {
      console.error('Error creating demo room:', error);
      setRoomState(null);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      throw error;
    }
  };

  const loadInitialRestaurants = async (roomId: string, location: string, filters: FilterState, isInitialLoad: boolean = false) => {
    try {
      console.log('🚀 Loading 20 restaurants for room entry...');
      console.log('Applied filters:', filters);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: filters.distance[0] * 1609, // Convert miles to meters, use filter distance
        openNow: filters.openNow, // Use filter value directly
        limit: 20 // Load 20 restaurants initially since API is now fast
      };

      // Add price range filter - use "or-less" logic
      apiParams.minPrice = 0; // Start from lowest price (Google uses 0-4)
      apiParams.maxPrice = filters.priceRange[0]; // Use the selected price level directly

      // Add cuisine keyword if specified
      if (filters?.selectedCuisines && filters.selectedCuisines.length > 0) {
        apiParams.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`✅ COMPLETE: Fetched ${result.restaurants.length} restaurants from API`);
      
      // Handle insufficient restaurants by adding end card if needed
      const processedRestaurants = handleInsufficientRestaurants(result.restaurants.length, result.restaurants);
      
      // Update room with restaurants (this still uses Supabase for data storage)
      const updatedRoomData = await roomService.updateRestaurants(roomId, processedRestaurants, result.nextPageToken);
      
      // Set initial current restaurant if this is the first load
      if (isInitialLoad && result.restaurants.length > 0) {
        const initialUpdateData = {
          current_restaurant_id: result.restaurants[0].id,
          viewed_restaurant_ids: [],
          updated_at: new Date().toISOString()
        };
        
        await supabase
          .from('rooms')
          .update(initialUpdateData)
          .eq('id', roomId);
      }
      
      const updatedRoomState = convertRoomDataToState(updatedRoomData);
      setRoomState(updatedRoomState);
      
      console.log(`✅ Room ready with ${result.restaurants.length} initial restaurants - User can enter room now!`);
      
      // No longer need background loading since we load all 20 upfront
      // The smart loading in SwipeInterface will handle loading more when needed
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load initial restaurants:', error);
      return false;
    }
  };

  const loadMoreRestaurantsInBackground = async (roomId: string, location: string, filters: FilterState, pageToken?: string, batchSize: number = 20) => {
    try {
      const stageName = batchSize === 10 ? 'STAGE 2' : 'BACKGROUND';
      console.log(`🔄 ${stageName}: Loading ${batchSize} more restaurants in background...`);
      const hybridRestaurantsAPI = getHybridRestaurantsAPI();
      
      // Convert filters to API parameters
      const apiParams: any = {
        location,
        radius: filters.distance[0] * 1609, // Convert miles to meters, use filter distance
        openNow: filters.openNow, // Use filter value directly
        limit: batchSize,
        pageToken
      };

      // Add price range filter
      apiParams.minPrice = 0;
      apiParams.maxPrice = filters.priceRange[0];

      // Add cuisine keyword if specified
      if (filters?.selectedCuisines && filters.selectedCuisines.length > 0) {
        apiParams.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await hybridRestaurantsAPI.searchRestaurants(apiParams);
      
      console.log(`✅ ${stageName} COMPLETE: Loaded ${result.restaurants.length} more restaurants in background`);
      
      if (result.restaurants.length > 0) {
        // Append new restaurants to current room state (preserve swipes)
        const updatedRestaurants = [...roomState.restaurants, ...result.restaurants];
        
        // Add a small delay to prevent user from seeing individual restaurants being added
        // This makes the batch loading appear more seamless
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedRoom: RoomState = {
          ...roomState,
          restaurants: updatedRestaurants,
          nextPageToken: result.nextPageToken,
          lastUpdated: Date.now()
        };
        setRoomState(updatedRoom);
        
        // Update the database in the background
        roomService.updateRestaurants(roomId, updatedRestaurants, result.nextPageToken).catch(error => {
          console.error('Failed to update room in database:', error);
        });
        
        console.log(`✅ Room updated with ${result.restaurants.length} additional restaurants (total: ${updatedRestaurants.length})`);
      }
      
      // Progressive loading logic: determine next stage based on current batch size
      if (result.nextPageToken) {
        let nextBatchSize = batchSize;
        let nextDelay = 1500; // Default delay
        let nextStageName = 'BACKGROUND';
        
        // Progressive loading stages - simplified to just 10→10
        if (batchSize === 10) {
          // Stage 2 (10 restaurants) → Continue with standard batches (20 restaurants)
          nextBatchSize = 20;
          nextDelay = 1500;
          nextStageName = 'BACKGROUND';
          console.log('🔄 Progressive loading: Moving to standard batch loading (20 restaurants)');
        }
        
        setTimeout(() => {
          loadMoreRestaurantsInBackground(roomId, location, filters, result.nextPageToken, nextBatchSize);
        }, nextDelay);
      } else {
        console.log('✅ Progressive loading complete - no more restaurants available');
      }
      
    } catch (error) {
      console.error('❌ Failed to load more restaurants in background:', error);
    }
  };

  const joinRoom = async (roomId: string, participantName: string) => {
    console.log(`Attempting to join room: ${roomId}`);
    
    // Normalize room ID to uppercase
    const normalizedRoomId = roomId.toUpperCase();
    
    try {
      // Set loading state
      setIsLoadingRestaurants(true);
      
      // Get rejoin token from sessionStorage
      const storedToken = sessionStorage.getItem('rejoinToken');
      console.log('🔄 DEBUG: Retrieved rejoin token from storage:', storedToken);
      
      const roomData = await roomService.joinRoom({
        roomId: normalizedRoomId,
        participantId,
        participantName,
        rejoinToken: storedToken || undefined
      });

      // Check if room has restaurants, if not, wait a bit and check again
      if (!roomData.restaurants || roomData.restaurants.length === 0) {
        console.log('Room has no restaurants, waiting for host to load them...');
        // Wait up to 6 seconds for restaurants to be loaded
        for (let i = 0; i < 6; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const updatedRoomData = await roomService.getRoom(normalizedRoomId);
          if (updatedRoomData && updatedRoomData.restaurants && updatedRoomData.restaurants.length > 0) {
            console.log(`Restaurants loaded after ${i + 1} seconds`);
            
            // Store rejoin token for this participant
            const currentParticipant = updatedRoomData.participants.find(p => p.name === participantName);
            if (currentParticipant?.rejoinToken) {
              sessionStorage.setItem('rejoinToken', currentParticipant.rejoinToken);
              console.log('🔄 DEBUG: Stored rejoin token after successful join:', currentParticipant.rejoinToken);
            }
            
            const roomState = convertRoomDataToState(updatedRoomData);
            setRoomState(roomState);
            setIsHost(false);
            setIsLoadingRestaurants(false);
            
            // Trigger immediate sync to get latest room state and detect any existing matches
            console.log('🔄 Triggering immediate sync after joining room');
            setTimeout(async () => {
              try {
                const freshRoomData = await roomService.getRoom(normalizedRoomId);
                if (freshRoomData) {
                  const freshRoomState = convertRoomDataToState(freshRoomData);
                  setRoomState(freshRoomState);
                }
              } catch (error) {
                console.error('Error in post-join sync:', error);
              }
            }, 500);
            
            return true;
          }
        }
        console.log('No restaurants loaded after 6 seconds, joining with empty room');
      }

      // Store rejoin token for this participant
      const currentParticipant = roomData.participants.find(p => p.name === participantName);
      if (currentParticipant?.rejoinToken) {
        sessionStorage.setItem('rejoinToken', currentParticipant.rejoinToken);
        console.log('🔄 DEBUG: Stored rejoin token after successful join:', currentParticipant.rejoinToken);
      }
      
      const roomState = convertRoomDataToState(roomData);
      setRoomState(roomState);
      setIsHost(false);
      setIsLoadingRestaurants(false);
      
      // Trigger immediate sync after joining
      console.log('🔄 Triggering immediate sync after joining room');
      setTimeout(async () => {
        try {
          const freshRoomData = await roomService.getRoom(normalizedRoomId);
          if (freshRoomData) {
            const freshRoomState = convertRoomDataToState(freshRoomData);
            setRoomState(freshRoomState);
          }
        } catch (error) {
          console.error('Error in post-join sync:', error);
        }
      }, 500);
      
      console.log(`Successfully joined room ${normalizedRoomId} with ${roomData.restaurants?.length || 0} restaurants`);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      setIsLoadingRestaurants(false);
      // Re-throw the error so the calling function can handle it
      throw error;
    }
  };

  const addSwipe = async (itemId: string, direction: 'left' | 'right', type: 'restaurant' | 'foodType' = 'restaurant') => {
    console.log('🎯 DEBUG: addSwipe called with:', { itemId, direction, type, roomId: roomState?.id, participantId });
    
    if (!roomState) {
      console.error('🎯 DEBUG: addSwipe failed - no roomState');
      return;
    }
    
    if (!participantId) {
      console.error('🎯 DEBUG: addSwipe failed - no participantId');
      return;
    }

    try {
      console.log('🎯 DEBUG: Calling roomService.updateSwipe...');
      const updatedRoomData = await roomService.updateSwipe({
        roomId: roomState.id,
        participantId,
        itemId,
        direction,
        type
      });
      console.log('🎯 DEBUG: roomService.updateSwipe succeeded, updating room state');
      
      const updatedRoomState = convertRoomDataToState(updatedRoomData);
      setRoomState(updatedRoomState);
      
      // Immediately trigger a sync check for potential matches
      // This ensures match detection happens as fast as possible
      if (direction === 'right') {
        console.log('🔄 Triggering immediate sync check for potential matches');
        
        // Clear current polling timeout and restart with short delay
        if (pollingIntervalRef.current) {
          clearTimeout(pollingIntervalRef.current);
        }
        
        // Schedule immediate re-sync in 200ms to catch any concurrent swipes
        pollingIntervalRef.current = setTimeout(async () => {
          try {
            const freshRoomData = await roomService.getRoom(roomState.id);
            if (freshRoomData) {
              const freshRoomState = convertRoomDataToState(freshRoomData);
              setRoomState(freshRoomState);
              console.log('🔄 Immediate sync completed after swipe');
            }
          } catch (error) {
            console.error('Error in immediate post-swipe sync:', error);
          }
        }, 200);
      }
      
      console.log('🎯 DEBUG: addSwipe completed successfully');
    } catch (error) {
      console.error('🎯 DEBUG: Error in addSwipe:', error);
      throw error;
    }
  };

  // Helper function to get the next unviewed restaurant
  const getNextUnviewedRestaurant = (restaurants: any[], viewedIds: string[], currentId?: string) => {
    const unviewed = restaurants.filter(r => !viewedIds.includes(r.id));
    
    // If we have a current restaurant, find the next one after it
    if (currentId) {
      const currentIndex = unviewed.findIndex(r => r.id === currentId);
      if (currentIndex >= 0 && currentIndex < unviewed.length - 1) {
        return unviewed[currentIndex + 1];
      }
    }
    
    // Otherwise return the first unviewed restaurant
    return unviewed[0] || null;
  };

  // Helper function to update current restaurant and viewed restaurants
  const updateRestaurantProgress = async (restaurantId: string) => {
    if (!roomState) return;

    const viewedIds = [...(roomState.viewedRestaurantIds || []), restaurantId];
    const nextRestaurant = getNextUnviewedRestaurant(roomState.restaurants, viewedIds, restaurantId);

    const updatedRoom: RoomState = {
      ...roomState,
      currentRestaurantId: nextRestaurant?.id,
      viewedRestaurantIds: viewedIds,
      lastUpdated: Date.now()
    };

    setRoomState(updatedRoom);
  };

  const checkForMatch = (itemId: string, type: 'restaurant' | 'foodType' = 'restaurant'): boolean => {
    if (!roomState) return false;

    const allParticipants = roomState.participants;
    const allSwipes = type === 'restaurant' ? roomState.restaurantSwipes : roomState.foodTypeSwipes;

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

  const getParticipantSwipe = (participantId: string, itemId: string, type: 'restaurant' | 'foodType' = 'restaurant') => {
    if (!roomState) return null;
    const swipes = type === 'restaurant' ? roomState.restaurantSwipes : roomState.foodTypeSwipes;
    return swipes[participantId]?.[itemId] || null;
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
      // No need to update roomService here, as it's polled for updates
      
      // Load new restaurants with filters
      const success = await loadInitialRestaurants(roomState.id, roomState.location, filters);
      return success;
    } catch (error) {
      console.error('Failed to reload restaurants with filters:', error);
      return false;
    }
  };

  // Add a test function to check for duplicates
  // Enhanced debugging function for production issues
  const debugRoomState = () => {
    if (!roomState) {
      console.log('🔍 DEBUG: No room state available');
      return null;
    }
    
    const debugInfo = {
      roomId: roomState.id,
      location: roomState.location,
      formattedAddress: roomState.formattedAddress,
      participantCount: roomState.participants.length,
      restaurantCount: roomState.restaurants.length,
      hasNextPageToken: !!roomState.nextPageToken,
      nextPageToken: roomState.nextPageToken ? roomState.nextPageToken.substring(0, 20) + '...' : null,
      lastUpdated: new Date(roomState.lastUpdated).toISOString(),
      currentFilters: roomState.filters,
      swipeStats: {
        restaurantSwipes: Object.keys(roomState.restaurantSwipes).length,
        foodTypeSwipes: Object.keys(roomState.foodTypeSwipes).length,
        totalUserSwipes: Object.values(roomState.restaurantSwipes).reduce(
          (total, userSwipes) => total + Object.keys(userSwipes).length, 0
        )
      },
      loadingStates: {
        isLoadingRestaurants,
        isLoadingMoreRestaurants,
        hasReachedEnd
      }
    };
    
    console.log('🔍 ROOM DEBUG INFO:', debugInfo);
    return debugInfo;
  };
  
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

  // Helper function to handle insufficient restaurants
  const handleInsufficientRestaurants = (totalFound: number, restaurants: any[]) => {
    // Only log the count, don't treat it as insufficient
    console.log(`📊 Found ${totalFound} restaurants from API`);
    return restaurants; // Return restaurants as-is
  };

  // Simple restaurant loading system
  const loadNextBatch = async () => {
    if (!roomState?.location) return false;
    if (isLoadingMoreRestaurants) return false;
    
    setIsLoadingMoreRestaurants(true);
    
    try {
      const api = getHybridRestaurantsAPI();
      const filters = roomState.filters;
      
      const params: any = {
        location: roomState.location,
        radius: filters.distance[0] * 1609,
        openNow: filters.openNow,
        limit: 20,
        pageToken: roomState.nextPageToken,
        minPrice: 0,
        maxPrice: filters.priceRange[0]
      };
      
      if (filters.selectedCuisines?.length > 0) {
        params.keyword = filters.selectedCuisines.join(' ');
      }
      
      const result = await api.searchRestaurants(params);
      
      if (result.restaurants.length > 0) {
        const newRestaurants = [...roomState.restaurants, ...result.restaurants];
        
        const updatedRoom = {
          ...roomState,
          restaurants: newRestaurants,
          nextPageToken: result.nextPageToken,
          lastUpdated: Date.now()
        };
        
        setRoomState(updatedRoom);
        await roomService.updateRestaurants(roomState.id, newRestaurants, result.nextPageToken);
        
        // Check if we've hit the end
        if (!result.nextPageToken) {
          setHasReachedEnd(true);
        } else {
          setHasReachedEnd(false);
        }
        
        console.log(`✅ Successfully loaded ${result.restaurants.length} more restaurants (total: ${newRestaurants.length})`);
        return true;
      } else {
        console.log('📍 No more restaurants returned from API');
        setHasReachedEnd(true);
        return false;
      }
    } catch (error) {
      console.error('Failed to load next batch:', error);
      
      // Handle specific pagination errors
      if (error.message?.includes('token') || error.message?.includes('invalid') || error.message?.includes('expired')) {
        console.log('🔄 Page token appears invalid, attempting recovery...');
        
        // Try to reset pagination and start fresh
        try {
          const resetParams = { ...params, pageToken: undefined };
          const recoveryResult = await api.searchRestaurants(resetParams);
          
          if (recoveryResult.restaurants.length > 0) {
            console.log('✅ Page token recovery successful');
            
            // Filter out duplicates that might already exist
            const existingIds = new Set(roomState.restaurants.map(r => r.id));
            const newUniqueRestaurants = recoveryResult.restaurants.filter(r => !existingIds.has(r.id));
            
            if (newUniqueRestaurants.length > 0) {
              const allRestaurants = [...roomState.restaurants, ...newUniqueRestaurants];
              
              const recoveredRoom = {
                ...roomState,
                restaurants: allRestaurants,
                nextPageToken: recoveryResult.nextPageToken,
                lastUpdated: Date.now()
              };
              
              setRoomState(recoveredRoom);
              await roomService.updateRestaurants(roomState.id, allRestaurants, recoveryResult.nextPageToken);
              
              console.log(`✅ Recovered with ${newUniqueRestaurants.length} new restaurants`);
              return true;
            }
          }
        } catch (recoveryError) {
          console.error('🚨 Page token recovery failed:', recoveryError);
        }
      }
      
      // For high-traffic locations like San Francisco, implement backoff
      if (error.message?.includes('rate') || error.message?.includes('limit') || error.status === 429) {
        console.log('🚦 Rate limiting detected, implementing backoff strategy');
        setHasReachedEnd(true); // Temporarily stop loading
        
        // Clear the rate limit after 2 minutes
        setTimeout(() => {
          if (roomState?.id) {
            console.log('🔄 Rate limit backoff period ended, re-enabling loading');
            setHasReachedEnd(false);
          }
        }, 120000); // 2 minutes
      }
      
      return false;
    } finally {
      setIsLoadingMoreRestaurants(false);
    }
  };

  const leaveRoom = async () => {
    if (roomState) {
      try {
        await roomService.leaveRoom(roomState.id, participantId);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    setRoomState(null);
    setIsHost(false);
    setHasReachedEnd(false);
  };

  return {
    roomState,
    isHost,
    participantId,
    isLoadingRestaurantsFromHook: isLoadingRestaurants,
    isLoadingMoreRestaurants,
    hasReachedEnd,
    createRoom,
    createDemoRoom,
    joinRoom,
    addSwipe,
    checkForMatch,
    getParticipantSwipe,
    loadMoreRestaurants: loadNextBatch, // Use the new simple function
    reloadRestaurantsWithFilters,
    testDuplicateAPI,
    debugRoomState, // Add debugging helper
    leaveRoom
  };
};

export default useRoom;