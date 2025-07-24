import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 100, // 100 requests per day
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  keyPrefix: 'google_places'
};

// Rate limiting helper function
async function checkRateLimit(req: Request): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get client identifier
  let identifier = "unknown";
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        identifier = `user:${user.id}`;
      }
    } catch (error) {
      console.log("Could not extract user from token, using IP");
    }
  }
  
  if (identifier === "unknown") {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
    identifier = `ip:${ip}`;
  }

  const key = `${RATE_LIMIT_CONFIG.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs;

  try {
    // Get current usage from database
    const { data: usage, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('key', key)
      .gte('timestamp', new Date(windowStart).toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, remaining: RATE_LIMIT_CONFIG.maxRequests, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
    }

    const currentUsage = usage?.length || 0;
    const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - currentUsage);
    const allowed = currentUsage < RATE_LIMIT_CONFIG.maxRequests;
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs;

    // Record this request if allowed
    if (allowed) {
      await supabase
        .from('api_usage')
        .insert({
          key,
          timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    }

    return { allowed, remaining, resetTime };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.maxRequests, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
  }
}

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

    // Check rate limit
    // const rateLimitResult = await checkRateLimit(req);
    // if (!rateLimitResult.allowed) {
    //   return new Response(JSON.stringify({
    //     error: "Rate limit exceeded. Please try again later.",
    //     remaining: rateLimitResult.remaining,
    //     resetTime: rateLimitResult.resetTime
    //   }), {
    //     status: 429, // HTTP Status for Rate Limiting
    //     headers: corsHeaders
    //   });
    // }

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
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googlePlacesApiKey}&region=us`;
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
        let lat: number = 0, lng: number = 0;
        let useTextSearch = false;
        let nearbySearchData: any = null;
        
        // Check if location is already coordinates
        const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        
        if (coordMatch) {
          // Use coordinates directly
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        } else {
          // Try to geocode the location
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googlePlacesApiKey}&region=us`;
          const geocodeResponse = await fetch(geocodeUrl);
          
          if (!geocodeResponse.ok) {
            throw new Error(`Geocoding failed: HTTP ${geocodeResponse.status}`);
          }

          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
            // If geocoding fails, use Text Search instead of Nearby Search
            useTextSearch = true;
          } else {
            // Use the first result's coordinates
            const result = geocodeData.results[0];
            lat = result.geometry.location.lat;
            lng = result.geometry.location.lng;
          }
        }

        let restaurants: RestaurantData[] = [];

        if (useTextSearch) {
          // Use Text Search when geocoding fails - can accept addresses directly
          const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${encodeURIComponent(location)}&type=restaurant&key=${googlePlacesApiKey}`;
          
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

          // Filter out non-restaurant places
          const filteredResults = textSearchData.results.filter(place => !shouldExcludePlace(place));
          console.log(`Filtered text search results: ${textSearchData.results.length} -> ${filteredResults.length}`);
          
          // Remove duplicate chain restaurants
          const deduplicatedResults = removeDuplicateChains(filteredResults);
          console.log(`Deduplicated text search results: ${filteredResults.length} -> ${deduplicatedResults.length}`);
          
          // Transform text search results
          restaurants = deduplicatedResults.slice(0, limit || 20).map((place: any) => {
            const priceLevelToString = (level?: number): string => {
              if (!level) return '';
              return '$'.repeat(level);
            };

            // Get main image from photos
            let mainImage = 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop'; // placeholder
            if (place.photos && place.photos.length > 0) {
              mainImage = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photoreference=${place.photos[0].photo_reference}&key=${googlePlacesApiKey}`;
            }

            return {
              id: place.place_id,
              name: place.name,
              image: mainImage,
              rating: place.rating || 0,
              priceRange: priceLevelToString(place.price_level),
              vicinity: place.formatted_address || place.vicinity,
              openingHours: place.opening_hours?.weekday_text || [],
              cuisine: undefined,
              images: undefined,
              distance: undefined,
              estimatedTime: undefined,
              description: undefined,
              tags: [],
              address: undefined,
              phone: undefined,
              website: undefined,
              googleTypes: undefined
            };
          });
        } else {
          // Use Nearby Search with coordinates
          const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius || 5000}&type=restaurant&minprice=${minPrice || 0}&maxprice=${maxPrice || 4}&opennow=${openNow || false}&key=${googlePlacesApiKey}${pageToken ? `&pagetoken=${pageToken}` : ''}`;
          
          const nearbySearchResponse = await fetch(nearbySearchUrl);
          
          if (!nearbySearchResponse.ok) {
            throw new Error(`Nearby search failed: HTTP ${nearbySearchResponse.status}`);
          }

          nearbySearchData = await nearbySearchResponse.json();
          
          if (nearbySearchData.status !== 'OK' || !nearbySearchData.results || nearbySearchData.results.length === 0) {
            return new Response(JSON.stringify({ 
              error: "No restaurants found for the given location",
              status: nearbySearchData.status
            }), {
              status: 400,
              headers: corsHeaders
            });
          }

          // Filter out non-restaurant places
          const filteredResults = nearbySearchData.results.filter(place => !shouldExcludePlace(place));
          console.log(`Filtered nearby search results: ${nearbySearchData.results.length} -> ${filteredResults.length}`);
          
          // Remove duplicate chain restaurants
          const deduplicatedResults = removeDuplicateChains(filteredResults);
          console.log(`Deduplicated nearby search results: ${filteredResults.length} -> ${deduplicatedResults.length}`);
          
          // Transform nearby search results to match your existing format
          restaurants = deduplicatedResults.slice(0, limit || 20).map((place: any) => {
            const priceLevelToString = (level?: number): string => {
              if (!level) return '';
              return '$'.repeat(level);
            };

            // Get main image from photos
            let mainImage = 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop'; // placeholder
            if (place.photos && place.photos.length > 0) {
              mainImage = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=300&photoreference=${place.photos[0].photo_reference}&key=${googlePlacesApiKey}`;
            }

            return {
              id: place.place_id,
              name: place.name,
              image: mainImage,
              rating: place.rating || 0,
              priceRange: priceLevelToString(place.price_level),
              vicinity: place.vicinity,
              openingHours: place.opening_hours?.weekday_text || [],
              cuisine: undefined,
              images: undefined,
              distance: undefined,
              estimatedTime: undefined,
              description: undefined,
              tags: [],
              address: undefined,
              phone: undefined,
              website: undefined,
              googleTypes: undefined
            };
          });
        }

        return new Response(JSON.stringify({
          restaurants,
          nextPageToken: useTextSearch ? undefined : nearbySearchData?.next_page_token
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error in restaurant search:', error);
        return new Response(JSON.stringify({ 
          error: "Restaurant search failed",
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