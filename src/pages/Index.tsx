import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SwipeInterface from '@/components/SwipeInterface';
import GeneralSwipeInterface from '@/components/GeneralSwipeInterface';
import FilterPanel from '@/components/FilterPanel';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import QRCodeModal from '@/components/QRCodeModal';
import MatchModal from '@/components/MatchModal';
import LocationModal from '@/components/LocationModal';
import LoadingScreen from '@/components/LoadingScreen';
import EnhancedSwipeHistory from '@/components/EnhancedSwipeHistory';
import FeedbackHeader from '@/components/FeedbackHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Users, MapPin, QrCode, UserPlus, Loader2, BarChart3, User, MessageCircle, Settings, LogOut, Plus, History, RefreshCw, AlertCircle } from 'lucide-react';
import useRoom from '@/hooks/useRoom';
import { useDeviceType } from '@/hooks/use-mobile';
import { foodTypes } from '@/data/foodTypes';
import { Restaurant } from '@/data/restaurants';
import { FilterState, defaultFilters, filterRestaurants } from '@/utils/restaurantFilters';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getRoomHistoryService, RoomHistoryEntry } from '@/integrations/supabase/roomHistoryService';
import AuthModal from '@/components/AuthModal';
import UserProfileModal from '@/components/UserProfileModal';
import SubscriptionManager from '@/components/SubscriptionManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthDebugPanel } from '@/components/AuthDebugPanel';
import { toast } from 'sonner';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('specific');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [formattedLocation, setFormattedLocation] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [shownMatches, setShownMatches] = useState<Set<string>>(new Set());
  const [restaurantOrder, setRestaurantOrder] = useState<string[]>([]);
  const [foodTypeOrder, setFoodTypeOrder] = useState<string[]>([]);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequiredForRestaurants, setAuthRequiredForRestaurants] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

  const { user, profile, signOut, loading: authLoading } = useAuth();

  // Handle URL parameters for billing and subscription
  useEffect(() => {
    const subscriptionParam = searchParams.get('subscription');
    const billingReturn = searchParams.get('billing_return');
    const userId = searchParams.get('user_id');
    
    if (billingReturn === 'true') {
      console.log('User returned from billing portal');
      
      if (user) {
        console.log('User already authenticated, showing welcome message');
        toast.success("Welcome back from managing your billing!");
      } else {
        console.log('User not authenticated after billing return, checking session');
        // Try to get session from storage
        supabase.auth.getSession().then(({ data: sessionData }) => {
          if (sessionData.session) {
            console.log('Session found, user should be logged in shortly');
            toast.success("Session restored! Welcome back from billing.");
          } else {
            console.log('No session found, prompting to log in');
            toast.info("Please log in to continue managing your account.");
          }
        });
      }
      
      // Clean up URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('billing_return');
      newSearchParams.delete('user_id');
      navigate(`?${newSearchParams.toString()}`, { replace: true });
    }
    
    if (subscriptionParam === 'true') {
      setShowSubscriptionManager(true);
      // Remove the parameter from URL without page reload
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('subscription');
      navigate(`?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate, user]);
  
  const deviceType = useDeviceType();
  
  // Helper function to check if location is coordinates and return appropriate display text
  const getLocationDisplayText = (location: string | null, formattedLocation: string | null) => {
    // Only show formatted address in UI - never show coordinates
    if (formattedLocation) {
      return formattedLocation;
    }
    if (!location) {
      return 'Set Location';
    }
    // If we have location but no formatted address, show a generic message
    // This prevents coordinates from ever being displayed
    return 'Location set';
  };

  // Get the display location for the current context
  const getCurrentDisplayLocation = () => {
    // If we're in a room, use the room's formatted address
    if (roomState?.formattedAddress) {
      return roomState.formattedAddress;
    }
    // Otherwise use the local formatted location
    return getLocationDisplayText(location, formattedLocation);
  };
  
  const {
    roomState,
    isHost,
    participantId,
    isLoadingRestaurantsFromHook,
    isLoadingMoreRestaurants,
    hasReachedEnd,
    createRoom,
    createDemoRoom,
    joinRoom,
    addSwipe,
    checkForMatch,
    loadMoreRestaurants,
    reloadRestaurantsWithFilters,
    testDuplicateAPI, // Add test function
    leaveRoom
  } = useRoom();

  const isInRoom = !!roomState;

  // Use room restaurants if in a room, otherwise show empty state
  const restaurants = isInRoom 
    ? (roomState?.restaurants || [])
    : [];

  // Filter restaurants based on current filter settings (only when not in a room)
  const filteredRestaurants = useMemo(() => {
    try {
      console.log('Filtering restaurants:', restaurants);
      console.log('Is in room:', isInRoom);
      console.log('Filters:', filters);
      if (!Array.isArray(restaurants)) {
        console.error('Restaurants is not an array:', restaurants);
        return [];
      }
      // Don't filter when in a room - show all room restaurants
      if (isInRoom) {
        console.log('In room, returning all restaurants:', restaurants.length);
        return restaurants;
      }
      const filtered = filterRestaurants(restaurants, filters);
      console.log('Filtered restaurants:', filtered.length);
      return filtered;
    } catch (err) {
      console.error('Error filtering restaurants:', err);
      setError('Error filtering restaurants');
      return [];
    }
  }, [restaurants, filters, isInRoom]);

  // Monitor room state changes for new matches
  useEffect(() => {
    if (!roomState || !participantId) return;

    // Check for new matches when room state updates
    const checkForNewMatches = () => {
      const allParticipants = roomState.participants;
      if (allParticipants.length <= 1) return; // No matches with only one person

      // Check restaurant matches
      const restaurantSwipes = roomState.restaurantSwipes;
      restaurants.forEach(restaurant => {
        if (shownMatches.has(restaurant.id)) return; // Already shown this match

        // Check if all participants have actually swiped on this item
        const participantsWhoSwiped = allParticipants.filter(participant => {
          const participantSwipes = restaurantSwipes[participant.id];
          return participantSwipes && participantSwipes[restaurant.id];
        });

        // Only consider it a match if ALL participants have swiped AND all swiped right
        if (participantsWhoSwiped.length === allParticipants.length) {
          const participantsWhoSwipedRight = participantsWhoSwiped.filter(participant => {
            const participantSwipes = restaurantSwipes[participant.id];
            return participantSwipes[restaurant.id] === 'right';
          });

          // If all participants swiped right, it's a match!
          if (participantsWhoSwipedRight.length === allParticipants.length) {
            // Double-check that we haven't already shown this match and that no modal is currently open
            if (!shownMatches.has(restaurant.id) && !showMatch) {
              console.log(`🎉 NEW MATCH DETECTED for ${restaurant.name}!`);
              setMatchedRestaurant(restaurant);
              setShowMatch(true);
              setShownMatches(prev => new Set([...prev, restaurant.id]));
              
              // Add match to room history if user is authenticated and is host
              if (user && isHost && roomState) {
                const roomHistoryService = getRoomHistoryService();
                roomHistoryService.addMatchToRoomHistory(user.id, roomState.id, restaurant.name).catch(error => {
                  console.error('Error adding match to room history:', error);
                });
              }
            }
          }
        }
      });

      // Check food type matches
      const foodTypeSwipes = roomState.foodTypeSwipes;
      foodTypes.forEach(foodType => {
        if (shownMatches.has(foodType.id)) return; // Already shown this match

        const participantsWhoSwipedRight = allParticipants.filter(participant => {
          const participantSwipes = foodTypeSwipes[participant.id];
          return participantSwipes && participantSwipes[foodType.id] === 'right';
        });

        // If all participants swiped right, it's a match!
        if (participantsWhoSwipedRight.length === allParticipants.length) {
          // Double-check that we haven't already shown this match and that no modal is currently open
          if (!shownMatches.has(foodType.id) && !showMatch) {
            console.log(`🎉 NEW FOOD TYPE MATCH DETECTED for ${foodType.name}!`);
            // Convert food type to restaurant-like object for the match modal
            const restaurantMatch = {
              id: foodType.id,
              name: foodType.name,
              cuisine: foodType.name,
              image: foodType.image,
              rating: 4.5,
              priceRange: '$$',
              distance: 'Food Type Match',
              estimatedTime: 'Ready to explore!',
              description: `You both want ${foodType.name}! Time to find a great place nearby.`,
              tags: ['Match', 'Food Type']
            };
            setMatchedRestaurant(restaurantMatch);
            setShowMatch(true);
            setShownMatches(prev => new Set([...prev, foodType.id]));
            
            // Add match to room history if user is authenticated and is host
            if (user && isHost && roomState) {
              const roomHistoryService = getRoomHistoryService();
              roomHistoryService.addMatchToRoomHistory(user.id, roomState.id, foodType.name).catch(error => {
                console.error('Error adding match to room history:', error);
              });
            }
          }
        }
      });
    };

    checkForNewMatches();
  }, [roomState, participantId, restaurants, foodTypes, shownMatches, showMatch]);

  // Monitor participant count changes to clear matches when new people join
  useEffect(() => {
    if (!roomState || !participantId) return;

    const allParticipants = roomState.participants;
    if (allParticipants.length <= 1) return; // No matches with only one person

    // When participant count increases, clear all existing matches
    // This is because new participants haven't had a chance to swipe yet
    if (shownMatches.size > 0) {
      console.log(`👥 ${allParticipants.length} participants in room - clearing ${shownMatches.size} existing matches`);
      setShownMatches(new Set());
    }
  }, [roomState?.participants?.length]);



  // Check for room parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId && !roomState) {
      setShowJoinRoom(true);
    }
  }, [roomState]);

  const handleCreateRoom = async (name: string, locationToUse?: string, formattedAddress?: string, roomType?: 'demo' | 'full') => {
    
    // Validate inputs
    if (!name || name.trim() === '') {
      setError('Please provide a name for the room.');
      return;
    }

    if (roomType !== 'demo' && (!locationToUse || locationToUse.trim() === '')) {
      setError('Please provide a location for the room.');
      return;
    }

    // Update the location state if a new location was provided
    if (locationToUse) {
      setLocation(locationToUse);
      setFormattedLocation(formattedAddress || null);
    }
    
    setIsCreatingRoom(true);
    
    try {
      
      if (roomType === 'demo') {
        // Demo room creation - food types only, no API calls
        const roomId = await createDemoRoom(name, 'Demo Mode');
        setShowCreateRoom(false);
      } else if (roomType === 'full') {
        // Full room - check subscription then credits
        if (user) {
          // First check if user has active subscription
          const { data: hasActiveSubscription } = await supabase.rpc('has_active_subscription', { user_id: user.id });
          
          if (hasActiveSubscription) {
            // User has active subscription - create room directly
            await createFullRoom(name, locationToUse, formattedAddress);
          } else {
            // No active subscription - check for credits
            const { data: profileData } = await supabase
              .from('profiles')
              .select('room_credits')
              .eq('id', user.id)
              .single();
            
            if (profileData && profileData.room_credits > 0) {
              // User has credits, consume one and create room
              const { error } = await supabase.rpc('consume_room_credit', { user_id: user.id });
              
              if (error) {
                console.error('Error consuming credit:', error);
                setError('Failed to use credit. Please try again.');
                return;
              }
              
              // Create full room after consuming credit
              await createFullRoom(name, locationToUse, formattedAddress);
            } else {
              // User has no credits - show subscription modal
              setShowSubscriptionModal(true);
              setShowCreateRoom(false);
              return;
            }
          }
        } else {
          setError('Please sign in to create a full room.');
          return;
        }
      } else {
        // Legacy path - treat as full room
        await createFullRoom(name, locationToUse, formattedAddress);
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
      setShowCreateRoom(true);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const createFullRoom = async (name: string, locationToUse?: string, formattedAddress?: string) => {
    try {
        // Regular room creation with location and restaurants
        let coordinatesForAPI = locationToUse;
    
        // Check if the location is already coordinates
        const coordMatch = locationToUse.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        
        if (!coordMatch) {
          // It's an address, need to geocode it
          try {
            const { data, error } = await supabase.functions.invoke('geocoding', {
              body: {
                action: 'geocode',
                address: locationToUse
              },
            });


            if (error || !data?.lat || !data?.lng) {
              setError('Unable to find that location. Try entering your location in a format like "San Francisco, CA", "94102", or "New York, NY".');
              setIsCreatingRoom(false);
              return;
            }
            
            coordinatesForAPI = `${data.lat}, ${data.lng}`;
          } catch (error) {
            console.error('Geocoding error:', error);
            setError('Unable to find that location. Try entering your location in a format like "San Francisco, CA", "94102", or "New York, NY".');
            setIsCreatingRoom(false);
            return;
          }
        }
        
        // Normalize formattedAddress - handle the weird object format
        const normalizedFormattedAddress = formattedAddress && typeof formattedAddress === 'object' && (formattedAddress as any)._type === 'undefined' 
          ? undefined 
          : formattedAddress;
        
        // Create room with coordinates
        
        const createRoomResult = await createRoom(name, coordinatesForAPI, filters, normalizedFormattedAddress);
        
        // Check if it's a string (room ID) or an object with success property
        if (typeof createRoomResult === 'string') {
          // Success - room ID returned
        } else if (!createRoomResult || typeof createRoomResult === 'object') {
          throw new Error('Room creation failed');
        }
        
        // Show QR modal after successful room creation
        setShowQRCode(true);
        setShowCreateRoom(false);
    } catch (error) {
      console.error('Error in createFullRoom:', error);
      throw error;
    }
  };



  const handleJoinRoom = async (roomId: string, name: string) => {
    if (isJoiningRoom) return false; // Prevent multiple submissions
    
    setIsJoiningRoom(true);
    try {
      await joinRoom(roomId, name);
      setShowJoinRoom(false);
      return true;
    } catch (err) {
      console.error('Error joining room:', err);
      // Don't set global error for room-not-found errors, let the modal handle it
      // Only set global error for unexpected errors
      if (err instanceof Error && err.message !== 'Room not found') {
        setError('Failed to join room. Please check the room ID and try again.');
      }
      return false;
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (isLeavingRoom) return; // Prevent multiple calls
    
    setIsLeavingRoom(true);
    try {
      // Save room to history if user is authenticated and is the host
      if (user && isHost && roomState) {
        const roomHistoryService = getRoomHistoryService();
        try {
          await roomHistoryService.saveRoomHistoryIfNotExists({
            userId: user.id,
            roomId: roomState.id,
            roomName: roomState.participants.find(p => p.id === roomState.hostId)?.name,
            location: roomState.location,
            restaurants: roomState.restaurants,
            filters: roomState.filters
          });
          console.log('Room saved to history');
        } catch (historyError) {
          console.error('Error saving room to history:', historyError);
          // Don't block room leaving if history saving fails
        }
      }
      
      // Clean up session storage
      sessionStorage.removeItem('toss_leaving_room');
      sessionStorage.removeItem('toss_participant_id');
      
      await leaveRoom();
    } catch (error) {
      console.error('Error leaving room:', error);
      setError('Failed to leave room. Please try again.');
    } finally {
      setIsLeavingRoom(false);
    }
  };

  const handleLocationChange = (newLocation: string, formattedAddress?: string) => {
    setLocation(newLocation);
    setFormattedLocation(formattedAddress || null);
    setShowLocation(false);
  };



  const handleBringRestaurantToFront = (restaurantId: string) => {
    setRestaurantOrder(prev => [restaurantId, ...prev.filter(id => id !== restaurantId)]);
  };

  const handleBringFoodTypeToFront = (foodTypeId: string) => {
    setFoodTypeOrder(prev => [foodTypeId, ...prev.filter(id => id !== foodTypeId)]);
  };

  const handleRecreateRoom = async (roomData: RoomHistoryEntry) => {
    if (!user) return;

    try {
      // Create a new room with the same data
      const roomName = roomData.room_name || `Room ${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Use the createRoom function from useRoom hook
      const roomId = await createRoom(
        roomName,
        roomData.location,
        roomData.filters || defaultFilters,
        undefined // formattedAddress - we'll use the coordinates
      );

      if (roomId) {
        // The room will be created with the saved restaurants
        // The useRoom hook will handle loading the restaurants
        console.log('Room recreated successfully with saved data');
      } else {
        console.error('Failed to recreate room');
      }
    } catch (error) {
      console.error('Error recreating room:', error);
    }
  };

  const handleGenerateMore = async () => {
    if (!roomState) return false;
    
    try {
      return await loadMoreRestaurants();
    } catch (err) {
      console.error('Failed to load more restaurants:', err);
      return false;
    }
  };

  const handleFiltersChange = async (newFilters: FilterState) => {
    setFilters(newFilters);
    
    if (isInRoom && roomState) {
      try {
        await reloadRestaurantsWithFilters(newFilters);
      } catch (err) {
        console.error('Error reloading restaurants with filters:', err);
        setError('Failed to apply filters. Please try again.');
      }
    }
  };

  const resetFiltersWithoutReload = () => {
    setFilters(defaultFilters);
  };

  const handleRestaurantSwipe = (restaurantId: string, direction: 'left' | 'right') => {
    if (!roomState || !participantId) return;
    
    console.log('handleRestaurantSwipe called:', { restaurantId, direction, participantId });
    console.log('Current room state before swipe:', roomState);
    
    // Check for match BEFORE adding the swipe (since we know what direction we're swiping)
    if (direction === 'right') {
      // Get all participants except the current user
      const otherParticipants = roomState.participants.filter(p => p.id !== participantId);
      
      // Check if all other participants have already swiped right
      const allOthersSwipedRight = otherParticipants.every(participant => {
        const participantSwipes = roomState.restaurantSwipes[participant.id];
        return participantSwipes && participantSwipes[restaurantId] === 'right';
      });
      
      // If all others swiped right and we're swiping right, it's a match!
      if (allOthersSwipedRight && otherParticipants.length > 0) {
        const matchedItem = restaurants.find(r => r.id === restaurantId);
        // Double-check that we haven't already shown this match and that no modal is currently open
        if (matchedItem && !showMatch && !shownMatches.has(restaurantId)) {
          console.log(`🎉 MATCH FOUND for ${matchedItem.name}!`);
          setMatchedRestaurant(matchedItem);
          setShowMatch(true);
          setShownMatches(prev => new Set([...prev, restaurantId]));
        }
      }
    }
    
    addSwipe(restaurantId, direction, 'restaurant');
  };

  const handleFoodTypeSwipe = (foodTypeId: string, direction: 'left' | 'right') => {
    console.log('🍕 DEBUG: handleFoodTypeSwipe called:', { foodTypeId, direction, participantId });
    console.log('🍕 DEBUG: roomState exists:', !!roomState);
    console.log('🍕 DEBUG: participantId exists:', !!participantId);
    
    if (!roomState || !participantId) {
      console.error('🍕 DEBUG: Early return - missing roomState or participantId');
      return;
    }
    
    console.log('🍕 DEBUG: Validation passed, proceeding with swipe logic');
    console.log('Current room state before swipe:', roomState);
    
    // Check for match BEFORE adding the swipe (since we know what direction we're swiping)
    if (direction === 'right') {
      // Get all participants except the current user
      const otherParticipants = roomState.participants.filter(p => p.id !== participantId);
      
      // Check if all other participants have already swiped right
      const allOthersSwipedRight = otherParticipants.every(participant => {
        const participantSwipes = roomState.foodTypeSwipes[participant.id];
        return participantSwipes && participantSwipes[foodTypeId] === 'right';
      });
      
      // If all others swiped right and we're swiping right, it's a match!
      if (allOthersSwipedRight && otherParticipants.length > 0) {
        const matchedItem = foodTypes.find(f => f.id === foodTypeId);
        // Double-check that we haven't already shown this match and that no modal is currently open
        if (matchedItem && !showMatch && !shownMatches.has(foodTypeId)) {
          console.log(`🎉 IMMEDIATE MATCH FOUND for ${matchedItem.name}!`);
          // Convert food type to restaurant-like object for the match modal
          const restaurantMatch = {
            id: matchedItem.id,
            name: matchedItem.name,
            cuisine: matchedItem.name,
            image: matchedItem.image,
            rating: 4.5,
            priceRange: '$$',
            distance: 'Food Type Match',
            estimatedTime: 'Ready to explore!',
            description: `You both want ${matchedItem.name}! Time to find a great place nearby.`,
            tags: ['Match', 'Food Type']
          };
          setMatchedRestaurant(restaurantMatch);
          setShowMatch(true);
          setShownMatches(prev => new Set([...prev, foodTypeId]));
        }
      }
    }
    
    console.log('🍕 DEBUG: About to call addSwipe with:', { foodTypeId, direction, type: 'foodType' });
    addSwipe(foodTypeId, direction, 'foodType');
    console.log('🍕 DEBUG: addSwipe call completed');
  };

  // Responsive container classes
  const getContainerClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto px-2 py-2';
      case 'tablet':
        return 'max-w-2xl mx-auto px-6 py-4';
      default:
        return 'max-w-md mx-auto px-4 py-4'; // Keep original desktop layout
    }
  };

  const getHeaderClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto px-2 py-1';
      case 'tablet':
        return 'max-w-2xl mx-auto px-6 py-2';
      default:
        return 'max-w-md mx-auto px-4 py-3'; // Keep original desktop layout
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
      {/* Error Fallback */}
      {error && (
        <div className="fixed inset-0 bg-red-500 text-white flex items-center justify-center z-50">
          <div className="text-center p-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4 text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-white text-red-500 px-4 py-2 rounded-lg text-sm sm:text-base"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-40 min-h-[48px] sm:min-h-[56px]">
        <div className={getHeaderClasses()}>
          <div className="flex items-center justify-between">
            {/* Left side - Filter and message buttons (mobile/tablet only) */}
            <div className="flex items-center gap-1 lg:hidden">
              {activeTab === 'specific' && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="hover:text-orange-600 text-gray-600 transition-colors"
                  title="Filter restaurants"
                >
                  <Filter className="w-4 h-4" />
                </button>
              )}
              <div className="-ml-1">
                <FeedbackHeader />
              </div>
            </div>
            
            {/* Center - Title (all screen sizes) */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button 
                onClick={() => {
                  if (isInRoom && !isLeavingRoom) {
                    // Show confirmation dialog before leaving room
                    if (window.confirm('Are you sure you want to leave the room? This will take you back to the home page.')) {
                      handleLeaveRoom();
                    }
                  }
                }}
                disabled={isLeavingRoom}
                className={`flex items-center gap-1 sm:gap-2 transition-opacity ${
                  isInRoom 
                    ? 'hover:opacity-80 cursor-pointer' 
                    : 'hover:opacity-80'
                } ${isLeavingRoom ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isInRoom ? 'Click to leave room and go home' : undefined}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center relative overflow-hidden">
                  {/* Connected T shapes - one upright, one upside-down */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Upright T */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      <div className="text-white font-bold text-xs sm:text-sm leading-none">T</div>
                    </div>
                    {/* Upside-down T */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="text-white font-bold text-xs sm:text-sm leading-none transform rotate-180">T</div>
                    </div>
                    {/* OR text overlaid on top */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-[6px] sm:text-[8px] leading-none bg-gradient-to-r from-orange-500 to-pink-500 px-1 rounded">OR</span>
                    </div>
                  </div>
                  {/* Loading spinner when leaving room */}
                  {isLeavingRoom && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Toss or Taste
                </h1>
              </button>
            </div>
            
            {/* Right side - Desktop icons and mobile auth */}
            <div className="flex items-center gap-5 sm:gap-3">
              {/* Desktop icons */}
              <div className="hidden lg:flex items-center gap-3">
                {activeTab === 'specific' && (
                  <button
                    onClick={() => setShowFilters(true)}
                    className="p-2 rounded-md hover:bg-orange-50 transition-colors text-gray-600 hover:text-orange-600"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                )}
                <FeedbackHeader />
              </div>
              
              {/* Mobile/Tablet auth button */}
              <div className="lg:hidden">
                {!user ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700 flex items-center gap-1 sm:gap-2"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline font-medium text-xs sm:text-sm">Sign In/Sign Up</span>
                    <span className="sm:hidden font-medium text-xs">Sign In</span>
                  </button>
                ) : profile?.name ? (
                  <button
                    onClick={() => setShowUserProfile(true)}
                    className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700 flex items-center gap-1 sm:gap-2"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline font-medium text-xs sm:text-sm">
                      {profile.name}
                    </span>
                    <span className="sm:hidden font-medium text-xs">
                      {profile.name}
                    </span>
                  </button>
                ) : authLoading ? (
                  // Show loading state while auth loads
                  <div className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 opacity-50">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                    <span className="hidden sm:inline font-medium text-xs sm:text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  // Auth loaded but no profile - show sign in button
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700 flex items-center gap-1 sm:gap-2"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline font-medium text-xs sm:text-sm">Sign In/Sign Up</span>
                    <span className="sm:hidden font-medium text-xs">Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Button - Desktop only */}
      <div className="fixed top-2 right-2 sm:right-4 z-50 hidden lg:block">
        {!user ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700 flex items-center gap-1 sm:gap-2"
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-medium text-xs sm:text-sm">Sign In/Sign Up</span>
            <span className="sm:hidden font-medium text-xs">Sign In</span>
          </button>
        ) : profile?.name ? (
          <button
            onClick={() => setShowUserProfile(true)}
            className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700 flex items-center gap-1 sm:gap-2"
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-medium text-xs sm:text-sm">
              {profile.name}
            </span>
            <span className="sm:hidden font-medium text-xs">
              {profile.name}
            </span>
          </button>
        ) : authLoading ? (
          // Show loading state while auth loads
          <div className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 opacity-50">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            <span className="hidden sm:inline font-medium text-xs sm:text-sm text-gray-500">Loading...</span>
          </div>
        ) : (
          // Auth loaded but no profile - show sign in button
          <button
            onClick={() => setShowAuthModal(true)}
            className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700 flex items-center gap-1 sm:gap-2"
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-medium text-xs sm:text-sm">Sign In/Sign Up</span>
            <span className="sm:hidden font-medium text-xs">Sign In</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className={`${getContainerClasses()} pt-12`}> {/* Reduced pt-16 to pt-12 since button is higher */}
        {!isInRoom ? (
          /* Welcome Screen */
          <div className="h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
            {/* Background Image - Full Viewport Coverage */}
            <div 
              className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-50 transition-opacity duration-500" 
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0
              }}
            />
            
            <div className="text-center space-y-4 sm:space-y-6 w-full max-w-lg mx-auto relative z-20 px-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-orange-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
                  Find food together!
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed">
                  Swipe on restaurants with your dining partners and get matched when you all like the same place.
                </p>
                
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  <Button
                    onClick={() => setShowCreateRoom(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-sm sm:text-base md:text-lg py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8"
                  >
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" />
                    Create Room & Share QR
                  </Button>
                  
                  <Button
                    onClick={() => setShowJoinRoom(true)}
                    variant="outline"
                    className="w-full border-orange-200 hover:bg-orange-50 text-sm sm:text-base md:text-lg py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" />
                    Join Room
                  </Button>
                  

                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Room Active */
          <>
            {/* Room Status Bar */}
            <div className="bg-transparent rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-3 sm:mb-4 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  {isHost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQRCode(true)}
                      className="text-orange-600 hover:bg-orange-50 flex-shrink-0"
                    >
                      <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                  <span className="text-gray-700 truncate">Room: {roomState.id}</span>
                  {roomState.participants && roomState.participants.find(p => p.id === roomState.hostId) && (
                    <>
                      <span className="text-gray-400 hidden sm:inline">•</span>
                      <span className="font-medium text-gray-900 hidden sm:inline">Host: {roomState.participants.find(p => p.id === roomState.hostId)?.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLeaveRoom}
                    className="text-red-600 hover:bg-red-50 px-2 sm:px-3"
                  >
                    <span className="text-xs sm:text-sm">Leave</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Room Interface - Food Types Only */}
            {roomState?.location === 'demo' ? (
              <div className="mb-2 sm:mb-3">
                {/* Room Stats Button */}
                <div className="mt-2 flex justify-center">
                  <Button
                    onClick={() => setShowHistory(true)}
                    variant="outline"
                    size="sm"
                    className="border-orange-200 hover:bg-orange-50 text-orange-600 px-3 sm:px-4"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Room Stats
                  </Button>
                </div>
                
                {/* Food Types Interface */}
                <div className="mt-2">
                  <GeneralSwipeInterface 
                    foodTypes={foodTypes}
                    roomState={roomState}
                    onSwipe={handleFoodTypeSwipe}
                    onMatch={setMatchedRestaurant}
                    checkForMatch={checkForMatch}
                    participantId={participantId}
                    onBringToFront={handleBringFoodTypeToFront}
                    customOrder={foodTypeOrder}
                  />
                </div>
              </div>
            ) : (
              /* Regular Room Interface - Two Tabs */
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2 sm:mb-3">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger 
                    value="specific" 
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white bg-white text-gray-700 text-xs sm:text-sm py-1.5 sm:py-2 rounded-md transition-all"
                  >
                    Restaurants
                  </TabsTrigger>
                  <TabsTrigger 
                    value="general" 
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white bg-white text-gray-700 text-xs sm:text-sm py-1.5 sm:py-2 rounded-md transition-all"
                  >
                    Food Types
                  </TabsTrigger>
                </TabsList>
                
                {/* Room Stats Button */}
                <div className="mt-2 flex justify-center">
                  <Button
                    onClick={() => setShowHistory(true)}
                    variant="outline"
                    size="sm"
                    className="border-orange-200 hover:bg-orange-50 text-orange-600 px-3 sm:px-4"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Room Stats
                  </Button>
                </div>
                
                <TabsContent value="specific" className="mt-2">
                  {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 md:py-12">
                      <div className="text-3xl sm:text-4xl md:text-6xl mb-3 sm:mb-4">🍽️</div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">No restaurants found</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                        No restaurants available in your area. Try changing your location.
                      </p>
                      <Button
                        onClick={() => setShowLocation(true)}
                        variant="outline"
                        className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                      >
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Change Location
                      </Button>
                    </div>
                  ) : (
                    <SwipeInterface
                      key={roomState?.id || 'no-room'}
                      restaurants={filteredRestaurants}
                      roomState={roomState}
                      onSwipe={handleRestaurantSwipe}
                      onMatch={setMatchedRestaurant}
                      checkForMatch={checkForMatch}
                      participantId={participantId}
                      onBringToFront={handleBringRestaurantToFront}
                      customOrder={restaurantOrder}
                      onGenerateMore={handleGenerateMore}
                      onTakeSecondLook={() => {
                        // This will be handled by the SwipeInterface component
                        console.log('Taking a second look at restaurants');
                      }}
                      hasReachedEndFromHook={hasReachedEnd}
                      isLoadingMoreRestaurants={isLoadingMoreRestaurants}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="general" className="mt-0">
                  <GeneralSwipeInterface 
                    foodTypes={foodTypes}
                    roomState={roomState}
                    onSwipe={handleFoodTypeSwipe}
                    onMatch={setMatchedRestaurant}
                    checkForMatch={checkForMatch}
                    participantId={participantId}
                    onBringToFront={handleBringFoodTypeToFront}
                    customOrder={foodTypeOrder}
                  />
                </TabsContent>
              </Tabs>
            )}

            {/* Instructions */}
            <div className="text-center mt-3 sm:mt-4 space-y-1 px-2">
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                {roomState?.location === 'demo' 
                  ? 'Swipe right on food types you\'re craving, left if you don\'t want them'
                  : activeTab === 'specific' 
                    ? 'Swipe right if you want to eat there, left if you don\'t'
                    : 'Swipe right on food types you\'re craving, left if you don\'t want them'
                }
              </p>
              <p className="text-orange-600 text-xs sm:text-sm font-medium">
                When everyone swipes right, it's a match! 🎉
              </p>
              {roomState?.location === 'demo' && (
                <p className="text-gray-500 text-xs">
                  Demo mode • Food types only • Sign in for restaurants
                </p>
              )}
            </div>

            {/* Room Stats Modal */}
            {showHistory && roomState && (
              <EnhancedSwipeHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                userSwipes={
                  // For demo rooms, always show food type swipes
                  roomState?.location === 'demo' 
                    ? roomState.foodTypeSwipes?.[participantId || ''] || {}
                    : activeTab === 'specific' 
                      ? roomState.restaurantSwipes?.[participantId || ''] || {}
                      : roomState.foodTypeSwipes?.[participantId || ''] || {}
                }
                roomState={roomState}
                items={
                  // For demo rooms, always show food types
                  roomState?.location === 'demo' 
                    ? foodTypes 
                    : activeTab === 'specific' ? filteredRestaurants : foodTypes
                }
                type={
                  // For demo rooms, always use foodTypes
                  roomState?.location === 'demo' 
                    ? 'foodTypes' 
                    : activeTab === 'specific' ? 'restaurants' : 'foodTypes'
                }
                participantId={participantId || 'user'}
                onBringToFront={
                  // For demo rooms, always use food type handler
                  roomState?.location === 'demo' 
                    ? handleBringFoodTypeToFront 
                    : activeTab === 'specific' ? handleBringRestaurantToFront : handleBringFoodTypeToFront
                }
              />
            )}
            
            {/* REMOVED: Background loading indicator - should be completely invisible to user */}
          </>
        )}
      </main>

      {/* Loading Screen - Show for initial room creation/joining */}
      {(isLoadingRestaurantsFromHook || isJoiningRoom) && !roomState && (
        <LoadingScreen 
          message={isCreatingRoom ? "Setting up your room..." : "Joining room..."}
          isHost={isCreatingRoom}
        />
      )}

      {/* Modals */}
      {showCreateRoom && (
        <CreateRoomModal
          onCreateRoom={handleCreateRoom}
          onClose={() => setShowCreateRoom(false)}
          isLoading={isCreatingRoom}
          currentLocation=""
        />
      )}

      {showJoinRoom && (
        <JoinRoomModal
          roomId={new URLSearchParams(window.location.search).get('room') || undefined}
          onJoinRoom={handleJoinRoom}
          onClose={() => setShowJoinRoom(false)}
        />
      )}

      {showQRCode && roomState && (
        <QRCodeModal
          roomId={roomState.id}
          participants={roomState.participants}
          onClose={() => setShowQRCode(false)}
          onContinue={() => setShowQRCode(false)}
        />
      )}

      {showMatch && matchedRestaurant && (
        <MatchModal
          restaurant={matchedRestaurant}
          onClose={() => {
            setShowMatch(false);
            // Add the matched restaurant to shownMatches so it won't show again
            if (matchedRestaurant) {
              setShownMatches(prev => new Set([...prev, matchedRestaurant.id]));
            }
          }}
        />
      )}

      {showLocation && (
        <LocationModal
          currentLocation=""
          onLocationChange={handleLocationChange}
          onClose={() => setShowLocation(false)}
          isLoading={isCreatingRoom}
        />
      )}

      {showFilters && (
        <FilterPanel
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {/* Auth Modal for restaurant access */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueWithoutAuth={() => setShowAuthModal(false)}
        defaultTab="signin"
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onRecreateRoom={handleRecreateRoom}
      />

      {/* Subscription Modal */}
      <Dialog open={showSubscriptionModal || showSubscriptionManager} onOpenChange={(open) => {
        setShowSubscriptionModal(open);
        setShowSubscriptionManager(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscribe or Purchase Credits</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You need an active subscription or room credits to create rooms with restaurant data.
            </p>
          </DialogHeader>
          <SubscriptionManager 
            onPurchaseComplete={() => {
              setShowSubscriptionModal(false);
              setShowSubscriptionManager(false);
              // The SubscriptionManager will auto-refresh on next mount
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
