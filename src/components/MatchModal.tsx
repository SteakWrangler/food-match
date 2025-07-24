
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star, ExternalLink } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  priceRange: string;
  vicinity?: string;
  openingHours?: string[];
  // Optional properties that might not be available from API
  cuisine?: string;
  distance?: string;
  estimatedTime?: string;
  description?: string;
  tags?: string[];
}

interface MatchModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ restaurant, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-6xl mb-2">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">It's a Match!</h2>
          <p className="text-pink-100 text-sm sm:text-base">You both want to try this place</p>
        </div>

        {/* Restaurant Info */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{restaurant.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{restaurant.cuisine || 'Restaurant'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium">{restaurant.rating}</span>
                <span className="text-gray-400">•</span>
                <span className="text-xs sm:text-sm text-gray-600">{restaurant.priceRange}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{restaurant.distance || restaurant.vicinity || 'Location available'}</span>
            </div>
            {restaurant.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{restaurant.estimatedTime}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="flex-1 text-sm sm:text-base"
              onClick={onClose}
            >
              Keep Swiping
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-sm sm:text-base"
              onClick={() => {
                // In a real app, this would open maps or make a reservation
                window.open(`https://maps.google.com?q=${encodeURIComponent(restaurant.name)}`, '_blank');
              }}
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Let's Go!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MatchModal;
