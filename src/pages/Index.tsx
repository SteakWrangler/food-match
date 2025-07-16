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
import { restaurants as fallbackRestaurants } from '@/data/restaurants';
import { foodTypes } from '@/data/foodTypes';
import { FilterState, defaultFilters, filterRestaurants } from '@/utils/restaurantFilters';

const Index = () => {
  const [activeTab, setActiveTab] = useState('specific');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<any>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [shownMatches, setShownMatches] = useState<Set<string>>(new Set());
  const [restaurantOrder, setRestaurantOrder] = useState<string[]>([]);
  const [foodTypeOrder, setFoodTypeOrder] = useState<string[]>([]);
  
  const {
    roomState,
    isHost,
    participantId,
    createRoom,
    joinRoom,
    addSwipe,
    checkForMatch,
    leaveRoom
  } = useRoom();

  const isInRoom = !!roomState;

  // Use room restaurants if in a room, otherwise use static data
  const restaurants = isInRoom 
    ? (roomState?.restaurants || [])
    : fallbackRestaurants;
  const hasMore = false; // Static data doesn't have pagination

  // Filter restaurants based on current filter settings (only when not in a room)
  const filteredRestaurants = useMemo(() => {
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
    if (!location) {
      // Show location modal first
      setShowLocation(true);
      return;
    }
    const roomId = await createRoom(name, location);
    setShowCreateRoom(false);
    setShowQRCode(true);
  };

  const handleJoinRoom = async (roomId: string, name: string) => {
    const success = await joinRoom(roomId, name);
    if (success) {
      setShowJoinRoom(false);
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Reset shown matches for new room
      setShownMatches(new Set());
    }
    return success;
  };

  // Check for matches whenever room state changes (due to syncing)
  useEffect(() => {
    if (roomState && isInRoom) {
      // Check all restaurants that have been swiped on
      const allSwipedRestaurants = new Set<string>();
      Object.values(roomState.swipes).forEach(participantSwipes => {
        Object.keys(participantSwipes).forEach(restaurantId => {
          allSwipedRestaurants.add(restaurantId);
        });
      });

              // Check each swiped item for a match
        allSwipedRestaurants.forEach(itemId => {
          const type = activeTab === 'specific' ? 'restaurant' : 'foodType';
          if (checkForMatch(itemId, type)) {
          let matchedItem;
          if (activeTab === 'specific') {
            // Use room restaurants if available, otherwise fall back to filtered restaurants
            const availableRestaurants = roomState?.restaurants || filteredRestaurants;
            matchedItem = availableRestaurants.find(r => r.id === itemId);
          } else {
            const foodType = foodTypes.find(f => f.id === itemId);
            if (foodType) {
              // Convert food type to restaurant-like object for the match modal
              matchedItem = {
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
            }
          }
          
          if (matchedItem && !showMatch && !shownMatches.has(itemId)) {
            console.log(`🎉 MATCH FOUND for ${matchedItem.name}!`);
            setMatchedRestaurant(matchedItem);
            setShowMatch(true);
            setShownMatches(prev => new Set([...prev, itemId]));
          }
        }
      });
    }
  }, [roomState, isInRoom, activeTab, checkForMatch, showMatch]);

  const handleSwipe = (itemId: string, direction: 'left' | 'right') => {
    addSwipe(itemId, direction);
    
    // Also check for immediate match when current user swipes right
    const type = activeTab === 'specific' ? 'restaurant' : 'foodType';
    if (direction === 'right' && checkForMatch(itemId, type)) {
      let matchedItem;
      if (activeTab === 'specific') {
        // Use room restaurants if available, otherwise fall back to filtered restaurants
        const availableRestaurants = roomState?.restaurants || filteredRestaurants;
        matchedItem = availableRestaurants.find(r => r.id === itemId);
      } else {
        const foodType = foodTypes.find(f => f.id === itemId);
        if (foodType) {
          // Convert food type to restaurant-like object for the match modal
          matchedItem = {
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
        }
      }
      
      if (matchedItem && !showMatch && !shownMatches.has(itemId)) {
        console.log(`🎉 IMMEDIATE MATCH FOUND for ${matchedItem.name}!`);
        setMatchedRestaurant(matchedItem);
        setShowMatch(true);
        setShownMatches(prev => new Set([...prev, itemId]));
      }
    }
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  const host = roomState?.participants.find(p => p.id === roomState.hostId);

  const handleGenerateMore = async () => {
    // No-op for static data
  };

  const handleBringRestaurantToFront = (restaurantId: string) => {
    setRestaurantOrder(prev => {
      const newOrder = prev.filter(id => id !== restaurantId);
      return [restaurantId, ...newOrder];
    });
  };

  const handleBringFoodTypeToFront = (foodTypeId: string) => {
    setFoodTypeOrder(prev => {
      const newOrder = prev.filter(id => id !== foodTypeId);
      return [foodTypeId, ...newOrder];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              FoodMatch
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLocation(true)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                location 
                  ? 'text-gray-600 hover:text-orange-600' 
                  : 'text-orange-600 hover:text-orange-700 font-medium'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{location || 'Set Location'}</span>
            </button>
            {activeTab === 'specific' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="border-orange-200 hover:bg-orange-50"
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {!isInRoom ? (
          /* Welcome Screen */
          <div className="text-center space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-orange-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Find food together!
              </h2>
              <p className="text-gray-600 mb-8">
                Swipe on restaurants with your dining partner and get matched when you both like the same place.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCreateRoom(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-lg py-6"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Create Room & Share QR
                </Button>
                
                <Button
                  onClick={() => setShowJoinRoom(true)}
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50 text-lg py-6"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join Room
                </Button>
                
                {!location && (
                  <p className="text-sm text-gray-500 mt-4">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700">Room: {roomState.id}</span>
                  {host && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-gray-900">Host: {host.name}</span>
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
                      <QrCode className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={leaveRoom}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab System */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="specific" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Restaurants
                </TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Food Types
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="specific" className="mt-0">
                <SwipeInterface
                  restaurants={filteredRestaurants}
                  hasMore={hasMore}
                  onGenerateMore={handleGenerateMore}
                  roomState={roomState}
                  onSwipe={handleSwipe}
                  onMatch={setMatchedRestaurant}
                  checkForMatch={checkForMatch}
                  participantId={participantId}
                  onBringToFront={handleBringRestaurantToFront}
                  customOrder={restaurantOrder}
                />
              </TabsContent>
              
              <TabsContent value="general" className="mt-0">
                <GeneralSwipeInterface 
                  foodTypes={foodTypes}
                  roomState={roomState}
                  onSwipe={handleSwipe}
                  checkForMatch={checkForMatch}
                  participantId={participantId}
                  onBringToFront={handleBringFoodTypeToFront}
                  customOrder={foodTypeOrder}
                />
              </TabsContent>
            </Tabs>

            {/* Instructions */}
            <div className="text-center mt-8 space-y-2">
              <p className="text-gray-600 text-sm">
                {activeTab === 'specific' 
                  ? 'Swipe right if you want to eat there, left if you don\'t'
                  : 'Swipe right on food types you\'re craving, left if you don\'t want them'
                }
              </p>
              <p className="text-orange-600 text-sm font-medium">
                When everyone swipes right, it's a match! 🎉
              </p>
            </div>


          </>
        )}
      </main>

      {/* Modals */}
      {showCreateRoom && (
        <CreateRoomModal
          onCreateRoom={handleCreateRoom}
          onClose={() => setShowCreateRoom(false)}
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
        />
      )}

      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default Index;
