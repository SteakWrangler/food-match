import React, { useState, useRef, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import MatchModal from './MatchModal';
import EnhancedSwipeHistory from './EnhancedSwipeHistory';
import { useDeviceType } from '@/hooks/use-mobile';
import { Restaurant } from '@/data/restaurants';

interface SwipeInterfaceProps {
  restaurants: Restaurant[];
  roomState?: any;
  onSwipe?: (restaurantId: string, direction: 'left' | 'right') => void;
  onMatch?: (restaurant: any) => void;
  checkForMatch?: (restaurantId: string) => boolean;
  participantId?: string;
  onBringToFront?: (restaurantId: string) => void;
  customOrder?: string[];
  onGenerateMore?: () => Promise<boolean>;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ 
  restaurants, 
  roomState, 
  onSwipe, 
  onMatch,
  checkForMatch,
  participantId,
  onBringToFront,
  customOrder,
  onGenerateMore
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceType = useDeviceType();

  // Get user swipes from room state (restaurant swipes only)
  const userSwipes = roomState?.restaurantSwipes?.[participantId || ''] || {};
  
  // Debug logging
  console.log('SwipeInterface - userSwipes:', userSwipes);
  console.log('SwipeInterface - participantId:', participantId);
  console.log('SwipeInterface - roomState:', roomState);

  // Monitor room state changes
  useEffect(() => {
    console.log('SwipeInterface - roomState changed:', roomState);
  }, [roomState]);

  // Order restaurants based on custom order or default
  const orderedRestaurants = React.useMemo(() => {
    if (!customOrder || customOrder.length === 0) {
      return restaurants;
    }
    
    const ordered: Restaurant[] = [];
    const unordered: Restaurant[] = [];
    
    // Add restaurants in custom order first
    customOrder.forEach(id => {
      const restaurant = restaurants.find(r => r.id === id);
      if (restaurant) {
        ordered.push(restaurant);
      }
    });
    
    // Add remaining restaurants
    restaurants.forEach(restaurant => {
      if (!customOrder.includes(restaurant.id)) {
        unordered.push(restaurant);
      }
    });
    
    return [...ordered, ...unordered];
  }, [restaurants, customOrder]);

  const currentRestaurant = orderedRestaurants[currentIndex];

  // Handle swipe
  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentRestaurant) return;
    
    // Call the parent's onSwipe function
    if (onSwipe) {
      onSwipe(currentRestaurant.id, direction);
    }
    
    // Check for match
    if (direction === 'right' && checkForMatch && checkForMatch(currentRestaurant.id)) {
      setMatchedRestaurant(currentRestaurant);
      setShowMatch(true);
      if (onMatch) {
        onMatch(currentRestaurant);
      }
    }
    
    // Animate the card off-screen in the swipe direction
    const screenWidth = window.innerWidth;
    const finalOffset = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
    
    // Set the final position to animate the card off-screen
    setDragOffset({ x: finalOffset, y: dragOffset.y });
    
    // Wait for the animation to complete, then move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }, 300); // Match the transition duration
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = deviceType === 'mobile' ? 50 : 100;
    
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    } else {
      // Reset position if not enough drag
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    } else {
      // Reset position if not enough drag
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  // Load more restaurants when running low - with better debouncing to prevent multiple calls
  useEffect(() => {
    if (onGenerateMore && currentIndex >= orderedRestaurants.length - 8 && !isLoading) {
      // Add a longer delay to prevent multiple rapid calls
      const timeoutId = setTimeout(() => {
        setIsLoading(true);
        onGenerateMore().finally(() => setIsLoading(false));
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, orderedRestaurants.length, onGenerateMore, isLoading]);

  // Card style with drag transform
  const cardStyle: React.CSSProperties = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    transition: isDragging ? 'none' : (dragOffset.x === 0 && dragOffset.y === 0 ? 'none' : 'transform 0.3s ease-out'),
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // No restaurants to show
  if (!currentRestaurant) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No more restaurants</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          You've seen all the restaurants in your area.
        </p>
        {onGenerateMore && (
          <button
            onClick={() => {
              setIsLoading(true);
              onGenerateMore().finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Single loading indicator for loading more restaurants */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-50 bg-white/95 backdrop-blur-sm border border-orange-200 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-700 font-medium">Loading more restaurants...</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center min-h-[600px] sm:min-h-[700px] p-2 sm:p-4 relative w-full">
        {/* Background Cards - Hidden until they become the top card */}
        {orderedRestaurants.slice(currentIndex + 1, currentIndex + 3).map((restaurant, index) => (
          <div
            key={restaurant.id}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              zIndex: 5 - index,
              transform: `translate(-50%, -50%) scale(${0.85 - index * 0.05})`,
              opacity: 0, // Set to 0 to hide background cards until they become the top card
              pointerEvents: 'none' // Prevent interaction with background cards
            }}
          >
            <RestaurantCard
              key={`background-${restaurant.id}`}
              restaurant={restaurant}
              onSwipe={() => {}}
              showButtons={false}
            />
          </div>
        ))}
        
        {/* Current Card */}
        <div
          ref={cardRef}
          className="relative z-10"
          style={cardStyle}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* History Button - positioned relative to the card */}
          <div className="absolute -top-2 -left-2 z-50">
            <button
              onClick={() => setShowHistory(true)}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow-sm hover:bg-white transition-colors"
            >
              <span className="text-xs sm:text-sm">❤️ {Object.values(userSwipes).filter(s => s === 'right').length}</span>
            </button>
          </div>
          
          <RestaurantCard
            key={`current-${currentRestaurant.id}`}
            restaurant={currentRestaurant}
            onSwipe={handleSwipe}
          />
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <>
            {dragOffset.x > 50 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-green-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-lg sm:text-2xl font-bold rotate-12 opacity-80">
                LIKE!
              </div>
            )}
            {dragOffset.x < -50 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-lg sm:text-2xl font-bold -rotate-12 opacity-80">
                NOPE!
              </div>
            )}
          </>
        )}
      </div>

      {/* Match Modal */}
      {showMatch && matchedRestaurant && (
        <MatchModal
          restaurant={matchedRestaurant}
          onClose={() => setShowMatch(false)}
        />
      )}

      {/* History Modal */}
      <EnhancedSwipeHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        userSwipes={userSwipes}
        roomState={roomState}
        items={orderedRestaurants}
        type="restaurants"
        participantId={participantId || 'user'}
        onBringToFront={onBringToFront}
      />
    </div>
  );
};

export default SwipeInterface;
