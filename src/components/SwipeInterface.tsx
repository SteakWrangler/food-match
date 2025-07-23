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
  const [showMatch, setShowMatch] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false); // Add state for loading spinner
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

  // Get unviewed restaurants (restaurants not in viewedRestaurantIds)
  const getUnviewedRestaurants = (restaurants: Restaurant[], viewedIds: string[]) => {
    return restaurants.filter(r => !viewedIds.includes(r.id));
  };

  // Get current restaurant based on currentRestaurantId or first unviewed
  const currentRestaurant = React.useMemo(() => {
    const viewedIds = roomState?.viewedRestaurantIds || [];
    const unviewedRestaurants = getUnviewedRestaurants(orderedRestaurants, viewedIds);
    
    // If we have a currentRestaurantId, find that restaurant
    if (roomState?.currentRestaurantId) {
      const current = orderedRestaurants.find(r => r.id === roomState.currentRestaurantId);
      if (current && !viewedIds.includes(current.id)) {
        return current;
      }
    }
    
    // Otherwise, return the first unviewed restaurant
    return unviewedRestaurants[0] || null;
  }, [orderedRestaurants, roomState?.currentRestaurantId, roomState?.viewedRestaurantIds]);

  // Get remaining unviewed count
  const remainingUnviewed = React.useMemo(() => {
    const viewedIds = roomState?.viewedRestaurantIds || [];
    return getUnviewedRestaurants(orderedRestaurants, viewedIds).length;
  }, [orderedRestaurants, roomState?.viewedRestaurantIds]);

  // Calculate delay based on remaining restaurants and loading state
  const calculateDelay = (remainingRestaurants: number, isLoading: boolean) => {
    if (!isLoading) return 0;
    
    if (remainingRestaurants <= 3) return 1500; // 1.5s
    if (remainingRestaurants <= 5) return 1000; // 1s  
    if (remainingRestaurants <= 8) return 500;  // 0.5s
    
    return 0; // No delay
  };

  // Handle swipe
  const handleSwipe = async (direction: 'left' | 'right') => {
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
    
    // Wait for the animation to complete, then check for intelligent delay
    setTimeout(async () => {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      
      // Check if we need to show loading spinner (intelligent delay system)
      const delay = calculateDelay(remainingUnviewed - 1, isLoading); // -1 because we're about to move to next card
      if (delay > 0) {
        console.log(`🔄 Intelligent delay: ${delay}ms delay to buy time for background loading`);
        setShowLoadingSpinner(true);
        
        // Ensure the card is hidden during the delay
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to ensure opacity change takes effect
        
        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setShowLoadingSpinner(false);
      }
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

  // Enhanced smart loading triggers with better state management
  useEffect(() => {
    // Only trigger if we have the onGenerateMore function and we're running low on restaurants
    if (onGenerateMore && remainingUnviewed <= 8) {
      console.log(`🔄 Smart loading trigger: ${remainingUnviewed} restaurants remaining`);
      
      // Add a delay to prevent multiple rapid calls
      const timeoutId = setTimeout(() => {
        if (!isLoading) {
          console.log('🚀 Triggering smart loading of more restaurants...');
          setIsLoading(true);
          onGenerateMore().finally(() => {
            setIsLoading(false);
            console.log('✅ Smart loading completed');
          });
        } else {
          console.log('⚠️ Already loading, skipping duplicate request');
        }
      }, 500); // Slightly longer delay for better debouncing
      
      return () => clearTimeout(timeoutId);
    }
  }, [remainingUnviewed, onGenerateMore, isLoading]);

  // Log intelligent delay system status
  useEffect(() => {
    if (isLoading && remainingUnviewed <= 8) {
      const delay = calculateDelay(remainingUnviewed, isLoading);
      if (delay > 0) {
        console.log(`🔄 Intelligent delay system active: ${remainingUnviewed} restaurants remaining, ${delay}ms delay`);
      }
    }
  }, [remainingUnviewed, isLoading]);

  // Card style with drag transform
  const cardStyle: React.CSSProperties = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    transition: isDragging ? 'none' : (dragOffset.x === 0 && dragOffset.y === 0 ? 'none' : 'transform 0.3s ease-out'),
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // No restaurants to show
  if (!currentRestaurant) {
    // Check if we're loading more restaurants in the background
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Loading more restaurants...</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Finding more great places for you to discover.
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }
    
    // No more restaurants and not loading
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No more restaurants</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          You've seen all the restaurants in your area. Try changing your location or filters to find more options.
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
            {isLoading ? 'Loading...' : 'Try Loading More'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* REMOVED: Background loading indicator - should be completely invisible to user */}
      
      <div className="flex items-center justify-center min-h-[600px] sm:min-h-[700px] p-2 sm:p-4 relative w-full">
        {/* Loading Spinner Between Cards (Intelligent Delay System) */}
        {showLoadingSpinner && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white/95 backdrop-blur-sm border border-orange-200 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading more restaurants...</h3>
                  <p className="text-sm text-gray-600">Finding great places for you</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Background Cards - Hidden until they become the top card */}
        {orderedRestaurants.slice(orderedRestaurants.indexOf(currentRestaurant) + 1, orderedRestaurants.indexOf(currentRestaurant) + 3).map((restaurant, index) => (
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
        
        {/* Current Card - Hide during fake delay */}
        <div
          ref={cardRef}
          className="relative z-10"
          style={{
            ...cardStyle,
            opacity: showLoadingSpinner ? 0 : 1, // Hide card during fake delay
            transition: showLoadingSpinner 
              ? 'opacity 0.1s ease-out' // Faster transition when hiding
              : cardStyle.transition
          }}
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
