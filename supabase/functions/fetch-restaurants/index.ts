import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// TODO: Import OpenAI API client for Deno or use fetch
// TODO: Import Supabase client for Deno

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TODO: Set your OpenAI API key as an environment variable in Supabase
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Function to get cuisine-specific images with better fallbacks
function getCuisineImage(cuisine: string, amenity: string, name: string) {
  // Map of cuisine types to their corresponding images
  const cuisineImages: { [key: string]: string } = {
    'italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'chinese': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
    'japanese': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'mexican': 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
    'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    'french': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    'american': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'thai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    'greek': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'korean': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'vietnamese': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'mediterranean': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'seafood': 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop',
    'steakhouse': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'coffee': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'fast_food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
    'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    'pub': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    'bbq': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'lobster': 'https://images.unsplash.com/photo-1565680018434-b513d5573b07?w=400&h=300&fit=crop',
    'diner': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'sandwich': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'wings': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
    'chicken': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
    'tacos': 'https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop',
    'donuts': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'bakery': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'pasta': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'
  };

  // Normalize the cuisine string
  const normalizedCuisine = cuisine.toLowerCase().trim();
  
  // Try exact match first
  if (cuisineImages[normalizedCuisine]) {
    return cuisineImages[normalizedCuisine];
  }

  // Try matching parts of the cuisine string
  const cuisineParts = normalizedCuisine.split(/[;,]/).map(part => part.trim());
  for (const part of cuisineParts) {
    if (cuisineImages[part]) {
      return cuisineImages[part];
    }
  }

  // If no cuisine match, check amenity
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

// Function to parse and clean cuisine tags - now returns multiple tags
function parseCuisineTags(cuisineString: string): string[] {
  if (!cuisineString) return ['Restaurant'];
  
  return cuisineString
    .split(';')
    .map(tag => formatDisplayText(tag.trim()))
    .filter(tag => tag && tag !== 'Restaurant')
    .slice(0, 4); // Allow up to 4 tags
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

// Helper to call OpenAI Chat API
async function fetchRestaurantsFromChatGPT(location: string, alreadyShown: string[], limit: number) {
  const prompt = `List up to ${limit} real, well-known, and verifiable restaurants in the ${location} area that have not already been listed: [${alreadyShown.map(n => `\"${n}\"`).join(', ')}]. For each, provide: name, cuisine, a short description, a plausible average rating (1-5), a sample menu item and price, and a plausible price range ($, $$, $$$, $$$$). Only include restaurants you are certain exist and are well-known. If you are unsure, do not include them. If there are fewer than ${limit}, only list the ones you are certain about. Format as JSON.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that only provides real, verifiable restaurant data." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1200,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  const data = await response.json();
  let restaurants: any[] = [];
  try {
    const text = data.choices[0].message.content;
    restaurants = JSON.parse(text);
  } catch (e) {
    restaurants = [];
  }
  return restaurants;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, alreadyShown = [], limit = 10 } = await req.json();
    if (!location) {
      return new Response(JSON.stringify({ error: 'Missing location' }), { status: 400, headers: corsHeaders });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

    // Get cached restaurants for this location
    const { data: cachedRestaurants, error: cacheError } = await supabase
      .from('restaurant_cache')
      .select('*')
      .eq('location', location)
      .not('name', 'in', `(${alreadyShown.map(n => `'${n}'`).join(',')})`)
      .limit(limit);

    if (cacheError) {
      console.error('Error fetching from cache:', cacheError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from cache' }),
        { status: 500, headers: corsHeaders }
      );
    }

    let newRestaurants = [];
    if (cachedRestaurants && cachedRestaurants.length > 0) {
      // Transform cached restaurants to match the expected format
      newRestaurants = cachedRestaurants.map(restaurant => ({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        rating: restaurant.rating,
        priceRange: restaurant.price_range,
        sampleMenuItem: restaurant.sample_menu_item,
        samplePrice: restaurant.sample_price,
        image: getCuisineImage(restaurant.cuisine, '', restaurant.name)
      }));
    }

    // If we need more restaurants, fetch from ChatGPT
    if (newRestaurants.length < limit) {
      const needed = limit - newRestaurants.length;
      const chatRestaurants = await fetchRestaurantsFromChatGPT(
        location,
        [...alreadyShown, ...newRestaurants.map(r => r.name)],
        needed
      );

      if (chatRestaurants && chatRestaurants.length > 0) {
        // Store new restaurants in cache
        const { error: insertError } = await supabase
          .from('restaurant_cache')
          .insert(
            chatRestaurants.map(restaurant => ({
              id: Math.random().toString(36).substr(2, 9),
              location,
              name: restaurant.name,
              cuisine: restaurant.cuisine,
              description: restaurant.description,
              rating: restaurant.rating,
              price_range: restaurant.priceRange,
              sample_menu_item: restaurant.sampleMenuItem,
              sample_price: restaurant.samplePrice
            }))
          );

        if (insertError) {
          console.error('Error storing in cache:', insertError);
        }

        // Add new restaurants to the response
        newRestaurants = [
          ...newRestaurants,
          ...chatRestaurants.map(restaurant => ({
            ...restaurant,
            image: getCuisineImage(restaurant.cuisine, '', restaurant.name)
          }))
        ];
      }
    }

    if (!newRestaurants || newRestaurants.length === 0) {
      return new Response(
        JSON.stringify({ 
          restaurants: [], 
          hasMore: false,
          message: 'No options available or service is not working right now.' 
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Check if we have more results available
    const hasMore = newRestaurants.length >= limit;

    return new Response(
      JSON.stringify({ 
        restaurants: newRestaurants,
        hasMore: hasMore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
