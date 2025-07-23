import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, Trophy, Clock, RotateCcw } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';
import { FoodType } from '@/data/foodTypes';

interface EnhancedSwipeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  userSwipes: Record<string, 'left' | 'right'>;
  roomState?: any;
  items: (Restaurant | FoodType)[];
  type: 'restaurants' | 'foodTypes';
  participantId: string;
  onBringToFront?: (itemId: string) => void;
}

const EnhancedSwipeHistory: React.FC<EnhancedSwipeHistoryProps> = ({
  isOpen,
  onClose,
  userSwipes,
  roomState,
  items,
  type,
  participantId,
  onBringToFront
}) => {
  const [activeTab, setActiveTab] = useState('your-likes');

  const totalParticipants = roomState?.participants?.length || 1;
  const currentUser = roomState?.participants?.find((p: any) => p.id === participantId);

  // Helper function to get likes count for an item
  const getLikesCount = (itemId: string): { count: number; participants: string[] } => {
    if (!roomState) return { count: 0, participants: [] };
    
    const participants = roomState.participants || [];
    const swipes = type === 'restaurants' ? roomState.restaurantSwipes : roomState.foodTypeSwipes;
    
    const likedParticipants = participants.filter((participant: any) => 
      swipes[participant.id]?.[itemId] === 'right'
    );
    
    return {
      count: likedParticipants.length,
      participants: likedParticipants.map((p: any) => p.name)
    };
  };

  // Helper function to get likes count from OTHER participants only
  const getOthersLikesCount = (itemId: string): { count: number; participants: string[] } => {
    if (!roomState) return { count: 0, participants: [] };
    
    const participants = roomState.participants || [];
    const swipes = type === 'restaurants' ? roomState.restaurantSwipes : roomState.foodTypeSwipes;
    
    const likedParticipants = participants.filter((participant: any) => 
      participant.id !== participantId && swipes[participant.id]?.[itemId] === 'right'
    );
    
    return {
      count: likedParticipants.length,
      participants: likedParticipants.map((p: any) => p.name)
    };
  };

  // Your Likes - items you liked (regardless of others)
  const yourLikes = items.filter(item => userSwipes[item.id] === 'right');

  // Matches - items where everyone liked it
  const matches = items.filter(item => {
    const likes = getLikesCount(item.id);
    return likes.count === totalParticipants && totalParticipants > 1;
  });

  // Others' Likes - items that OTHER people liked but you didn't
  const othersLikes = items.filter(item => {
    const othersLikes = getOthersLikesCount(item.id);
    return userSwipes[item.id] !== 'right' && othersLikes.count > 0;
  });

  // Sort by popularity (most likes first)
  const sortByPopularity = (items: (Restaurant | FoodType)[]) => {
    return [...items].sort((a, b) => {
      const aLikes = getLikesCount(a.id).count;
      const bLikes = getLikesCount(b.id).count;
      return bLikes - aLikes; // Descending order
    });
  };

  // Sort others' likes by how many OTHER people liked them
  const sortOthersByPopularity = (items: (Restaurant | FoodType)[]) => {
    return [...items].sort((a, b) => {
      const aOthersLikes = getOthersLikesCount(a.id).count;
      const bOthersLikes = getOthersLikesCount(b.id).count;
      return bOthersLikes - aOthersLikes; // Descending order
    });
  };

  const sortedYourLikes = sortByPopularity(yourLikes);
  const sortedOthersLikes = sortOthersByPopularity(othersLikes);
  const sortedMatches = sortByPopularity(matches);

  const handleBringToFront = (itemId: string) => {
    if (onBringToFront) {
      onBringToFront(itemId);
      onClose(); // Close the history modal
    }
  };

  const renderItemCard = (item: Restaurant | FoodType, likes: { count: number; participants: string[] }, showBringToFront = false) => {
    const isRestaurant = 'cuisine' in item;
    
    return (
      <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
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
                variant={likes.count > 1 ? 'default' : 'secondary'}
                className="text-xs"
              >
                <Users className="w-3 h-3 mr-1" />
                {likes.count}/{totalParticipants} people
              </Badge>
              
              {likes.count === totalParticipants && totalParticipants > 1 && (
                <Badge variant="destructive" className="text-xs">
                  🎉 Match!
                </Badge>
              )}
            </div>
            
            {likes.participants.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {likes.participants.join(', ')}
              </p>
            )}
          </div>

          {showBringToFront && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBringToFront(item.id)}
              className="flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              A Second Look?
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Swipe History
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="your-likes" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Your Likes ({yourLikes.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-xs">
              <Trophy className="w-3 h-3 mr-1" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="others-likes" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Others Liked ({othersLikes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="your-likes" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {sortedYourLikes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No likes yet!</p>
                <p className="text-sm">Start swiping to see your history here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedYourLikes.map(item => {
                  const likes = getLikesCount(item.id);
                  return renderItemCard(item, likes, false);
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="matches" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {sortedMatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No matches yet!</p>
                <p className="text-sm">When everyone likes the same thing, it appears here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedMatches.map(item => {
                  const likes = getLikesCount(item.id);
                  return renderItemCard(item, likes, false);
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="others-likes" className="flex-1 overflow-y-auto mt-4 space-y-3">
            {sortedOthersLikes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No other likes yet!</p>
                <p className="text-sm">When others like things you don't, they appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOthersLikes.map(item => {
                  const likes = getOthersLikesCount(item.id);
                  return renderItemCard(item, likes, true); // Show "Try Again" button for others' likes
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t flex-shrink-0">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSwipeHistory; 