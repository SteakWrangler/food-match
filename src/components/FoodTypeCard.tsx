
import React from 'react';
import { Card } from '@/components/ui/card';

interface FoodType {
  id: string;
  name: string;
  description: string;
  image: string;
  emoji: string;
}

interface FoodTypeCardProps {
  foodType: FoodType;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
}

const FoodTypeCard: React.FC<FoodTypeCardProps> = ({ foodType, onSwipe, style }) => {
  return (
    <Card 
      className="w-full max-w-sm mx-auto bg-white shadow-xl rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
      style={style}
    >
      {/* Main Image */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={foodType.image} 
          alt={foodType.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Emoji */}
        <div className="absolute top-4 right-4">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-2xl">
            {foodType.emoji}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-3xl font-bold mb-2">{foodType.name}</h2>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 pb-20">
        <p className="text-gray-600 text-lg leading-relaxed">
          {foodType.description}
        </p>
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

export default FoodTypeCard;
