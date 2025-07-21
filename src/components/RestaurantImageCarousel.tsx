import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface RestaurantImageCarouselProps {
  images: string[];
  restaurantName: string;
  className?: string;
}

const RestaurantImageCarousel: React.FC<RestaurantImageCarouselProps> = ({
  images,
  restaurantName,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="50">🍽️</text></svg>';
  };

  // If only one image, just display it without carousel
  if (images.length <= 1) {
    return (
      <div className={`relative h-80 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100 flex-shrink-0 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={images[0] || 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop'} 
            alt={restaurantName}
            className="w-full h-full object-cover"
            draggable={false}
            onError={handleImageError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-80 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100 flex-shrink-0 ${className}`}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: false,
          containScroll: "trimSnaps",
          skipSnaps: false,
          watchDrag: false,
        }}
        className="w-full h-full"
        setApi={(api) => {
          if (api) {
            api.on('select', () => {
              setCurrentImageIndex(api.selectedScrollSnap());
            });
          }
        }}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative h-full">
                <img 
                  src={image} 
                  alt={`${restaurantName} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={handleImageError}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom navigation buttons */}
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default RestaurantImageCarousel; 