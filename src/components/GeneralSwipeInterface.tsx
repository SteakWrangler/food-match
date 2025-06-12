
import React, { useState, useRef } from 'react';
import FoodTypeCard from './FoodTypeCard';
import MatchModal from './MatchModal';
import { FoodType } from '@/data/foodTypes';

interface GeneralSwipeInterfaceProps {
  foodTypes: FoodType[];
  roomState?: any;
  onSwipe?: (foodTypeId: string, direction: 'left' | 'right') => void;
  checkForMatch?: (foodTypeId: string) => boolean;
}

const GeneralSwipeInterface: React.FC<GeneralSwipeInterfaceProps> = ({ 
  foodTypes, 
  roomState, 
  onSwipe,
  checkForMatch
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedFoodType, setMatchedFoodType] = useState<any>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const currentFoodType = foodTypes[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentFoodType) return;

    // Call the onSwipe callback if provided (for room mode)
    if (onSwipe) {
      onSwipe(currentFoodType.id, direction);
    }

    // Check for match using the real room data
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
      setMatchedFoodType(mockRestaurant);
      setShowMatch(true);
    }

    // Move to next food type after a short delay
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

  if (foodTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No food types available!</h2>
      </div>
    );
  }

  if (currentIndex >= foodTypes.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No more food types!</h2>
        <p className="text-gray-600">You've seen all available food options.</p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-[600px] p-4">
      {/* Background Cards */}
      {foodTypes.slice(currentIndex + 1, currentIndex + 3).map((foodType, index) => (
        <div
          key={foodType.id}
          className="absolute"
          style={{
            zIndex: 10 - index,
            transform: `scale(${0.95 - index * 0.02}) translateY(${index * 8}px)`,
            opacity: 0.8 - index * 0.2
          }}
        >
          <FoodTypeCard
            foodType={foodType}
            onSwipe={() => {}}
          />
        </div>
      ))}

      {/* Current Card */}
      <div
        className="relative z-20"
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <FoodTypeCard
          foodType={currentFoodType}
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

      {/* Match Modal */}
      {showMatch && matchedFoodType && (
        <MatchModal
          restaurant={matchedFoodType}
          onClose={() => setShowMatch(false)}
        />
      )}
    </div>
  );
};

export default GeneralSwipeInterface;
