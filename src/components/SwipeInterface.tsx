import React, { useState, useRef, useMemo, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import MatchModal from './MatchModal';
import EnhancedSwipeHistory from './EnhancedSwipeHistory';
import { Restaurant } from '@/data/restaurants';

interface SwipeInterfaceProps {
  restaurants: Restaurant[];
  hasMore?: boolean;
  onGenerateMore?: () => void;
  roomState?: any;
  onSwipe?: (restaurantId: string, direction: 'left' | 'right') => void;
  onMatch?: (restaurant: any) => void;
  checkForMatch?: (restaurantId: string) => boolean;
  participantId?: string;
  onBringToFront?: (restaurantId: string) => void;
  customOrder?: string[];
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ 
  restaurants, 
  hasMore = false,
  onGenerateMore,
  roomState, 
  onSwipe, 
  onMatch,
  checkForMatch,
  participantId,
  onBringToFront,
  customOrder
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [matchedRestaurant, setMatchedRestaurant] = useState<any>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [userSwipes, setUserSwipes] = useState<Record<string, 'left' | 'right'>>({});
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset current index when custom order changes (item brought to front)
  useEffect(() => {
    if (customOrder && customOrder.length > 0) {
      setCurrentIndex(0);
    }
  }, [customOrder]);

  // Use custom order if available, otherwise use original order
  const orderedRestaurants = useMemo(() => {
    if (customOrder && customOrder.length > 0) {
      // Create a map for quick lookup
      const restaurantMap = new Map(restaurants.map(r => [r.id, r]));
      const ordered: Restaurant[] = [];
      
      // Add items in custom order first
      for (const id of customOrder) {
        const restaurant = restaurantMap.get(id);
        if (restaurant) {
          ordered.push(restaurant);
        }
      }
      
      // Add any remaining restaurants that weren't in the custom order
      for (const restaurant of restaurants) {
        if (!customOrder.includes(restaurant.id)) {
          ordered.push(restaurant);
        }
      }
      
      return ordered;
    }
    return restaurants;
  }, [restaurants, customOrder]);

  const currentRestaurant = orderedRestaurants[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentRestaurant) return;

    // Track user's swipe
    setUserSwipes(prev => ({
      ...prev,
      [currentRestaurant.id]: direction
    }));

    // Call the onSwipe callback if provided (for room mode)
    if (onSwipe) {
      onSwipe(currentRestaurant.id, direction);
    }

    // Check for match using the real room data
    if (direction === 'right' && checkForMatch && checkForMatch(currentRestaurant.id)) {
      setMatchedRestaurant(currentRestaurant);
      setShowMatch(true);
      if (onMatch) {
        onMatch(currentRestaurant);
      }
    }

    // Move to next restaurant after a short delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    
    setDragStart(null);
    setIsDragging(false);
  };

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    opacity: Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300),
    transition: isDragging ? 'none' : 'all 0.3s ease-out'
  };

  if (orderedRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No restaurants found!</h2>
        <p className="text-gray-600">Try adjusting your filters to see more options.</p>
      </div>
    );
  }

  if (currentIndex >= orderedRestaurants.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No more restaurants!</h2>
        <p className="text-gray-600 mb-4">You've seen all available options matching your filters.</p>
        <div className="space-y-3">
          {hasMore && onGenerateMore && (
            <button 
              onClick={onGenerateMore}
              className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              Generate More Options
            </button>
          )}
          <button 
            onClick={() => setShowHistory(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            View Your Likes
          </button>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="block px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* History Button */}
      <div className="absolute top-0 right-0 z-50">
        <button
          onClick={() => setShowHistory(true)}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow-sm hover:bg-white transition-colors"
        >
          <span className="text-sm">❤️ {Object.values(userSwipes).filter(s => s === 'right').length}</span>
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[600px] p-4">
        {/* Background Cards */}
        {orderedRestaurants.slice(currentIndex + 1, currentIndex + 3).map((restaurant, index) => (
          <div
            key={restaurant.id}
            className="absolute"
            style={{
              zIndex: 10 - index,
              transform: `scale(${0.95 - index * 0.02}) translateY(${index * 8}px)`,
              opacity: 0.8 - index * 0.2
            }}
          >
            <RestaurantCard
              restaurant={restaurant}
              onSwipe={() => {}}
            />
          </div>
        ))}

        {/* Current Card */}
        <div
          ref={cardRef}
          className="relative z-20"
          style={cardStyle}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <RestaurantCard
            restaurant={currentRestaurant}
            onSwipe={handleSwipe}
          />
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <>
            {dragOffset.x > 50 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-green-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold rotate-12 opacity-80">
                LIKE!
              </div>
            )}
            {dragOffset.x < -50 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-red-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold -rotate-12 opacity-80">
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
