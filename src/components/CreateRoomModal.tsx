
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// RESTORED: Use real API calls instead of mock data
const USE_MOCK_LOCATION = false;

interface CreateRoomModalProps {
  onCreateRoom: (name: string, location?: string, formattedAddress?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  currentLocation?: string | null;
  needsLocation?: boolean;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ 
  onCreateRoom, 
  onClose, 
  isLoading = false,
  currentLocation = null,
  needsLocation = false
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState(currentLocation || '');
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isLoading) {
      if (needsLocation && location.trim()) {
        // Just pass the current location - geocoding should have already been done
        onCreateRoom(name.trim(), location.trim());
      } else if (!needsLocation) {
        // If we don't need location, just pass name
        onCreateRoom(name.trim());
      }
    }
  };

  const handleGeocode = async (name: string, address: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'geocode',
          location: address
        },
      });

      if (error || !data?.lat || !data?.lng) {
        console.error('Geocoding failed:', error);
        // Fallback to using the address as-is
        onCreateRoom(name, address, address);
      } else {
        // Use coordinates for API calls, formatted address for display
        const coordinates = `${data.lat}, ${data.lng}`;
        const formattedAddress = data.formatted_address || address;
        onCreateRoom(name, coordinates, formattedAddress);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to using the address as-is
      onCreateRoom(name, address, address);
    }
  };

  const handleAddressInput = async (address: string) => {
    // Check if it's coordinates
    const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    if (coordMatch) {
      // It's coordinates, try to get formatted address
      try {
        const [lat, lng] = address.split(',').map(coord => parseFloat(coord.trim()));
        
        const { data, error } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'reverse-geocode',
            lat,
            lng
          },
        });

        if (error || !data?.address) {
          console.error('Reverse geocoding failed:', error);
          // Fallback to coordinates
          setLocation(address);
        } else {
          // Store coordinates, display formatted address
          setLocation(address);
          // We'll pass the formatted address when submitting
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setLocation(address);
      }
    } else {
      // It's an address, try to geocode it
      try {
        const { data, error } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'geocode',
            location: address
          },
        });

        if (error || !data?.lat || !data?.lng) {
          console.error('Geocoding failed:', error);
          // Fallback to using address as-is
          setLocation(address);
        } else {
          // Store coordinates for API calls
          const coordinates = `${data.lat}, ${data.lng}`;
          setLocation(coordinates);
          // We'll pass the formatted address when submitting
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setLocation(address);
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
        const coordinates = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        setLocation(coordinates);
      } else {
        // Store coordinates for API calls but display the formatted address
        const coordinates = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        setLocation(coordinates);
        // Store the formatted address for later use
        const formattedAddress = data.address;
        
        // Call the callback immediately with both coordinates and formatted address
        onCreateRoom(name, coordinates, formattedAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to detect your location. Please enter it manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const isFormValid = name.trim() && (!needsLocation || location.trim());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create Room</h2>
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
              <Label htmlFor="name" className="text-gray-700">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {needsLocation && (
              <>
                <div>
                  <Label htmlFor="location" className="text-gray-700">
                    Enter your city or zip code
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={(e) => handleAddressInput(e.target.value)}
                    placeholder="e.g., San Francisco, CA or 94102"
                    className="mt-1"
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
              </>
            )}

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
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Creating Room...' : 'Create Room'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateRoomModal;
