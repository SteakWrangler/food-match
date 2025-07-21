import React, { useState, useEffect, useMemo } from 'react';
import SwipeInterface from '@/components/SwipeInterface';
import GeneralSwipeInterface from '@/components/GeneralSwipeInterface';
import FilterPanel from '@/components/FilterPanel';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import QRCodeModal from '@/components/QRCodeModal';
import MatchModal from '@/components/MatchModal';
import LocationModal from '@/components/LocationModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Users, MapPin, QrCode, UserPlus, Loader2 } from 'lucide-react';
import useRoom from '@/hooks/useRoom';
import { useDeviceType } from '@/hooks/use-mobile';
import { foodTypes } from '@/data/foodTypes';
import { restaurants, Restaurant } from '@/data/restaurants';
import { FilterState, defaultFilters, filterRestaurants } from '@/utils/restaurantFilters';

const Index = () => {
  const [activeTab, setActiveTab] = useState('specific');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [shownMatches, setShownMatches] = useState<Set<string>>(new Set());
  const [restaurantOrder, setRestaurantOrder] = useState<string[]>([]);
  const [foodTypeOrder, setFoodTypeOrder] = useState<string[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);
  const [pendingRoomCreation, setPendingRoomCreation] = useState<{ name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  
  const deviceType = useDeviceType();
  
  const {
    roomState,
    isHost,
    participantId,
    isLoadingRestaurantsFromHook,
    createRoom,
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

  // Check for room parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId && !roomState) {
      setShowJoinRoom(true);
    }
  }, [roomState]);

  const handleCreateRoom = async (name: string) => {
    if (isCreatingRoom) return; // Prevent multiple submissions
    
    if (!location) {
      // Store the pending room creation and show location modal
      setPendingRoomCreation({ name });
      setShowLocation(true);
      return;
    }
    
    setIsCreatingRoom(true);
    try {
      await createRoom(name, location);
      setShowCreateRoom(false);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const createRoomWithLocation = async (name: string, location: string) => {
    if (isCreatingRoom) return; // Prevent multiple submissions
    
    setIsCreatingRoom(true);
    try {
      await createRoom(name, location);
      setShowLocation(false);
      setPendingRoomCreation(null);
    } catch (err) {
      console.error('Error creating room with location:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomId: string, name: string) => {
    if (!location) {
      setShowLocation(true);
      return false;
    }
    
    try {
      await joinRoom(roomId, name);
      setShowJoinRoom(false);
      return true;
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please check the room ID and try again.');
      return false;
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    setShowLocation(false);
  };

  const handleLocationSetForRoom = (newLocation: string) => {
    setLocation(newLocation);
    setShowLocation(false);
    
    // If there was a pending room creation, create it now
    if (pendingRoomCreation) {
      createRoomWithLocation(pendingRoomCreation.name, newLocation);
    }
  };

  const handleBringRestaurantToFront = (restaurantId: string) => {
    setRestaurantOrder(prev => [restaurantId, ...prev.filter(id => id !== restaurantId)]);
  };

  const handleBringFoodTypeToFront = (foodTypeId: string) => {
    setFoodTypeOrder(prev => [foodTypeId, ...prev.filter(id => id !== foodTypeId)]);
  };

  const handleGenerateMore = async () => {
    if (!roomState) return false;
    
    setIsLoadingRestaurants(true);
    try {
      const success = await loadMoreRestaurants();
      setIsLoadingRestaurants(false);
      return success;
    } catch (err) {
      console.error('Error loading more restaurants:', err);
      setIsLoadingRestaurants(false);
      setError('Failed to load more restaurants. Please try again.');
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
    
    addSwipe(restaurantId, direction, 'restaurant');
    
    // Check for match
    if (direction === 'right' && checkForMatch(restaurantId, 'restaurant')) {
      const matchedItem = restaurants.find(r => r.id === restaurantId);
      if (matchedItem && !showMatch && !shownMatches.has(restaurantId)) {
        console.log(`🎉 MATCH FOUND for ${matchedItem.name}!`);
        setMatchedRestaurant(matchedItem);
        setShowMatch(true);
        setShownMatches(prev => new Set([...prev, restaurantId]));
      }
    }
  };

  const handleFoodTypeSwipe = (foodTypeId: string, direction: 'left' | 'right') => {
    if (!roomState || !participantId) return;
    
    console.log('handleFoodTypeSwipe called:', { foodTypeId, direction, participantId });
    console.log('Current room state before swipe:', roomState);
    
    addSwipe(foodTypeId, direction, 'foodType');
    
    // Check for match
    if (direction === 'right' && checkForMatch(foodTypeId, 'foodType')) {
      const matchedItem = foodTypes.find(f => f.id === foodTypeId);
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
  };

  // Responsive container classes
  const getContainerClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto px-3 py-4';
      case 'tablet':
        return 'max-w-2xl mx-auto px-6 py-6';
      default:
        return 'max-w-md mx-auto px-4 py-6'; // Keep original desktop layout
    }
  };

  const getHeaderClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'max-w-sm mx-auto px-3 py-3';
      case 'tablet':
        return 'max-w-2xl mx-auto px-6 py-4';
      default:
        return 'max-w-md mx-auto px-4 py-4'; // Keep original desktop layout
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-40">
        <div className={getHeaderClasses()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">F</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                FoodMatch
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLocation(true)}
                className={`flex items-center gap-1 text-xs sm:text-sm transition-colors ${
                  location 
                    ? 'text-gray-600 hover:text-orange-600' 
                    : 'text-orange-600 hover:text-orange-700 font-medium'
                }`}
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{location || 'Set Location'}</span>
                <span className="sm:hidden">{location ? 'Location' : 'Set'}</span>
              </button>
              {activeTab === 'specific' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={getContainerClasses()}>
        {!isInRoom ? (
          /* Welcome Screen */
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                Find food together!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Swipe on restaurants with your dining partner and get matched when you both like the same place.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <Button
                  onClick={() => setShowCreateRoom(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-base sm:text-lg py-4 sm:py-6"
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Room & Share QR
                </Button>
                
                <Button
                  onClick={() => setShowJoinRoom(true)}
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50 text-base sm:text-lg py-4 sm:py-6"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Join Room
                </Button>
                
                {!location && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    💡 Set your location first to get relevant restaurant suggestions
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Room Active */
          <>
            {/* Room Status Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                  <span className="text-gray-700">Room: {roomState.id}</span>
                  {roomState.participants && roomState.participants.find(p => p.id === roomState.hostId) && (
                    <>
                      <span className="text-gray-400 hidden sm:inline">•</span>
                      <span className="font-medium text-gray-900 hidden sm:inline">Host: {roomState.participants.find(p => p.id === roomState.hostId)?.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isHost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQRCode(true)}
                      className="text-orange-600 hover:bg-orange-50"
                    >
                      <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLeaveRoom}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <span className="text-xs sm:text-sm">Leave</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab System */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="specific" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
                  Restaurants
                </TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm">
                  Food Types
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="specific" className="mt-0">
                {filteredRestaurants.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No restaurants found</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      {isInRoom 
                        ? "No restaurants available in your area. Try changing your location."
                        : "Join a room to start swiping on restaurants!"
                      }
                    </p>
                    {isInRoom && (
                      <Button
                        onClick={() => setShowLocation(true)}
                        variant="outline"
                        className="border-orange-200 hover:bg-orange-50"
                      >
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Change Location
                      </Button>
                    )}
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
                  />
                )}
              </TabsContent>
              
              <TabsContent value="general" className="mt-0">
                <GeneralSwipeInterface 
                  foodTypes={foodTypes}
                  roomState={roomState}
                  onSwipe={handleFoodTypeSwipe}
                  checkForMatch={checkForMatch}
                  participantId={participantId}
                  onBringToFront={handleBringFoodTypeToFront}
                  customOrder={foodTypeOrder}
                />
              </TabsContent>
            </Tabs>

            {/* Instructions */}
            <div className="text-center mt-6 sm:mt-8 space-y-2">
              <p className="text-gray-600 text-xs sm:text-sm">
                {activeTab === 'specific' 
                  ? 'Swipe right if you want to eat there, left if you don\'t'
                  : 'Swipe right on food types you\'re craving, left if you don\'t want them'
                }
              </p>
              <p className="text-orange-600 text-xs sm:text-sm font-medium">
                When everyone swipes right, it's a match! 🎉
              </p>
            </div>
          </>
        )}
      </main>

      {/* Loading Overlay */}
      {(isLoadingRestaurants || isLoadingRestaurantsFromHook) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center mx-4">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600">
              {isLoadingRestaurantsFromHook ? 'Creating room and loading restaurants...' : 'Loading restaurants near you...'}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateRoom && (
        <CreateRoomModal
          onCreateRoom={handleCreateRoom}
          onClose={() => setShowCreateRoom(false)}
          isLoading={isCreatingRoom}
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
          onClose={() => setShowMatch(false)}
        />
      )}

      {showLocation && (
        <LocationModal
          currentLocation={location || ''}
          onLocationChange={handleLocationChange}
          onClose={() => setShowLocation(false)}
          isCreatingRoom={!!pendingRoomCreation}
          onLocationSetForRoom={handleLocationSetForRoom}
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
    </div>
  );
};

export default Index;
