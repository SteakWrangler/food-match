import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Heart, Clock, Trash2, RefreshCw, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getFavoritesService, Restaurant } from '@/integrations/supabase/favoritesService';
import { getRoomHistoryService, RoomHistoryEntry } from '@/integrations/supabase/roomHistoryService';
import { useToast } from '@/hooks/use-toast';

interface UserSettingsModalProps {
  onClose: () => void;
  onRecreateRoom?: (roomData: RoomHistoryEntry) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ onClose, onRecreateRoom }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [roomHistory, setRoomHistory] = useState<RoomHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const favoritesService = getFavoritesService();
  const roomHistoryService = getRoomHistoryService();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load favorites
      const { data: favoritesData, error: favoritesError } = await favoritesService.getFavoriteRestaurants(user.id);
      if (favoritesError) {
        console.error('Error loading favorites:', favoritesError);
        toast({
          title: "Error",
          description: "Failed to load favorites",
          variant: "destructive",
        });
      } else {
        setFavorites(favoritesData || []);
      }

      // Load room history
      const { data: historyData, error: historyError } = await roomHistoryService.getRoomHistory(user.id);
      if (historyError) {
        console.error('Error loading room history:', historyError);
        toast({
          title: "Error",
          description: "Failed to load room history",
          variant: "destructive",
        });
      } else {
        setRoomHistory(historyData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: string) => {
    if (!user) return;

    try {
      const { error } = await favoritesService.removeFavorite(user.id, restaurantId);
      if (error) {
        console.error('Error removing favorite:', error);
        toast({
          title: "Error",
          description: "Failed to remove favorite",
          variant: "destructive",
        });
        return;
      }

      setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoomHistory = async (historyId: string) => {
    setIsDeleting(historyId);
    try {
      const { error } = await roomHistoryService.deleteRoomHistory(historyId);
      if (error) {
        console.error('Error deleting room history:', error);
        toast({
          title: "Error",
          description: "Failed to delete room history",
          variant: "destructive",
        });
        return;
      }

      setRoomHistory(prev => prev.filter(room => room.id !== historyId));
      toast({
        title: "Success",
        description: "Room history deleted",
      });
    } catch (error) {
      console.error('Error deleting room history:', error);
      toast({
        title: "Error",
        description: "Failed to delete room history",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRecreateRoom = (roomData: RoomHistoryEntry) => {
    onRecreateRoom?.(roomData);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLocation = (location: string) => {
    // If location is coordinates, try to format nicely
    if (location.includes(',')) {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    }
    return location;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">User Settings</h2>
                <p className="text-sm text-gray-600">{profile?.name || user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
              <TabsTrigger 
                value="favorites" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white bg-white text-gray-700 text-xs sm:text-sm py-1.5 sm:py-2 rounded-md transition-all"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Favorites
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white bg-white text-gray-700 text-xs sm:text-sm py-1.5 sm:py-2 rounded-md transition-all"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Room History
              </TabsTrigger>
            </TabsList>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No favorites yet</h3>
                  <p className="text-gray-500">Start swiping to add restaurants to your favorites!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((restaurant) => (
                    <div key={restaurant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{restaurant.name}</h4>
                        <p className="text-sm text-gray-600">{restaurant.cuisine || 'Restaurant'}</p>
                        {restaurant.vicinity && (
                          <p className="text-xs text-gray-500 truncate">{restaurant.vicinity}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(restaurant.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Room History Tab */}
            <TabsContent value="history" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : roomHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No room history</h3>
                  <p className="text-gray-500">Create rooms to see them here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomHistory.map((room) => (
                    <div key={room.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {room.room_name || `Room ${room.room_id.slice(-4)}`}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{formatLocation(room.location)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Users className="w-3 h-3" />
                            <span>{room.restaurants.length} restaurants</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Last accessed: {formatDate(room.last_accessed)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecreateRoom(room)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Recreate room"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRoomHistory(room.id)}
                            disabled={isDeleting === room.id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete room history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default UserSettingsModal; 