import React from 'react';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Clock, Phone, Globe } from 'lucide-react';
import RestaurantImageCarousel from './RestaurantImageCarousel';
import { useDeviceType } from '@/hooks/use-mobile';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  images?: string[];
  rating: number;
  priceRange: string;
  distance: string;
  estimatedTime: string;
  description: string;
  // tags: string[]; // COMMENTED OUT - can be restored later
  // Google Places API fields
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  googleTypes?: string[];
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  showButtons?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSwipe, style, showButtons = true }) => {
  const deviceType = useDeviceType();
  
  // Responsive card sizing
  const getCardClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-full max-w-[320px] h-[500px]';
      case 'tablet':
        return 'w-full max-w-[400px] h-[550px]';
      default:
        return 'w-full max-w-[400px] h-[600px]';
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
    <div className={`${getCardClasses()} mx-auto flex flex-col`}>
      <Card 
        className={`w-full bg-white shadow-xl rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none flex flex-col border-0`}
        style={style}
      >
        {/* Main Image with Carousel Support */}
        <div className="relative">
          {(() => {
            const carouselImages = restaurant.images && restaurant.images.length > 0 
              ? restaurant.images 
              : [restaurant.image];
            
            // Debug logging for image arrays
            console.log(`Restaurant ${restaurant.name}:`, {
              mainImage: restaurant.image,
              imagesArray: restaurant.images,
              carouselImages: carouselImages,
              totalImages: carouselImages.length
            });
            
            return (
              <RestaurantImageCarousel 
                images={carouselImages}
                restaurantName={restaurant.name}
              />
            );
          })()}
          
          {/* Top Info - Only rating */}
          <div className="absolute top-4 right-4 flex justify-end items-start z-10">
            <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-800">{restaurant.rating}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Name and Basic Info */}
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-gray-100">
          <h2 className={`${textClasses.title} font-bold mb-2 text-gray-900`}>{restaurant.name}</h2>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{restaurant.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{restaurant.estimatedTime}</span>
            </div>
            <span className="font-medium">{restaurant.priceRange}</span>
          </div>
        </div>

        {/* Contact Information Section - Always visible */}
        {(restaurant.address || restaurant.phone || restaurant.website) && (
          <div className="px-4 sm:px-6 py-3 border-b border-gray-100">
            <div className="space-y-2">
              {restaurant.address && (
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">{restaurant.address}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">{restaurant.phone}</span>
                </div>
              )}
              {restaurant.website && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs truncate">{restaurant.website}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Details Link - Always visible at bottom */}
        <div className="px-4 sm:px-6 py-2 bg-gray-50">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(restaurant.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm sm:text-base text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            <span>View Details</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </Card>

      {/* Swipe Action Buttons - Below the card */}
      {showButtons && (
        <div className="flex justify-center gap-3 sm:gap-4 mt-4">
          <button
            onClick={() => onSwipe('left')}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors group"
          >
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">✕</span>
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-300 transition-colors group"
          >
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">♥</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;
