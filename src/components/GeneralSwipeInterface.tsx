import React, { useState, useRef, useMemo, useEffect } from 'react';
import FoodTypeCard from './FoodTypeCard';
import { FoodType } from '@/data/foodTypes';
import { randomizeFoodTypesByTiers } from '@/utils/foodTypeRandomizer';
import { useDeviceType } from '@/hooks/use-mobile';

interface GeneralSwipeInterfaceProps {
  foodTypes: FoodType[];
  roomState?: any;
  onSwipe?: (foodTypeId: string, direction: 'left' | 'right') => void;
  onMatch?: (restaurant: any) => void;
  checkForMatch?: (foodTypeId: string) => boolean;
  participantId?: string;
  onBringToFront?: (foodTypeId: string) => void;
  customOrder?: string[];
}

const GeneralSwipeInterface: React.FC<GeneralSwipeInterfaceProps> = ({ 
  foodTypes, 
  roomState, 
  onSwipe,
  onMatch,
  checkForMatch,
  participantId,
  onBringToFront,
  customOrder
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const deviceType = useDeviceType();

  // Get user swipes from room state (food type swipes only)
  const userFoodTypeSwipes = roomState?.foodTypeSwipes?.[participantId || ''] || {};
  
  // Debug logging
  console.log('GeneralSwipeInterface - userFoodTypeSwipes:', userFoodTypeSwipes);
  console.log('GeneralSwipeInterface - participantId:', participantId);
  console.log('GeneralSwipeInterface - roomState:', roomState);

  // Monitor room state changes
  useEffect(() => {
    console.log('GeneralSwipeInterface - roomState changed:', roomState);
  }, [roomState]);

  // Reset current index when custom order changes (item brought to front)
  useEffect(() => {
    if (customOrder && customOrder.length > 0) {
      setCurrentIndex(0);
    }
  }, [customOrder]);

  // Randomize food types once when component mounts
  const randomizedFoodTypes = useMemo(() => {
    return randomizeFoodTypesByTiers(foodTypes);
  }, [foodTypes]);

  // Use custom order if available, otherwise use randomized order
  const orderedFoodTypes = useMemo(() => {
    if (customOrder && customOrder.length > 0) {
      // Create a map for quick lookup
      const foodTypeMap = new Map(randomizedFoodTypes.map(f => [f.id, f]));
      const ordered: FoodType[] = [];
      
      // Add items in custom order first
      for (const id of customOrder) {
        const foodType = foodTypeMap.get(id);
        if (foodType) {
          ordered.push(foodType);
        }
      }
      
      // Add any remaining food types that weren't in the custom order
      for (const foodType of randomizedFoodTypes) {
        if (!customOrder.includes(foodType.id)) {
          ordered.push(foodType);
        }
      }
      
      return ordered;
    }
    return randomizedFoodTypes;
  }, [randomizedFoodTypes, customOrder]);

  const currentFoodType = orderedFoodTypes[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentFoodType) return;

    // Call the onSwipe callback if provided (for room mode)
    if (onSwipe) {
      onSwipe(currentFoodType.id, direction);
    }

    // Check for match - let the parent handle match display
    if (direction === 'right' && checkForMatch && checkForMatch(currentFoodType.id)) {
      // Convert food type to restaurant-like object for the match modal
      const mockRestaurant = {
        id: currentFoodType.id,
        name: currentFoodType.name,
        cuisine: currentFoodType.name,
        image: currentFoodType.image,
        rating: 4.5,
        priceRange: '$$',
        distance: 'Food Type Match',
        estimatedTime: 'Ready to explore!',
        description: `You both want ${currentFoodType.name}! Time to find a great place nearby.`,
        tags: ['Match', 'Food Type']
      };
      
      // Call onMatch if provided (for room mode)
      if (onMatch) {
        onMatch(mockRestaurant);
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
    
    const threshold = deviceType === 'mobile' ? 50 : 100;
    
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    
    setDragStart(null);
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
    
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart || !isDragging) return;
    
    // Check if the touch target is a button or button container
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.touch-auto')) {
      // Don't prevent default for buttons - let them handle the touch
      return;
    }
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = (e?: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Check if the touch target is a button or button container
    if (e) {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.touch-auto')) {
        // Don't prevent default for buttons - let them handle the touch
        return;
      }
    }
    
    const threshold = 50;
    
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
    transition: isDragging ? 'none' : (dragOffset.x === 0 && dragOffset.y === 0 ? 'none' : 'all 0.3s ease-out')
  };

  if (orderedFoodTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No food types found!</h2>
        <p className="text-sm sm:text-base text-gray-600">Try adjusting your filters to see more options.</p>
      </div>
    );
  }

  if (currentIndex >= orderedFoodTypes.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          No more food types!
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          You've seen all available food type options.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => setCurrentIndex(0)}
            className="block px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] p-2 sm:p-4 relative w-full">
        {/* Background Cards - Hidden until they become the top card */}
        {orderedFoodTypes.slice(currentIndex + 1, currentIndex + 3).map((foodType, index) => (
          <div
            key={foodType.id}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              zIndex: 5 - index,
              transform: `translate(-50%, -50%) scale(${0.85 - index * 0.05})`,
              opacity: 0, // Set to 0 to hide background cards until they become the top card
              pointerEvents: 'none'
            }}
          >
            <div className="flex flex-col items-center overflow-hidden">
              <FoodTypeCard
                key={`background-${foodType.id}`}
                foodType={foodType}
                onSwipe={() => {}}
                showButtons={false}
              />
              {/* Background buttons (hidden) */}
              <div className="flex justify-center gap-3 sm:gap-4 mt-4 opacity-0 pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14"></div>
                <div className="w-12 h-12 sm:w-14 sm:h-14"></div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Card Container - Centered horizontally */}
        <div className="flex flex-col items-center">
          {/* Swipeable Card Area - Only the card is swipeable */}
          <div
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
            <FoodTypeCard
              key={`current-${currentFoodType.id}`}
              foodType={currentFoodType}
              onSwipe={handleSwipe}
              showButtons={false} // Hide buttons since we'll add them outside
            />
          </div>

          {/* Non-swipeable Button Area - Positioned below card */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-4 touch-auto pointer-events-auto" style={{ touchAction: 'manipulation' }}>
            <button
              onClick={() => handleSwipe('left')}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors group"
            >
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">✕</span>
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-300 transition-colors group"
            >
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">♥</span>
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

export default GeneralSwipeInterface;
