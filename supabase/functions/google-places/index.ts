import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface GooglePlacesSearchParams {
  location: string;
  radius?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  limit?: number;
  type?: string;
}

interface GooglePlacesResult {
  place_id: string;
  name: string;
  rating?: number;
  price_level?: number;
  types: string[];
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface GooglePlacesResponse {
  results: GooglePlacesResult[];
  status: string;
  next_page_token?: string;
}

interface RestaurantData {
  id: string;
  name: string;
  cuisine?: string;
  image?: string;
  images?: string[];
  rating?: number;
  priceRange?: string;
  distance?: string;
  estimatedTime?: string;
  description?: string;
  tags: string[];
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  googleTypes?: string[];
  processedByChatGPT?: boolean;
  chatGPTConfidence?: number;
}

// Function to filter out non-restaurant places
const shouldExcludePlace = (place: GooglePlacesResult): boolean => {
  const name = place.name.toLowerCase();
  const types = place.types.map(t => t.toLowerCase());
  
  // Exclude specific chains/brands
  const excludedBrands = [
    'starbucks', 'dunkin', 'dunkin donuts', 'tim hortons', 'peets coffee',
    'caribou coffee', 'coffee bean', 'tully\'s coffee', 'biggby coffee',
    '7-eleven', 'circle k', 'speedway', 'shell', 'exxon', 'mobil', 'bp',
    'chevron', 'valero', 'marathon', 'sunoco', 'phillips 66',
    'walmart', 'target', 'costco', 'sam\'s club', 'kroger', 'safeway',
    'albertsons', 'publix', 'wegmans', 'trader joe\'s', 'whole foods',
    'cvs', 'walgreens', 'rite aid', 'duane reade'
  ];
  
  // Exclude specific place types
  const excludedTypes = [
    'gas_station', 'convenience_store', 'liquor_store', 'bank', 'atm',
    'hospital', 'doctor', 'dentist', 'pharmacy', 'veterinary_care',
    'gym', 'fitness_center', 'spa', 'beauty_salon', 'barber_shop',
    'hotel', 'lodging', 'motel', 'inn', 'resort', 'hostel',
    'golf_course', 'country_club', 'tennis_court', 'swimming_pool',
    'park', 'playground', 'amusement_park', 'aquarium', 'zoo',
    'museum', 'art_gallery', 'library', 'school', 'university',
    'police', 'fire_station', 'post_office', 'courthouse',
    'car_dealer', 'car_rental', 'car_wash', 'auto_repair',
    'funeral_home', 'cemetery', 'church', 'synagogue', 'mosque',
    'embassy', 'government_office', 'city_hall'
  ];
  
  // Check if name contains excluded brands
  for (const brand of excludedBrands) {
    if (name.includes(brand)) {
      return true;
    }
  }
  
  // Check if any of the place types are excluded
  for (const excludedType of excludedTypes) {
    if (types.includes(excludedType)) {
      return true;
    }
  }
  
  // Additional checks for specific patterns
  if (name.includes('gas') || name.includes('fuel')) {
    return true;
  }
  
  if (name.includes('hotel') || name.includes('inn') || name.includes('motel')) {
    return true;
  }
  
  if (name.includes('golf') || name.includes('country club')) {
    return true;
  }
  
  return false;
};

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const googlePlacesApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    
    if (!googlePlacesApiKey) {
      return new Response(JSON.stringify({ 
        error: "Missing Google Places API key",
        hasApiKey: false
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch (_) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { 
      action, 
      location, 
      radius = 5000, 
      keyword, 
      minPrice, 
      maxPrice, 
      openNow, 
      limit = 20,
      type = 'restaurant',
      pageToken // Add pageToken parameter
    } = body;

    // Handle geocoding
    if (action === 'geocode') {
      if (!location) {
        return new Response(JSON.stringify({ error: "Location is required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googlePlacesApiKey}`;
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          throw new Error(`Geocoding failed: HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
          return new Response(JSON.stringify({ 
            error: "No location found",
            status: data.status
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const result = data.results[0];
        const { lat, lng } = result.geometry.location;

        return new Response(JSON.stringify({ 
          lat, 
          lng, 
          formatted_address: result.formatted_address,
          place_id: result.place_id
        }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "Geocoding failed",
          details: error.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // Handle restaurant search
    if (action === 'search-restaurants' || !action) {
      if (!location) {
        return new Response(JSON.stringify({ error: "Location is required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        let lat: number, lng: number;
        
        // Check if location is already coordinates
        const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        
        if (coordMatch) {
          // Use coordinates directly
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        } else {
          // Try to geocode the location
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googlePlacesApiKey}`;
          const geocodeResponse = await fetch(geocodeUrl);
          
          if (!geocodeResponse.ok) {
            throw new Error(`Geocoding failed: HTTP ${geocodeResponse.status}`);
          }

          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
            // If geocoding fails, try using text search instead
            console.log('Geocoding failed, trying text search instead');
            const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${encodeURIComponent(location)}&key=${googlePlacesApiKey}${pageToken ? `&pagetoken=${pageToken}` : ''}`;
            
            const textSearchResponse = await fetch(textSearchUrl);
            
            if (!textSearchResponse.ok) {
              throw new Error(`Text search failed: HTTP ${textSearchResponse.status}`);
            }

            const textSearchData = await textSearchResponse.json();
            
            if (textSearchData.status !== 'OK' || !textSearchData.results || textSearchData.results.length === 0) {
              return new Response(JSON.stringify({ 
                error: "No restaurants found for the given location",
                status: textSearchData.status
              }), {
                status: 400,
                headers: corsHeaders
              });
            }

            // Filter out non-restaurant places from text search results
            const filteredTextResults = textSearchData.results.filter(place => !shouldExcludePlace(place));
            console.log(`Filtered text search results: ${textSearchData.results.length} -> ${filteredTextResults.length}`);
            
            // Transform text search results
            const restaurants: RestaurantData[] = await Promise.all(
              filteredTextResults.slice(0, limit).map(async (place: any) => {
                const priceLevelToString = (level?: number): string => {
                  if (!level) return '';
                  return '$'.repeat(level);
                };

                // Get additional details for each place including photos
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours,types,photos&key=${googlePlacesApiKey}`;
                
                let details: any = {};
                try {
                  const detailsResponse = await fetch(detailsUrl);
                  if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json();
                    if (detailsData.status === 'OK' && detailsData.result) {
                      details = detailsData.result;
                    }
                  }
                } catch (error) {
                  console.log(`Failed to get details for ${place.name}:`, error.message);
                }

                // Get images from Google Places Photos API
                let images: string[] = [];
                if (details.photos && details.photos.length > 0) {
                  try {
                    // Get up to 3 photos - use photo references immediately as they expire
                    const photoPromises = details.photos.slice(0, 3).map(async (photo: any) => {
                      // Use the correct Google Places Photo API URL format
                      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photoreference=${photo.photo_reference}&key=${googlePlacesApiKey}`;
                      
                      // Test if the photo URL is accessible
                      try {
                        const photoResponse = await fetch(photoUrl, { method: 'HEAD' });
                        if (photoResponse.ok) {
                          return photoUrl;
                        } else {
                          return null;
                        }
                      } catch (error) {
                        return null;
                      }
                    });
                    
                    const photoResults = await Promise.all(photoPromises);
                    images = photoResults.filter(url => url !== null);
                  } catch (error) {
                    console.log(`Places Photos API failed for ${place.name}:`, error.message);
                  }
                }

                // Use first image as main image, or fallback to a placeholder
                const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop';

                // Try to calculate real distance if we have search coordinates, otherwise use placeholder
                let distance = '0.5 mi'; // Default placeholder
                let estimatedTime = '15 min'; // Default placeholder
                
                // If we have search coordinates (from geocoding), calculate real distance
                if (typeof lat === 'number' && typeof lng === 'number') {
                  const calculateDistance = (placeLat: number, placeLng: number, searchLat: number, searchLng: number): string => {
                    const R = 3959; // Earth's radius in miles
                    const dLat = (placeLat - searchLat) * Math.PI / 180;
                    const dLng = (placeLng - searchLng) * Math.PI / 180;
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                             Math.cos(searchLat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
                             Math.sin(dLng/2) * Math.sin(dLng/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    const distance = R * c;
                    return `${distance.toFixed(1)} mi`;
                  };

                  const calculateEstimatedTime = (distance: string): string => {
                    const distanceNum = parseFloat(distance.replace(' mi', ''));
                    // Assume average speed of 25 mph in city traffic
                    const timeInMinutes = Math.round(distanceNum * 60 / 25);
                    return `${timeInMinutes} min`;
                  };

                  distance = calculateDistance(place.geometry.location.lat, place.geometry.location.lng, lat, lng);
                  estimatedTime = calculateEstimatedTime(distance);
                }

                return {
                  id: place.place_id,
                  name: place.name,
                  image: mainImage,
                  images: images,
                  rating: place.rating,
                  priceRange: priceLevelToString(place.price_level),
                  distance,
                  estimatedTime,
                  description: `Restaurant in ${place.formatted_address || place.vicinity}`,
                  tags: place.types.filter((type: string) => 
                    ['restaurant', 'food', 'establishment'].includes(type)
                  ),
                  address: place.formatted_address || place.vicinity,
                  phone: details.formatted_phone_number,
                  website: details.website,
                  openingHours: details.opening_hours?.weekday_text || [],
                  googleTypes: place.types,
                  processedByChatGPT: false,
                  chatGPTConfidence: undefined
                };
              })
            );

            return new Response(JSON.stringify({ 
              restaurants,
              count: restaurants.length,
              status: textSearchData.status,
              nextPageToken: textSearchData.next_page_token // Include nextPageToken in response
            }), {
              headers: corsHeaders
            });
          }

          const result = geocodeData.results[0];
          lat = result.geometry.location.lat;
          lng = result.geometry.location.lng;
        }

        // Build the Places API search URL
        const searchParams = new URLSearchParams({
          location: `${lat},${lng}`,
          radius: radius.toString(),
          type: type,
          key: googlePlacesApiKey
        });

        if (keyword) {
          searchParams.append('keyword', keyword);
        }

        if (minPrice !== undefined) {
          searchParams.append('minprice', minPrice.toString());
        }

        if (maxPrice !== undefined) {
          searchParams.append('maxprice', maxPrice.toString());
        }

        if (openNow) {
          searchParams.append('opennow', 'true');
        }

        if (pageToken) {
          searchParams.append('pagetoken', pageToken);
        }

        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${searchParams.toString()}`;
        
        console.log(`Searching for restaurants at: ${placesUrl}`);
        
        const placesResponse = await fetch(placesUrl);
        
        if (!placesResponse.ok) {
          throw new Error(`Places API failed: HTTP ${placesResponse.status}`);
        }

        const placesData: GooglePlacesResponse = await placesResponse.json();
        
        if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
          return new Response(JSON.stringify({ 
            error: `Places API error: ${placesData.status}`,
            status: placesData.status
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        if (!placesData.results || placesData.results.length === 0) {
          return new Response(JSON.stringify({ 
            restaurants: [],
            message: "No restaurants found"
          }), {
            headers: corsHeaders
          });
        }

        // Filter out non-restaurant places from nearby search results
        const filteredNearbyResults = placesData.results.filter(place => !shouldExcludePlace(place));
        console.log(`Filtered nearby search results: ${placesData.results.length} -> ${filteredNearbyResults.length}`);
        
        // Transform the results to match our Restaurant interface
        const restaurants: RestaurantData[] = await Promise.all(
          filteredNearbyResults.slice(0, limit).map(async (place) => {
            // Get additional details for each place
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours,types,photos&key=${googlePlacesApiKey}`;
            
            let details: any = {};
            try {
              const detailsResponse = await fetch(detailsUrl);
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                if (detailsData.status === 'OK' && detailsData.result) {
                  details = detailsData.result;
                }
              }
            } catch (error) {
              console.log(`Failed to get details for ${place.name}:`, error.message);
            }

            // Convert price level to string
            const priceLevelToString = (level?: number): string => {
              if (!level) return '';
              return '$'.repeat(level);
            };

            // Calculate distance based on search radius and location
            const calculateDistance = (placeLat: number, placeLng: number, searchLat: number, searchLng: number): string => {
              const R = 3959; // Earth's radius in miles
              const dLat = (placeLat - searchLat) * Math.PI / 180;
              const dLng = (placeLng - searchLng) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                       Math.cos(searchLat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
                       Math.sin(dLng/2) * Math.sin(dLng/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c;
              return `${distance.toFixed(1)} mi`;
            };

            const calculateEstimatedTime = (distance: string): string => {
              const distanceNum = parseFloat(distance.replace(' mi', ''));
              // Assume average speed of 25 mph in city traffic
              const timeInMinutes = Math.round(distanceNum * 60 / 25);
              return `${timeInMinutes} min`;
            };

            // Calculate real distance and time
            const distance = calculateDistance(place.geometry.location.lat, place.geometry.location.lng, lat, lng);
            const estimatedTime = calculateEstimatedTime(distance);

            // Get images from Google Places Photos API
            let images: string[] = [];
            if (details.photos && details.photos.length > 0) {
              console.log(`Found ${details.photos.length} photos for ${place.name}`);
              try {
                // Get up to 3 photos - use photo references immediately as they expire
                const photoPromises = details.photos.slice(0, 3).map(async (photo: any, index: number) => {
                  console.log(`Processing photo ${index + 1} for ${place.name}:`, photo);
                  
                  // Use the correct Google Places Photo API URL format
                  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photoreference=${photo.photo_reference}&key=${googlePlacesApiKey}`;
                  console.log(`Photo URL for ${place.name}: ${photoUrl}`);
                  
                  // Test if the photo URL is accessible
                  try {
                    const photoResponse = await fetch(photoUrl, { method: 'HEAD' });
                    console.log(`Photo response for ${place.name}: ${photoResponse.status}`);
                    if (photoResponse.ok) {
                      console.log(`✅ Photo accessible for ${place.name}`);
                      return photoUrl;
                    } else {
                      console.log(`❌ Photo not accessible for ${place.name}: ${photoResponse.status}`);
                      return null;
                    }
                  } catch (error) {
                    console.log(`❌ Photo fetch failed for ${place.name}:`, error.message);
                    return null;
                  }
                });
                
                const photoResults = await Promise.all(photoPromises);
                images = photoResults.filter(url => url !== null);
                console.log(`Final images for ${place.name}:`, images);
              } catch (error) {
                console.log(`Places Photos API failed for ${place.name}:`, error.message);
              }
            } else {
              console.log(`No photos found for ${place.name}`);
            }

            // Use first image as main image, or fallback to a placeholder
            const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop';

            return {
              id: place.place_id,
              name: place.name,
              image: mainImage,
              images: images,
              rating: place.rating,
              priceRange: priceLevelToString(place.price_level),
              distance,
              estimatedTime,
              description: `Restaurant in ${place.vicinity}`,
              tags: [], // Let ChatGPT determine all tags
              address: place.vicinity,
              phone: details.formatted_phone_number,
              website: details.website,
              openingHours: details.opening_hours?.weekday_text || [],
              googleTypes: place.types,
              processedByChatGPT: false, // Will be processed by ChatGPT function
              chatGPTConfidence: undefined
            };
          })
        );

        return new Response(JSON.stringify({ 
          restaurants,
          count: restaurants.length,
          status: placesData.status,
          nextPageToken: placesData.next_page_token // Include nextPageToken in response
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error in Google Places search:', error);
        return new Response(JSON.stringify({ 
          error: "Failed to search restaurants",
          details: error.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // If no valid action is provided
    return new Response(JSON.stringify({ 
      error: "Invalid action. Use 'search-restaurants' or 'geocode'" 
    }), {
      status: 400,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Unhandled error in Google Places function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}); 