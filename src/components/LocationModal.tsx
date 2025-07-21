
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// RESTORED: Use real API calls instead of mock data
const USE_MOCK_LOCATION = false;

interface LocationModalProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  onClose: () => void;
  isCreatingRoom?: boolean;
  onLocationSetForRoom?: (location: string) => void;
  isLoading?: boolean;
}

const LocationModal: React.FC<LocationModalProps> = ({ 
  currentLocation, 
  onLocationChange, 
  onClose,
  isCreatingRoom = false,
  onLocationSetForRoom,
  isLoading = false
}) => {
  const [location, setLocation] = useState(currentLocation);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !isLoading) {
      if (isCreatingRoom && onLocationSetForRoom) {
        // If we're creating a room, call the room-specific callback
        onLocationSetForRoom(location.trim());
      } else {
        // Otherwise, use the general location change callback
        onLocationChange(location.trim());
        onClose();
      }
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      
      // Use Google Places API for reverse geocoding
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'reverse-geocode',
          lat: latitude,
          lng: longitude
        },
      });

      if (error || !data?.address) {
        console.error('Reverse geocoding failed:', error);
        // Fallback to coordinates if reverse geocoding fails
        setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      } else {
        setLocation(data.address);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to detect your location. Please enter it manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">Set Location</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="location" className="text-gray-700">
                Enter your city or zip code
              </Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA or 94102"
                className="mt-1"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleUseCurrentLocation}
              disabled={isDetecting || isLoading}
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isDetecting ? 'Detecting...' : 'Use Current Location'}
            </Button>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                disabled={!location.trim() || isLoading}
              >
                Set Location
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default LocationModal;
