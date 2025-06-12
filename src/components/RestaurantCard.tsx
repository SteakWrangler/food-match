import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  image: string;
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
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSwipe, style }) => {
  // Take the first tag as the main cuisine for the top badge
  const mainCuisine = restaurant.tags[0] || restaurant.cuisine;
  
  return (
    <Card 
      className="w-full max-w-sm mx-auto bg-white shadow-xl rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
      style={style}
    >
      {/* Main Image */}
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
            draggable={false}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">🍽️</text></svg>';
            }}
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {mainCuisine}
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

      {/* Description */}
      <div className="p-6 pb-20">
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {restaurant.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {restaurant.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Swipe Action Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
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
    </Card>
  );
};

export default RestaurantCard;
