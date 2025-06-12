
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Clock, Users, Heart } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';
import { FoodType } from '@/data/foodTypes';

interface SwipeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  userSwipes: Record<string, 'left' | 'right'>;
  roomState?: any;
  items: (Restaurant | FoodType)[];
  type: 'restaurants' | 'foodTypes';
}

type SortOption = 'alphabetical' | 'recent' | 'popularity';

const SwipeHistory: React.FC<SwipeHistoryProps> = ({
  isOpen,
  onClose,
  userSwipes,
  roomState,
  items,
  type
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Get only the items the user swiped right on
  const likedItems = items.filter(item => userSwipes[item.id] === 'right');

  // Calculate how many total participants liked each item (including yourself)
  const getTotalLikesCount = (itemId: string): number => {
    if (!roomState?.swipes) return 1; // If no room state, just count yourself
    
    const allParticipants = roomState.participants || [];
    
    return allParticipants.filter((participant: any) => 
      roomState.swipes[participant.id]?.[itemId] === 'right'
    ).length;
  };

  // Sort the liked items based on the selected option
  const sortedLikedItems = [...likedItems].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'recent':
        // Since we don't track timestamps, we'll use the order in the original array
        return items.indexOf(b) - items.indexOf(a);
      case 'popularity':
        const aLikes = getTotalLikesCount(a.id);
        const bLikes = getTotalLikesCount(b.id);
        return bLikes - aLikes;
      default:
        return 0;
    }
  });

  const totalParticipants = roomState?.participants?.length || 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Your Likes ({likedItems.length})
          </DialogTitle>
        </DialogHeader>

        {likedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No likes yet!</p>
            <p className="text-sm">Start swiping to see your history here.</p>
          </div>
        ) : (
          <>
            {/* Sort Options */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={sortBy === 'popularity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('popularity')}
                className="flex items-center gap-1"
              >
                <Users className="w-3 h-3" />
                Popular
              </Button>
              <Button
                variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('alphabetical')}
                className="flex items-center gap-1"
              >
                <ArrowUp className="w-3 h-3" />
                A-Z
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
                className="flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                Recent
              </Button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {sortedLikedItems.map((item) => {
                const totalLikes = getTotalLikesCount(item.id);
                const isRestaurant = 'cuisine' in item;
                
                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {isRestaurant ? '🍽️' : (item as FoodType).emoji}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        {isRestaurant && (
                          <p className="text-sm text-gray-500">{(item as Restaurant).cuisine}</p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={totalLikes > 1 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {totalLikes}/{totalParticipants} people
                          </Badge>
                          
                          {totalLikes === totalParticipants && totalParticipants > 1 && (
                            <Badge variant="destructive" className="text-xs">
                              🎉 Everyone!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <div className="pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwipeHistory;
