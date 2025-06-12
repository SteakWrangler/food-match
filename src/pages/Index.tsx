
import React, { useState, useEffect } from 'react';
import SwipeInterface from '@/components/SwipeInterface';
import FilterPanel from '@/components/FilterPanel';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import QRCodeModal from '@/components/QRCodeModal';
import MatchModal from '@/components/MatchModal';
import { Button } from '@/components/ui/button';
import { Filter, Users, MapPin, QrCode, UserPlus } from 'lucide-react';
import useRoom from '@/hooks/useRoom';
import { restaurants } from '@/data/restaurants';

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<any>(null);
  
  const {
    roomState,
    isHost,
    createRoom,
    joinRoom,
    addSwipe,
    checkForMatch,
    leaveRoom
  } = useRoom();

  // Check for room parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId && !roomState) {
      setShowJoinRoom(true);
    }
  }, [roomState]);

  const handleCreateRoom = (name: string) => {
    const roomId = createRoom(name);
    setShowCreateRoom(false);
    setShowQRCode(true);
  };

  const handleJoinRoom = (roomId: string, name: string) => {
    const success = joinRoom(roomId, name);
    if (success) {
      setShowJoinRoom(false);
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return success;
  };

  const handleSwipe = (restaurantId: string, direction: 'left' | 'right') => {
    addSwipe(restaurantId, direction);
    
    if (direction === 'right' && checkForMatch(restaurantId)) {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        setMatchedRestaurant(restaurant);
        setShowMatch(true);
      }
    }
  };

  const isInRoom = !!roomState;
  const roomPartner = roomState?.participants.find(p => p.id !== roomState.hostId);

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
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>San Francisco</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="border-orange-200 hover:bg-orange-50"
            >
              <Filter className="w-4 h-4" />
            </Button>
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
                  {roomPartner && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-gray-900">With {roomPartner.name}</span>
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

            {/* Swipe Interface */}
            <SwipeInterface 
              roomState={roomState}
              onSwipe={handleSwipe}
            />

            {/* Instructions */}
            <div className="text-center mt-8 space-y-2">
              <p className="text-gray-600 text-sm">
                Swipe right if you want to eat there, left if you don't
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
        />
      )}

      {showMatch && matchedRestaurant && (
        <MatchModal
          restaurant={matchedRestaurant}
          onClose={() => setShowMatch(false)}
        />
      )}

      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
};

export default Index;
