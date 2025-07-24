import React, { useState, useRef, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
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
  onTakeSecondLook?: () => void;
  hasReachedEndFromHook?: boolean;
  isLoadingMoreRestaurants?: boolean;
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
  onGenerateMore,
  onTakeSecondLook,
  hasReachedEndFromHook,
  isLoadingMoreRestaurants
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [viewedRestaurants, setViewedRestaurants] = useState<Set<string>>(new Set());
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isSecondLookMode, setIsSecondLookMode] = useState(false);
  const [isButtonTouch, setIsButtonTouch] = useState(false); // Track if touch started on button
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

  // Reset hasReachedEnd when new restaurants are added
  useEffect(() => {
    if (restaurants.length > 0) {
      setHasReachedEnd(false);
    }
  }, [restaurants.length]);

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

  // Get unviewed restaurants (restaurants not in viewedRestaurants)
  const getUnviewedRestaurants = (restaurants: Restaurant[], viewedIds: Set<string>) => {
    return restaurants.filter(r => !viewedIds.has(r.id));
  };

  // Get restaurants that haven't been liked yet (for second look mode)
  const getUnlikedRestaurants = (restaurants: Restaurant[]) => {
    if (!roomState || !participantId) return restaurants;
    
    const userSwipes = roomState.restaurantSwipes?.[participantId] || {};
    const unliked = restaurants.filter(restaurant => {
      const swipe = userSwipes[restaurant.id];
      return swipe !== 'right'; // Return restaurants that weren't swiped right (liked)
    });
    
    return unliked;
  };

  // Get current restaurant based on first unviewed
  const currentRestaurant = React.useMemo(() => {
    if (isSecondLookMode) {
      // In second look mode, show restaurants that haven't been liked yet
      const unlikedRestaurants = getUnlikedRestaurants(orderedRestaurants);
      return unlikedRestaurants[0] || null;
    } else {
      // Normal mode - show unviewed restaurants
      const unviewedRestaurants = getUnviewedRestaurants(orderedRestaurants, viewedRestaurants);
      return unviewedRestaurants[0] || null;
    }
  }, [orderedRestaurants, viewedRestaurants, isSecondLookMode, roomState, participantId]);

  // Get remaining unviewed count
  const remainingUnviewed = React.useMemo(() => {
    if (isSecondLookMode) {
      const unlikedRestaurants = getUnlikedRestaurants(orderedRestaurants);
      return unlikedRestaurants.length;
    } else {
      return getUnviewedRestaurants(orderedRestaurants, viewedRestaurants).length;
    }
  }, [orderedRestaurants, viewedRestaurants, isSecondLookMode, roomState, participantId]);

  // Handle entering second look mode
  const handleTakeSecondLook = () => {
    setIsSecondLookMode(true);
    setViewedRestaurants(new Set()); // Reset viewed restaurants for second look
    setHasReachedEnd(false); // Reset end state
    if (onTakeSecondLook) {
      onTakeSecondLook();
    }
  };

  // Handle swipe
  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentRestaurant) return;
    
    // Add current restaurant to viewed set
    setViewedRestaurants(prev => new Set([...prev, currentRestaurant.id]));
    
    // Call the parent's onSwipe function
    if (onSwipe) {
      onSwipe(currentRestaurant.id, direction);
    }
    
    // Check for match - let the parent handle match display
    if (direction === 'right' && checkForMatch && checkForMatch(currentRestaurant.id)) {
      if (onMatch) {
        onMatch(currentRestaurant);
      }
    }
    
    // Animate the card off-screen in the swipe direction
    const screenWidth = window.innerWidth;
    const finalOffset = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
    
    // Set the final position to animate the card off-screen
    setDragOffset({ x: finalOffset, y: dragOffset.y });
    
    // Wait for the animation to complete
    setTimeout(() => {
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
    // Check if the touch target is a button or button container
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.touch-auto')) {
      // Don't prevent default for buttons - let them handle the touch
      return;
    }
    
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation(); // Stop event propagation
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Check if the touch target is a button or button container
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.touch-auto')) {
      // Don't prevent default for buttons - let them handle the touch
      return;
    }
    
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation(); // Stop event propagation
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Check if the touch target is a button or button container
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.touch-auto')) {
      // Don't prevent default for buttons - let them handle the touch
      return;
    }
    
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation(); // Stop event propagation
    
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

  // Handle bringing restaurant to front from history
  useEffect(() => {
    if (customOrder && customOrder.length > 0) {
      // Remove the first restaurant in custom order from viewed set
      // so it can be shown again
      const restaurantToShow = customOrder[0];
      if (restaurantToShow) {
        setViewedRestaurants(prev => {
          const newSet = new Set(prev);
          newSet.delete(restaurantToShow);
          return newSet;
        });
      }
    }
  }, [customOrder]);

  // Prevent body scrolling when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.classList.add('swipe-interface-active');
    } else {
      document.body.classList.remove('swipe-interface-active');
    }

    return () => {
      document.body.classList.remove('swipe-interface-active');
    };
  }, [isDragging]);

  // Enhanced smart loading triggers with better state management
  useEffect(() => {
    // Only trigger if we have the onGenerateMore function and we're running very low on restaurants
    // and we haven't reached the end of available restaurants
    if (onGenerateMore && remainingUnviewed <= 5 && remainingUnviewed > 0 && !hasReachedEnd && !isLoading) {
      console.log(`🔄 Smart loading trigger: ${remainingUnviewed} restaurants remaining`);
      
      // Add a delay to prevent multiple rapid calls
      const timeoutId = setTimeout(() => {
        if (!isLoading) {
          console.log('🚀 Triggering smart loading of more restaurants...');
          // Don't set isLoading to true - keep it invisible to user
          onGenerateMore().then((success) => {
            // If loading failed or returned false, we've reached the end
            if (!success) {
              setHasReachedEnd(true);
              console.log('🏁 Reached end of available restaurants');
            }
          }).catch((error) => {
            console.error('❌ Smart loading failed:', error);
            setHasReachedEnd(true);
          });
        } else {
          console.log('⚠️ Already loading, skipping duplicate request');
        }
      }, 1000); // Longer delay to prevent rapid triggering
      
      return () => clearTimeout(timeoutId);
    }
  }, [remainingUnviewed, onGenerateMore, isLoading, hasReachedEnd]);

  // Card style with drag transform
  const cardStyle: React.CSSProperties = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    transition: isDragging ? 'none' : (dragOffset.x === 0 && dragOffset.y === 0 ? 'none' : 'transform 0.3s ease-out'),
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // No restaurants to show
  if (!currentRestaurant) {
    // If we're loading more restaurants, show loading screen
    if (isLoadingMoreRestaurants) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Loading more restaurants...</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Finding more great places for you to discover.
          </p>
        </div>
      );
    }

    // No more restaurants - show the end screen
    return (
      <div className="text-center py-12">
        <div className="text-4xl sm:text-6xl mb-4">🍽️</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No more restaurants</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {isSecondLookMode 
            ? "You've seen all the restaurants again. Try changing your location or filters to find more options."
            : "You've seen all the restaurants in your area. Try changing your location or filters to find more options."
          }
        </p>
        
        {/* Show "Take a second look" if not in second look mode and there are unliked restaurants */}
        {!isSecondLookMode && onTakeSecondLook && getUnlikedRestaurants(orderedRestaurants).length > 0 && (
          <button
            onClick={handleTakeSecondLook}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium mb-3"
          >
            Take a second look ({getUnlikedRestaurants(orderedRestaurants).length} restaurants)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative"> {/* Removed touch-none from main container */}
      {/* Background extension to hide container bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-900 pointer-events-none"></div>
      
      <div className="flex flex-col items-center justify-start pt-8 min-h-[280px] sm:min-h-[320px] md:min-h-[400px] p-1 sm:p-2 md:p-4 relative w-full pb-8"> {/* Changed to justify-start to reduce empty space */}
        
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
            <div className="flex flex-col items-center overflow-hidden">
              <RestaurantCard
                key={`background-${restaurant.id}`}
                restaurant={restaurant}
                onSwipe={() => {}}
                showButtons={false}
              />
              {/* Background buttons (hidden) */}
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-4 opacity-0 pointer-events-none">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"></div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"></div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Card Container - Centered horizontally */}
        <div className="flex flex-col items-center">
          {/* Swipeable Card Area - Only the card is swipeable */}
          <div
            ref={cardRef}
            className="relative z-10 touch-none select-none swipe-card"
            style={cardStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <RestaurantCard
              key={`current-${currentRestaurant.id}`}
              restaurant={currentRestaurant}
              onSwipe={handleSwipe}
              roomLocation={roomState?.location}
              showButtons={false} // Hide buttons since we'll add them outside
            />
          </div>

          {/* Non-swipeable Button Area - Positioned below card */}
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-2 touch-auto pointer-events-auto" style={{ touchAction: 'manipulation' }}>
            <button
              onClick={() => handleSwipe('left')}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors group"
            >
              <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform">✕</span>
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-300 transition-colors group"
            >
              <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform">♥</span>
            </button>
          </div>
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

    </div>
  );
};

export default SwipeInterface;
