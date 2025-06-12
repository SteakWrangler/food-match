
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to get cuisine-specific images
function getCuisineImage(cuisine: string, amenity: string) {
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
    'fast_food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop'
  };

  // Check for specific cuisine first
  const lowerCuisine = cuisine.toLowerCase();
  if (cuisineImages[lowerCuisine]) {
    return cuisineImages[lowerCuisine];
  }

  // Check for amenity type
  if (cuisineImages[amenity]) {
    return cuisineImages[amenity];
  }

  // Default restaurant image
  return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop';
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
    const osmData = await fetchRestaurantsFromOSM(coords.lat, coords.lon, radius, limit * 3) // Fetch more to filter later
    
    // Transform OSM data to match our Restaurant interface
    const restaurants = osmData
      .filter((element: any) => element.tags && element.tags.name) // Only include places with names
      .map((element: any) => {
        const tags = element.tags
        const lat = element.lat || element.center?.lat
        const lon = element.lon || element.center?.lon
        
        if (!lat || !lon) return null
        
        const distance = calculateDistance(coords.lat, coords.lon, lat, lon)
        const cuisine = tags.cuisine || tags.amenity || 'Restaurant'
        const rating = parseFloat((4.0 + Math.random() * 1).toFixed(1)) // Format to 1 decimal place
        
        return {
          id: element.id.toString(),
          name: tags.name,
          cuisine: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
          image: getCuisineImage(tags.cuisine || '', tags.amenity || ''),
          rating: rating,
          priceRange: ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
          distance: `${distance.toFixed(1)} mi`,
          estimatedTime: `${Math.ceil(distance * 3)} min`,
          description: `${tags.cuisine ? `Delicious ${tags.cuisine} cuisine` : 'Great local restaurant'} located in ${location}`,
          tags: [
            cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
            ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
            'Local Favorite'
          ].filter(Boolean)
        }
      })
      .filter(Boolean) // Remove null entries
      .sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance)) // Sort by distance
      .slice(0, limit) // Limit results

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
