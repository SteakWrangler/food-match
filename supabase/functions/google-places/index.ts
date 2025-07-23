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
  if (name.includes('gas') || name.includes('fuel') || name.includes('petrol')) {
    return true;
  }
  
  if (name.includes('hotel') || name.includes('inn') || name.includes('motel') || name.includes('resort')) {
    return true;
  }
  
  if (name.includes('golf') || name.includes('country club') || name.includes('golf club')) {
    return true;
  }
  
  // Additional exclusions for other non-restaurant establishments
  if (name.includes('car wash') || name.includes('auto repair') || name.includes('mechanic')) {
    return true;
  }
  
  if (name.includes('pharmacy') || name.includes('drugstore') || name.includes('medical')) {
    return true;
  }
  
  return false;
};

// Function to remove duplicate chain restaurants
const removeDuplicateChains = (places: GooglePlacesResult[]): GooglePlacesResult[] => {
  const seenNames = new Set<string>();
  const filteredPlaces: GooglePlacesResult[] = [];
  
  for (const place of places) {
    // Normalize the name for comparison (remove common suffixes and prefixes)
    const normalizedName = place.name
      .toLowerCase()
      .replace(/\s*-\s*.*$/, '') // Remove everything after dash
      .replace(/\s*\(.*?\)/g, '') // Remove parentheses content
      .replace(/\s*#\d+/, '') // Remove location numbers like "#123"
      .replace(/\s*at\s+.*$/, '') // Remove "at [location]" suffixes
      .replace(/\s*on\s+.*$/, '') // Remove "on [street]" suffixes
      .replace(/\s*&\s*co\.?/gi, '') // Remove "& Co" suffixes
      .replace(/\s*restaurant\s*$/i, '') // Remove "Restaurant" suffix
      .replace(/\s*grill\s*$/i, '') // Remove "Grill" suffix
      .replace(/\s*bar\s*$/i, '') // Remove "Bar" suffix
      .replace(/\s*cafe\s*$/i, '') // Remove "Cafe" suffix
      .replace(/\s*bistro\s*$/i, '') // Remove "Bistro" suffix
      .replace(/\s*kitchen\s*$/i, '') // Remove "Kitchen" suffix
      .replace(/\s*tavern\s*$/i, '') // Remove "Tavern" suffix
      .replace(/\s*pub\s*$/i, '') // Remove "Pub" suffix
      .replace(/\s*lounge\s*$/i, '') // Remove "Lounge" suffix
      .replace(/\s*steakhouse\s*$/i, '') // Remove "Steakhouse" suffix
      .replace(/\s*bbq\s*$/i, '') // Remove "BBQ" suffix
      .replace(/\s*barbecue\s*$/i, '') // Remove "Barbecue" suffix
      .replace(/\s*pizza\s*$/i, '') // Remove "Pizza" suffix
      .replace(/\s*italian\s*$/i, '') // Remove "Italian" suffix
      .replace(/\s*mexican\s*$/i, '') // Remove "Mexican" suffix
      .replace(/\s*chinese\s*$/i, '') // Remove "Chinese" suffix
      .replace(/\s*japanese\s*$/i, '') // Remove "Japanese" suffix
      .replace(/\s*thai\s*$/i, '') // Remove "Thai" suffix
      .replace(/\s*indian\s*$/i, '') // Remove "Indian" suffix
      .replace(/\s*american\s*$/i, '') // Remove "American" suffix
      .replace(/\s*french\s*$/i, '') // Remove "French" suffix
      .replace(/\s*greek\s*$/i, '') // Remove "Greek" suffix
      .replace(/\s*mediterranean\s*$/i, '') // Remove "Mediterranean" suffix
      .replace(/\s*korean\s*$/i, '') // Remove "Korean" suffix
      .replace(/\s*vietnamese\s*$/i, '') // Remove "Vietnamese" suffix
      .replace(/\s*spanish\s*$/i, '') // Remove "Spanish" suffix
      .replace(/\s*german\s*$/i, '') // Remove "German" suffix
      .replace(/\s*british\s*$/i, '') // Remove "British" suffix
      .replace(/\s*irish\s*$/i, '') // Remove "Irish" suffix
      .replace(/\s*caribbean\s*$/i, '') // Remove "Caribbean" suffix
      .replace(/\s*middle\s+eastern\s*$/i, '') // Remove "Middle Eastern" suffix
      .replace(/\s*african\s*$/i, '') // Remove "African" suffix
      .replace(/\s*brazilian\s*$/i, '') // Remove "Brazilian" suffix
      .replace(/\s*peruvian\s*$/i, '') // Remove "Peruvian" suffix
      .replace(/\s*argentinian\s*$/i, '') // Remove "Argentinian" suffix
      .replace(/\s*cuban\s*$/i, '') // Remove "Cuban" suffix
      .replace(/\s*puerto\s*rican\s*$/i, '') // Remove "Puerto Rican" suffix
      .replace(/\s*fusion\s*$/i, '') // Remove "Fusion" suffix
      .replace(/\s*seafood\s*$/i, '') // Remove "Seafood" suffix
      .replace(/\s*steak\s*$/i, '') // Remove "Steak" suffix
      .replace(/\s*bakery\s*$/i, '') // Remove "Bakery" suffix
      .replace(/\s*desserts\s*$/i, '') // Remove "Desserts" suffix
      .replace(/\s*burgers\s*$/i, '') // Remove "Burgers" suffix
      .replace(/\s*pasta\s*$/i, '') // Remove "Pasta" suffix
      .replace(/\s*tacos\s*$/i, '') // Remove "Tacos" suffix
      .replace(/\s*burritos\s*$/i, '') // Remove "Burritos" suffix
      .replace(/\s*ramen\s*$/i, '') // Remove "Ramen" suffix
      .replace(/\s*pho\s*$/i, '') // Remove "Pho" suffix
      .replace(/\s*curry\s*$/i, '') // Remove "Curry" suffix
      .replace(/\s*kebab\s*$/i, '') // Remove "Kebab" suffix
      .replace(/\s*falafel\s*$/i, '') // Remove "Falafel" suffix
      .replace(/\s*gyros\s*$/i, '') // Remove "Gyros" suffix
      .replace(/\s*paella\s*$/i, '') // Remove "Paella" suffix
      .replace(/\s*tapas\s*$/i, '') // Remove "Tapas" suffix
      .replace(/\s*schnitzel\s*$/i, '') // Remove "Schnitzel" suffix
      .replace(/\s*fish\s*&\s*chips\s*$/i, '') // Remove "Fish & Chips" suffix
      .replace(/\s*bangers\s*&\s*mash\s*$/i, '') // Remove "Bangers & Mash" suffix
      .replace(/\s*jerk\s*chicken\s*$/i, '') // Remove "Jerk Chicken" suffix
      .replace(/\s*ceviche\s*$/i, '') // Remove "Ceviche" suffix
      .replace(/\s*asado\s*$/i, '') // Remove "Asado" suffix
      .replace(/\s*ropa\s*vieja\s*$/i, '') // Remove "Ropa Vieja" suffix
      .replace(/\s*mofongo\s*$/i, '') // Remove "Mofongo" suffix
      .replace(/\s*empanadas\s*$/i, '') // Remove "Empanadas" suffix
      .replace(/\s*sandwiches\s*$/i, '') // Remove "Sandwiches" suffix
      .replace(/\s*subs\s*$/i, '') // Remove "Subs" suffix
      .replace(/\s*wings\s*$/i, '') // Remove "Wings" suffix
      .replace(/\s*noodles\s*$/i, '') // Remove "Noodles" suffix
      .replace(/\s*chicken\s*$/i, '') // Remove "Chicken" suffix
      .replace(/\s*hot\s*dogs\s*$/i, '') // Remove "Hot Dogs" suffix
      .replace(/\s*ice\s*cream\s*$/i, '') // Remove "Ice Cream" suffix
      .replace(/\s*coffee\s*$/i, '') // Remove "Coffee" suffix
      .trim();
    
    // Skip if we've already seen this normalized name
    if (seenNames.has(normalizedName)) {
      continue;
    }
    
    // Add to seen set and keep this place
    seenNames.add(normalizedName);
    filteredPlaces.push(place);
  }
  
  return filteredPlaces;
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
      limit = 40, // Increased from 20 to 40 to get more results
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

    // Handle reverse geocoding
    if (action === 'reverse-geocode') {
      const { lat, lng } = body;
      
      if (lat === undefined || lng === undefined) {
        return new Response(JSON.stringify({ error: "Latitude and longitude are required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googlePlacesApiKey}`;
        const response = await fetch(reverseGeocodeUrl);
        
        if (!response.ok) {
          throw new Error(`Reverse geocoding failed: HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
          return new Response(JSON.stringify({ 
            error: "No address found for the given coordinates",
            status: data.status
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const result = data.results[0];

        return new Response(JSON.stringify({ 
          address: result.formatted_address,
          place_id: result.place_id,
          lat,
          lng
        }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: "Reverse geocoding failed",
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
            
            // Remove duplicate chain restaurants
            const deduplicatedTextResults = removeDuplicateChains(filteredTextResults);
            console.log(`Deduplicated text search results: ${filteredTextResults.length} -> ${deduplicatedTextResults.length}`);
            
            // Transform text search results
            const restaurants: RestaurantData[] = await Promise.all(
              deduplicatedTextResults.slice(0, limit).map(async (place: any) => {
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
                    // Get up to 5 photos - use photo references immediately as they expire
                    const photoPromises = details.photos.slice(0, 5).map(async (photo: any) => {
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
                  googleTypes: place.types
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
        console.log(`Search parameters: radius=${radius}, type=${type}, keyword=${keyword}, minPrice=${minPrice}, maxPrice=${maxPrice}, openNow=${openNow}`);
        
        const placesResponse = await fetch(placesUrl);
        
        if (!placesResponse.ok) {
          throw new Error(`Places API failed: HTTP ${placesResponse.status}`);
        }

        const placesData: GooglePlacesResponse = await placesResponse.json();
        
        console.log(`Google Places API returned ${placesData.results?.length || 0} results`);
        if (placesData.results && placesData.results.length > 0) {
          console.log('Sample results:', placesData.results.slice(0, 3).map(r => r.name));
        }
        
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
        
        // Remove duplicate chain restaurants
        const deduplicatedNearbyResults = removeDuplicateChains(filteredNearbyResults);
        console.log(`Deduplicated nearby search results: ${filteredNearbyResults.length} -> ${deduplicatedNearbyResults.length}`);
        
        // Transform the results to match our Restaurant interface
        console.log(`🚀 Starting parallel processing for ${deduplicatedNearbyResults.slice(0, limit).length} restaurants...`);
        const startTime = Date.now();
        
        const restaurants: RestaurantData[] = await Promise.all(
          deduplicatedNearbyResults.slice(0, limit).map(async (place) => {
            // Step 1: Get Place Details (required for everything else)
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

            // Step 2: PARALLEL - Process Photos API calls
            const [images] = await
              Promise.all([
                // Photos API calls
                (async () => {
                  let images: string[] = [];
                  if (details.photos && details.photos.length > 0) {
                    try {
                      console.log(`Fetching ${Math.min(details.photos.length, 5)} photos for ${place.name}`);
                      
                      const photoPromises = details.photos.slice(0, 5).map(async (photo: any, index: number) => {
                        try {
                          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photo_reference=${photo.photo_reference}&key=${googlePlacesApiKey}`;
                          console.log(`Photo ${index + 1} URL for ${place.name}: ${photoUrl}`);
                          return photoUrl;
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
                  return images;
                })()
              ]);

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
              description: '', // No description needed
              tags: place.types.filter((type: string) => 
                ['restaurant', 'food', 'establishment'].includes(type)
              ),
              address: place.vicinity,
              phone: details.formatted_phone_number,
              website: details.website,
              openingHours: details.opening_hours?.weekday_text || [],
              googleTypes: place.types
            };
          })
        );

        const endTime = Date.now();
        const processingTime = endTime - startTime;
        console.log(`✅ Parallel processing completed in ${processingTime}ms for ${restaurants.length} restaurants`);
        console.log(`🚀 Performance: ${processingTime / restaurants.length}ms per restaurant (parallel processing)`);

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
      error: "Invalid action. Use 'search-restaurants', 'geocode', or 'reverse-geocode'" 
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