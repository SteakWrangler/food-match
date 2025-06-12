import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to get cuisine-specific images
function getCuisineImage(cuisine: string, amenity: string, name: string) {
  const cuisineImages: { [key: string]: string } = {
    'italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'chinese': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
    'japanese': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'mexican': 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
    'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    'french': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    'american': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'thai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'coffee': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'fast_food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
    'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    'pub': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    'bbq': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'seafood': 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop',
    'steakhouse': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    'mediterranean': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'greek': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'korean': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'vietnamese': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'lobster': 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop',
    'diner': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'sandwich': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'wings': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
    'chicken': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
    'tacos': 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
    'donuts': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'bakery': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop'
  };

  const lowerName = name.toLowerCase();
  
  // First check the actual cuisine tags from the restaurant data
  if (cuisine) {
    const cuisineWords = cuisine.toLowerCase().split(';').map(c => c.trim());
    
    for (const word of cuisineWords) {
      // Direct matches for cuisine types
      if (cuisineImages[word]) {
        return cuisineImages[word];
      }
      
      // Check for partial matches in cuisine names
      if (word.includes('mexican') || word.includes('taco')) return cuisineImages['mexican'];
      if (word.includes('italian') || word.includes('pizza')) return cuisineImages['italian'];
      if (word.includes('chinese') || word.includes('asian')) return cuisineImages['chinese'];
      if (word.includes('japanese') || word.includes('sushi')) return cuisineImages['japanese'];
      if (word.includes('indian') || word.includes('curry')) return cuisineImages['indian'];
      if (word.includes('thai')) return cuisineImages['thai'];
      if (word.includes('french')) return cuisineImages['french'];
      if (word.includes('american')) return cuisineImages['american'];
      if (word.includes('mediterranean') || word.includes('greek')) return cuisineImages['mediterranean'];
      if (word.includes('korean')) return cuisineImages['korean'];
      if (word.includes('vietnamese')) return cuisineImages['vietnamese'];
      if (word.includes('seafood') || word.includes('fish')) return cuisineImages['seafood'];
    }
  }

  // Fallback to restaurant name analysis
  if (lowerName.includes('red lobster') || lowerName.includes('lobster')) return cuisineImages['lobster'];
  if (lowerName.includes('pizza') || lowerName.includes('domino') || lowerName.includes('papa')) return cuisineImages['pizza'];
  if (lowerName.includes('burger') || lowerName.includes('mcdonald') || lowerName.includes('burger king') || lowerName.includes('five guys') || lowerName.includes('shake shack') || lowerName.includes('whataburger')) return cuisineImages['burger'];
  if (lowerName.includes('sushi') || lowerName.includes('japanese') || lowerName.includes('sake')) return cuisineImages['sushi'];
  if (lowerName.includes('coffee') || lowerName.includes('starbucks') || lowerName.includes('cafe') || lowerName.includes('dunkin')) return cuisineImages['coffee'];
  if (lowerName.includes('steakhouse') || lowerName.includes('steak') || lowerName.includes('outback')) return cuisineImages['steakhouse'];
  if (lowerName.includes('bbq') || lowerName.includes('barbecue') || lowerName.includes('smokehouse')) return cuisineImages['bbq'];
  if (lowerName.includes('seafood') || lowerName.includes('fish') || lowerName.includes('crab') || lowerName.includes('shrimp')) return cuisineImages['seafood'];
  if (lowerName.includes('taco') || lowerName.includes('mexican') || lowerName.includes('burrito') || lowerName.includes('chipotle')) return cuisineImages['mexican'];
  if (lowerName.includes('chinese') || lowerName.includes('panda') || lowerName.includes('wok')) return cuisineImages['chinese'];

  // Check for amenity type
  const lowerAmenity = amenity ? amenity.toLowerCase() : '';
  if (lowerAmenity === 'fast_food') return cuisineImages['fast_food'];
  if (lowerAmenity === 'cafe') return cuisineImages['cafe'];
  if (lowerAmenity === 'bar' || lowerAmenity === 'pub') return cuisineImages['bar'];

  // Final fallback to american food
  return cuisineImages['american'];
}

// Function to format display text (remove underscores, capitalize, handle semicolons)
function formatDisplayText(text: string): string {
  if (!text) return 'Restaurant';
  
  // Handle semicolon-separated values by taking the first one
  const firstValue = text.split(';')[0].trim();
  
  return firstValue
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Function to parse and clean cuisine tags
function parseCuisineTags(cuisineString: string): string[] {
  if (!cuisineString) return [];
  
  return cuisineString
    .split(';')
    .map(tag => formatDisplayText(tag.trim()))
    .filter(tag => tag && tag !== 'Restaurant')
    .slice(0, 3); // Limit to 3 tags max for UI cleanliness
}

// Function to determine price range based on amenity and cuisine
function determinePriceRange(amenity: string, cuisine: string, name: string): string {
  const lowerName = name.toLowerCase();
  const lowerAmenity = amenity ? amenity.toLowerCase() : '';
  const lowerCuisine = cuisine ? cuisine.toLowerCase() : '';

  // Fast food and cafes are typically cheaper
  if (lowerAmenity === 'fast_food' || 
      lowerName.includes('mcdonald') || 
      lowerName.includes('burger king') ||
      lowerName.includes('subway') ||
      lowerName.includes('taco bell') ||
      lowerName.includes('kfc') ||
      lowerName.includes('domino') ||
      lowerName.includes('papa johns')) {
    return '$';
  }

  // Coffee shops and casual cafes
  if (lowerAmenity === 'cafe' || 
      lowerName.includes('starbucks') ||
      lowerName.includes('dunkin') ||
      lowerName.includes('coffee') ||
      lowerName.includes('cafe')) {
    return '$';
  }

  // Steakhouses and fine dining are more expensive
  if (lowerName.includes('steakhouse') ||
      lowerName.includes('outback') ||
      lowerCuisine === 'french' || 
      lowerCuisine === 'fine_dining' ||
      lowerName.includes('fine dining') ||
      lowerName.includes('michelin')) {
    return '$$$';
  }

  // Most regular restaurants fall in the middle
  return '$$';
}

// Function to calculate restaurant priority score
function calculatePriority(tags: any, name: string): number {
  let score = 0;
  const lowerName = name.toLowerCase();
  const amenity = tags.amenity || '';
  const cuisine = tags.cuisine || '';

  // Prioritize actual restaurants over cafes/fast food
  if (amenity === 'restaurant') score += 100;
  if (amenity === 'fast_food') score += 30;
  if (amenity === 'cafe') score += 20;

  // Significantly deprioritize chains that shouldn't be first options
  if (lowerName.includes('starbucks') || 
      lowerName.includes('mcdonald') ||
      lowerName.includes('subway') ||
      lowerName.includes('burger king') ||
      lowerName.includes('dunkin') ||
      lowerName.includes('taco bell') ||
      lowerName.includes('kfc')) {
    score -= 80;
  }

  // Boost score for diverse cuisines
  if (cuisine && cuisine !== 'regional' && cuisine !== 'fast_food') score += 40;

  // Boost score for restaurants with good keywords
  if (lowerName.includes('restaurant') || 
      lowerName.includes('bistro') ||
      lowerName.includes('grill') ||
      lowerName.includes('kitchen') ||
      lowerName.includes('house') ||
      lowerName.includes('tavern')) {
    score += 30;
  }

  return score;
}

// Function to geocode location using Nominatim (free)
async function geocodeLocation(location: string) {
  console.log(`Geocoding location: ${location}`)
  
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
    {
      headers: {
        'User-Agent': 'FoodMatch-App/1.0',
      },
    }
  )
  
  if (!response.ok) {
    console.error(`Geocoding failed: ${response.status}`)
    throw new Error('Geocoding failed')
  }
  
  const data = await response.json()
  console.log(`Geocoding response:`, data)
  
  if (data.length === 0) {
    throw new Error('Location not found')
  }
  
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  }
}

// Function to fetch restaurants from OpenStreetMap
async function fetchRestaurantsFromOSM(lat: number, lon: number, radius: number, limit: number) {
  console.log(`Fetching restaurants around ${lat}, ${lon} within ${radius}m`)
  
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radius},${lat},${lon});
      way["amenity"="restaurant"](around:${radius},${lat},${lon});
      node["amenity"="fast_food"](around:${radius},${lat},${lon});
      way["amenity"="fast_food"](around:${radius},${lat},${lon});
      node["amenity"="cafe"](around:${radius},${lat},${lon});
      way["amenity"="cafe"](around:${radius},${lat},${lon});
    );
    out center meta;
  `
  
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(overpassQuery)}`
  })
  
  if (!response.ok) {
    console.error(`Overpass API error: ${response.status}`)
    throw new Error(`Overpass API error: ${response.status}`)
  }
  
  const data = await response.json()
  console.log(`Found ${data.elements.length} places from OSM`)
  return data.elements
}

// Function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

serve(async (req) => {
  console.log(`${req.method} request received`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, radius = 5000, limit = 20 } = await req.json()
    console.log(`Processing request for location: ${location}, radius: ${radius}, limit: ${limit}`)
    
    // Geocode the location
    const coords = await geocodeLocation(location)
    console.log(`Geocoded to: ${coords.lat}, ${coords.lon}`)
    
    // Fetch restaurants from OpenStreetMap
    const osmData = await fetchRestaurantsFromOSM(coords.lat, coords.lon, radius, limit * 3)
    
    // Transform OSM data to match our Restaurant interface
    const restaurants = osmData
      .filter((element: any) => element.tags && element.tags.name)
      .map((element: any) => {
        const tags = element.tags
        const lat = element.lat || element.center?.lat
        const lon = element.lon || element.center?.lon
        
        if (!lat || !lon) return null
        
        const distance = calculateDistance(coords.lat, coords.lon, lat, lon)
        const rawCuisine = tags.cuisine || tags.amenity || 'restaurant'
        const cuisine = formatDisplayText(rawCuisine)
        const rating = parseFloat((4.0 + Math.random() * 1).toFixed(1))
        const priceRange = determinePriceRange(tags.amenity || '', tags.cuisine || '', tags.name)
        const priority = calculatePriority(tags, tags.name)
        
        // Use the actual cuisine data for image selection
        const image = getCuisineImage(tags.cuisine || '', tags.amenity || '', tags.name)
        
        // Parse cuisine tags properly
        const cuisineTags = parseCuisineTags(tags.cuisine || '');
        const finalTags = [
          cuisine,
          priceRange,
          'Local Favorite'
        ].filter(Boolean);

        return {
          id: element.id.toString(),
          name: tags.name,
          cuisine: cuisine,
          image: image,
          rating: rating,
          priceRange: priceRange,
          distance: `${distance.toFixed(1)} mi`,
          estimatedTime: `${Math.ceil(distance * 3)} min`,
          description: `${cuisine} restaurant located in ${location}`,
          tags: finalTags,
          priority: priority
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        // Sort by priority (high to low), then by distance (low to high)
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return parseFloat(a.distance) - parseFloat(b.distance);
      })
      .slice(0, limit)
      .map((restaurant: any) => {
        const { priority, ...finalRestaurant } = restaurant;
        return finalRestaurant;
      });

    console.log(`Returning ${restaurants.length} restaurants`)

    return new Response(
      JSON.stringify({ restaurants }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
