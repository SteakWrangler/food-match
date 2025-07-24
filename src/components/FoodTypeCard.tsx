
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDeviceType } from '@/hooks/use-mobile';

interface FoodType {
  id: string;
  name: string;
  image: string;
  description?: string;
}

interface FoodTypeCardProps {
  foodType: FoodType;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  showButtons?: boolean;
}

const FoodTypeCard: React.FC<FoodTypeCardProps> = ({ foodType, onSwipe, style, showButtons = true }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!foodType.image);
  const deviceType = useDeviceType();

  const handleImageError = () => {
    console.log(`Image failed to load for ${foodType.name}: ${foodType.image}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for ${foodType.name}`);
    setImageLoading(false);
  };

  // Responsive card sizing
  const getCardClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-full max-w-[320px] h-[240px]'; // Smaller than RestaurantCard's 280px
      case 'tablet':
        return 'w-full max-w-[400px] h-[300px]'; // Smaller than RestaurantCard's 360px
      default:
        return 'w-full max-w-[400px] h-[380px]'; // Smaller than RestaurantCard's 480px
    }
  };

  const getTextClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          title: 'text-xl',
          body: 'text-xs'
        };
      case 'tablet':
        return {
          title: 'text-2xl',
          body: 'text-sm'
        };
      default:
        return {
          title: 'text-2xl',
          body: 'text-sm'
        };
    }
  };

  const textClasses = getTextClasses();

  return (
    <div className={`${getCardClasses()} mx-auto flex flex-col`}>
      <Card 
        className="w-full bg-white shadow-xl rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none flex flex-col h-full"
        style={style}
      >
        {/* Main Image */}
        <div className="relative h-24 sm:h-28"> {/* Reduced from h-32 sm:h-40 to h-24 sm:h-28 */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          {!imageError && foodType.image ? (
            <img
              src={foodType.image}
              alt={foodType.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
              <div className="text-4xl sm:text-6xl">🍽️</div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 p-2 sm:p-3 flex flex-col"> {/* Reduced from p-3 sm:p-4 to p-2 sm:p-3 */}
          <h2 className={`${textClasses.title} font-bold text-gray-900 mb-2 sm:mb-3`}> {/* Reduced from mb-3 sm:mb-4 to mb-2 sm:mb-3 */}
            {foodType.name}
          </h2>
          
          {foodType.description && (
            <p className={`${textClasses.body} text-gray-600 leading-relaxed flex-1`}>
              {foodType.description}
            </p>
          )}
          
          {!foodType.description && (
            <p className={`${textClasses.body} text-gray-600 leading-relaxed flex-1`}>
              Discover amazing {foodType.name.toLowerCase()} restaurants near you!
            </p>
          )}
        </div>
      </Card>

      {/* Swipe Action Buttons */}
      {showButtons && (
        <div className="flex justify-center gap-3 sm:gap-4 mt-4 touch-auto"> {/* Added touch-auto to allow button interactions */}
          <button
            onClick={() => onSwipe('left')}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors group touch-auto"
            style={{ touchAction: 'manipulation' }} // Ensure buttons are clickable
          >
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">✕</span>
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-300 transition-colors group touch-auto"
            style={{ touchAction: 'manipulation' }} // Ensure buttons are clickable
          >
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">♥</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodTypeCard;
