import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getFavoritesService } from '@/integrations/supabase/favoritesService';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  priceRange: string;
  vicinity?: string;
  openingHours?: string[];
  cuisine?: string;
  description?: string;
  tags?: string[];
}

interface FavoriteButtonProps {
  restaurant: Restaurant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  restaurant, 
  size = 'md', 
  className = '',
  onToggle 
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const favoritesService = getFavoritesService();

  // Check initial favorite status
  useEffect(() => {
    if (user && !isInitialized) {
      checkFavoriteStatus();
    }
  }, [user, restaurant.id, isInitialized]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const { isFavorited: status, error } = await favoritesService.isFavorited(user.id, restaurant.id);
      
      if (error) {
        console.error('Error checking favorite status:', error);
        return;
      }

      setIsFavorited(status);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggle = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const { isFavorited: newStatus, error } = await favoritesService.toggleFavorite(user.id, restaurant);
      
      if (error) {
        console.error('Error toggling favorite:', error);
        return;
      }

      setIsFavorited(newStatus);
      onToggle?.(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not signed in
  if (!user) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-7 h-7';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 20;
      default:
        return 18;
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${getSizeClasses()}
        ${className}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        hover:scale-110
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${isFavorited 
          ? 'bg-destructive text-destructive-foreground shadow-lg' 
          : 'bg-background text-muted-foreground hover:text-destructive hover:bg-destructive/10'
        }
        ${isLoading ? 'animate-pulse' : ''}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        size={getIconSize()} 
        className={`transition-all duration-200 ${isFavorited ? 'fill-current' : ''}`}
      />
    </button>
  );
};

export default FavoriteButton; 