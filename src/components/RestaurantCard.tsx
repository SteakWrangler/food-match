import React from 'react';
import { Card } from '@/components/ui/card';
import { Star, MapPin, ExternalLink } from 'lucide-react';

import { useDeviceType } from '@/hooks/use-mobile';
import FavoriteButton from './FavoriteButton';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  priceRange: string;
  vicinity?: string;
  openingHours?: string[];
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  showButtons?: boolean;
  roomLocation?: string; // Add room location for Google Maps search
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSwipe, style, showButtons = true, roomLocation }) => {
  const deviceType = useDeviceType();
  
  // Responsive card sizing with fixed width to prevent shrinking
  const getCardClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-full max-w-[320px] min-w-[320px] h-[280px]'; // Further reduced from 320px to 280px
      case 'tablet':
        return 'w-full max-w-[400px] min-w-[400px] h-[360px]'; // Further reduced from 400px to 360px
      default:
        return 'w-full max-w-[400px] min-w-[400px] h-[480px]';
    }
  };

  const getTextClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          title: 'text-xl',
          subtitle: 'text-xs',
          body: 'text-xs'
        };
      case 'tablet':
        return {
          title: 'text-2xl',
          subtitle: 'text-sm',
          body: 'text-sm'
        };
      default:
        return {
          title: 'text-2xl',
          subtitle: 'text-sm',
          body: 'text-sm'
        };
    }
  };

  const textClasses = getTextClasses();
  
  return (
    <div className={`${getCardClasses()} mx-auto flex flex-col w-full`}>
      {/* Swipeable Card Content */}
      <Card 
        className={`w-full bg-white shadow-xl rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none flex flex-col border-0 min-w-full h-full`}
        style={style}
      >
        {/* Single Image with fixed aspect ratio */}
        <div className="relative w-full h-28 sm:h-32 md:h-44 flex-shrink-0"> {/* Further reduced height for mobile */}
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          
          {/* Favorites Button - Overlay on top right */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton 
              restaurant={restaurant}
              size="sm"
              className="shadow-lg"
            />
          </div>
        </div>

        {/* Restaurant Name and Basic Info */}
        <div className="px-2 sm:px-4 md:px-6 pt-1 pb-1 flex-1 flex flex-col"> {/* Further reduced padding */}
          <h2 className={`${textClasses.title} font-bold mb-1 text-gray-900 line-clamp-2`}>{restaurant.name}</h2>
          
          {/* Rating and Price - Clean horizontal layout */}
          <div className="flex items-center justify-between mb-1"> {/* Reduced margin */}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">{restaurant.rating}</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">{restaurant.priceRange}</span>
          </div>
          
          {/* Location - Clean single line */}
          {restaurant.vicinity && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{restaurant.vicinity}</span>
            </div>
          )}
        </div>

        
        {/* Details Link - Always visible at bottom */}
        <div className="px-2 sm:px-4 md:px-6 py-1 bg-gray-50 flex items-center justify-center flex-shrink-0 touch-auto pointer-events-auto"> {/* Further reduced padding */}
          <a
            href={roomLocation 
              ? `https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}/@${encodeURIComponent(roomLocation)}`
              : `https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-orange-600 hover:text-orange-700 font-medium transition-colors touch-auto"
            style={{ touchAction: 'manipulation' }}
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </Card>

      {/* Non-swipeable Button Area */}
      {showButtons && (
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-4 touch-auto pointer-events-auto" style={{ touchAction: 'manipulation' }}>
          <button
            onClick={() => onSwipe('left')}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors group"
          >
            <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform">✕</span>
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-300 transition-colors group"
          >
            <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform">♥</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;
