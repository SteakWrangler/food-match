import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Utensils, Car, Users, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatForDisplay } from '@/lib/utils';

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
  tags: string[];
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  showButtons?: boolean;
}

// Simple helper to categorize tags based on common patterns
const categorizeTags = (tags: string[]) => {
  const categorized = {
    cuisine: [] as string[],
    service: [] as string[],
    features: [] as string[]
  };

  const seenTags = new Set<string>(); // Track seen tags to prevent duplicates

  tags.forEach(tag => {
    if (seenTags.has(tag)) return; // Skip duplicates
    seenTags.add(tag);
    
    const lowerTag = tag.toLowerCase();
    
    // Service-related tags
    if (lowerTag.includes('takeout') || lowerTag.includes('delivery') || 
        lowerTag.includes('dine-in') || lowerTag.includes('drive-through') ||
        lowerTag.includes('curbside')) {
      categorized.service.push(tag);
    }
    // Feature-related tags
    else if (lowerTag.includes('outdoor') || lowerTag.includes('indoor') ||
             lowerTag.includes('wheelchair') || lowerTag.includes('family') ||
             lowerTag.includes('romantic') || lowerTag.includes('live') ||
             lowerTag.includes('sports') || lowerTag.includes('happy') ||
             lowerTag.includes('trendy') || lowerTag.includes('cozy') ||
             lowerTag.includes('lively') || lowerTag.includes('reservations') ||
             lowerTag.includes('walk-ins') || lowerTag.includes('good for')) {
      categorized.features.push(tag);
    }
    // Everything else is considered cuisine
    else {
      categorized.cuisine.push(tag);
    }
  });

  return categorized;
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSwipe, style, showButtons = true }) => {
  const categorizedTags = categorizeTags(restaurant.tags);
  const mainCuisine = categorizedTags.cuisine[0] || restaurant.cuisine;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">🍽️</text></svg>';
  };
  
  // Force refresh - layout fixes applied
  return (
    <div className="w-[400px] mx-auto flex flex-col">
      <Card 
        className="w-full bg-white shadow-xl rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none h-[600px] w-[400px] flex flex-col border-0"
        style={style}
      >
        {/* Main Image */}
        <div className="relative h-80 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100 flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
              draggable={false}
              onError={handleImageError}
            />
          </div>
          
          {/* Gradient Overlay - Removed to prevent text fading */}
          
          {/* Top Info */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium">
              {formatForDisplay(mainCuisine)}
            </Badge>
            <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-800">{restaurant.rating}</span>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.estimatedTime}</span>
              </div>
              <span className="font-medium">{restaurant.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Description and Tags - Scrollable Area */}
        <div className="flex-1 overflow-y-auto min-h-[120px]">
          <div className="p-6">
            {restaurant.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {restaurant.description}
              </p>
            )}
            
            {/* All Tags */}
            {restaurant.tags.length > 0 ? (
              <div className={restaurant.description ? "mb-3" : "mb-0"}>
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {/* Show cuisine tags first, then other tags */}
                  {categorizedTags.cuisine.slice(0, 3).map((tag, index) => (
                    <Badge key={`cuisine-${index}`} variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                      {formatForDisplay(tag)}
                    </Badge>
                  ))}
                  {categorizedTags.service.slice(0, 2).map((tag, index) => (
                    <Badge key={`service-${index}`} variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      {formatForDisplay(tag)}
                    </Badge>
                  ))}
                  {categorizedTags.features.slice(0, 2).map((tag, index) => (
                    <Badge key={`feature-${index}`} variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                      {formatForDisplay(tag)}
                    </Badge>
                  ))}
                  {restaurant.tags.length > 7 && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      +{restaurant.tags.length - 7} more
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic">
                No tags available
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Swipe Action Buttons - Below the card */}
      {showButtons && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => onSwipe('left')}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">✕</span>
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-300 transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">♥</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;
