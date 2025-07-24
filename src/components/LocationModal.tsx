
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
  onLocationChange: (location: string, formattedAddress?: string) => void;
  onClose: () => void;
  isCreatingRoom?: boolean;
  onLocationSetForRoom?: (location: string, formattedAddress?: string) => void;
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
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [displayLocation, setDisplayLocation] = useState(currentLocation);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !isLoading) {
      // If we have a formatted address, use it; otherwise, try to geocode first
      if (formattedAddress) {
        if (isCreatingRoom && onLocationSetForRoom) {
          onLocationSetForRoom(location.trim(), formattedAddress);
        } else {
          onLocationChange(location.trim(), formattedAddress);
        }
        onClose();
      } else {
        // Try to geocode the location before submitting
        handleGeocode(location.trim());
      }
    }
  };

  const handleGeocode = async (address: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'geocode',
          location: address
        },
      });

      if (error || !data?.lat || !data?.lng) {
        console.error('Geocoding failed:', error);
        // Don't set location if geocoding fails - show error to user
        alert('Unable to find that location. Please try a different address or use "Use Current Location".');
        return;
      } else {
        // Use coordinates for API calls, formatted address for display
        const coordinates = `${data.lat}, ${data.lng}`;
        const formattedAddress = data.formatted_address || address;
        
        if (isCreatingRoom && onLocationSetForRoom) {
          onLocationSetForRoom(coordinates, formattedAddress);
        } else {
          onLocationChange(coordinates, formattedAddress);
        }
        onClose();
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Don't set location if geocoding fails - show error to user
      alert('Unable to find that location. Please try a different address or use "Use Current Location".');
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
          setDisplayLocation('Loading location...'); // Show loading instead of coordinates
          setFormattedAddress(null);
        } else {
          // Store coordinates for API calls, formatted address for display
          setLocation(address);
          setDisplayLocation(data.address);
          setFormattedAddress(data.address);
          
          // Immediately call the callback to update the parent component
          if (isCreatingRoom && onLocationSetForRoom) {
            onLocationSetForRoom(address, data.address);
          } else {
            onLocationChange(address, data.address);
          }
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setLocation(address);
        setDisplayLocation('Loading location...'); // Show loading instead of coordinates
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
          setDisplayLocation(address);
          setFormattedAddress(null);
        } else {
          // Store coordinates for API calls, formatted address for display
          const coordinates = `${data.lat}, ${data.lng}`;
          setLocation(coordinates);
          setDisplayLocation(data.formatted_address || address);
          setFormattedAddress(data.formatted_address || address);
          
          // Immediately call the callback to update the parent component
          if (isCreatingRoom && onLocationSetForRoom) {
            onLocationSetForRoom(coordinates, data.formatted_address || address);
          } else {
            onLocationChange(coordinates, data.formatted_address || address);
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setLocation(address);
        setDisplayLocation(address);
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
        setDisplayLocation(coordinates); // Show coordinates in input
        setFormattedAddress(null);
      } else {
        // Store coordinates for API calls, formatted address for display
        const coordinates = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        setLocation(coordinates);
        setDisplayLocation(coordinates); // Show coordinates in input
        setFormattedAddress(data.address);
        
        // Call the appropriate callback with both coordinates and formatted address
        if (isCreatingRoom && onLocationSetForRoom) {
          onLocationSetForRoom(coordinates, data.address);
        } else {
          onLocationChange(coordinates, data.address);
        }
        onClose();
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to detect your location. Please enter it manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Set Location</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
              disabled={isLoading}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="location" className="text-gray-700 text-sm sm:text-base">
                Enter your city or zip code
              </Label>
              <Input
                id="location"
                type="text"
                value={displayLocation}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setDisplayLocation(e.target.value);
                }}
                onBlur={(e) => handleAddressInput(e.target.value)}
                placeholder="e.g., San Francisco, CA or 94102"
                className="mt-1 text-sm sm:text-base"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full text-sm sm:text-base"
              onClick={handleUseCurrentLocation}
              disabled={isDetecting || isLoading}
            >
              <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {isDetecting ? 'Detecting...' : 'Use Current Location'}
            </Button>

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1 text-sm sm:text-base"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-sm sm:text-base"
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
