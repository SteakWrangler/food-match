import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Validate API key first
  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
      headers: corsHeaders
    });
  }

  // Parse request body with proper error handling
  let body: any;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const { location, radius = 5000, keyword, minPrice, maxPrice, openNow } = body;
  if (!location) {
    return new Response(JSON.stringify({ error: "Location is required" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // First, geocode the location
  const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  geocodeUrl.searchParams.set("address", location);
  geocodeUrl.searchParams.set("key", apiKey);

  const geocodeResponse = await fetch(geocodeUrl.toString());
  const geocodeData = await geocodeResponse.json();

  if (geocodeData.status !== "OK" || !geocodeData.results.length) {
    return new Response(JSON.stringify({ error: `Could not geocode location: ${location}` }), {
      status: 400,
      headers: corsHeaders
    });
  }

  const { lat, lng } = geocodeData.results[0].geometry.location;

  // Now search for restaurants
  const placesUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  placesUrl.searchParams.set("location", `${lat},${lng}`);
  placesUrl.searchParams.set("radius", radius.toString());
  placesUrl.searchParams.set("type", "restaurant");
  placesUrl.searchParams.set("key", apiKey);
  if (keyword) {
    placesUrl.searchParams.set("keyword", keyword);
  }
  if (minPrice !== undefined && minPrice !== null) {
    placesUrl.searchParams.set("minprice", String(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    placesUrl.searchParams.set("maxprice", String(maxPrice));
  }
  if (openNow) {
    placesUrl.searchParams.set("opennow", "true");
  }

  const placesResponse = await fetch(placesUrl.toString());
  const placesData = await placesResponse.json();

  if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
    return new Response(JSON.stringify({ error: `Google Places API error: ${placesData.status}` }), {
      status: 400,
      headers: corsHeaders
    });
  }

  // Transform the data to match your app's format
  const restaurants = (placesData.results || []).map((place: any) => ({
    id: place.place_id,
    name: place.name,
    cuisine: getCuisineFromTypes(place.types),
    image: getImageUrl(place.photos, apiKey),
    rating: place.rating || 4.0,
    priceRange: getPriceRange(place.price_level),
    distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
    estimatedTime: estimateDeliveryTime(calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)),
    description: generateDescription(place.name, place.types),
    tags: getTagsFromTypes(place.types)
  }));

  return new Response(JSON.stringify({ restaurants }), {
    headers: corsHeaders
  });
});

function getCuisineFromTypes(types: any): string {
  if (!types || !Array.isArray(types)) return "Restaurant";
  const cuisineTypes = [
    "restaurant", "food", "meal_takeaway", "meal_delivery", "mexican_restaurant", "chinese_restaurant", "japanese_restaurant", "italian_restaurant", "indian_restaurant", "thai_restaurant", "american_restaurant", "french_restaurant", "greek_restaurant", "spanish_restaurant", "mediterranean_restaurant", "middle_eastern_restaurant", "vietnamese_restaurant", "korean_restaurant", "filipino_restaurant", "caribbean_restaurant", "latin_american_restaurant", "african_restaurant"
  ];
  for (const type of types) {
    if (cuisineTypes.includes(type)) {
      return type.replace("_restaurant", "").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  }
  return "Restaurant";
}

function getPriceRange(priceLevel: any): string {
  if (!priceLevel) return "$$";
  switch (priceLevel) {
    case 1: return "$";
    case 2: return "$$";
    case 3: return "$$$";
    case 4: return "$$$$";
    default: return "$$";
  }
}

function getImageUrl(photos: any, apiKey: string): string {
  if (!photos || photos.length === 0 || !apiKey) {
    return "https://images.unsplash.com/photo-1565299585323-38174c5833ca?w=400&h=300&fit=crop";
  }
  const photo = photos[0];
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} ft`;
  }
  return `${distance.toFixed(1)} mi`;
}

function estimateDeliveryTime(distance: string): string {
  const distanceValue = parseFloat(distance.replace(/[^\d.]/g, ""));
  const isFeet = distance.includes("ft");
  if (isFeet) {
    return "5 min";
  } else if (distanceValue <= 0.5) {
    return "10 min";
  } else if (distanceValue <= 1) {
    return "15 min";
  } else if (distanceValue <= 2) {
    return "25 min";
  } else {
    return "35 min";
  }
}

function generateDescription(name: string, types: any): string {
  const cuisine = getCuisineFromTypes(types);
  const isFastFood = types && types.includes("fast_food_restaurant");
  const isCasual = types && types.includes("casual_restaurant");
  const isFineDining = types && types.includes("fine_dining_restaurant");
  if (isFastFood) {
    return `Quick-service ${cuisine.toLowerCase()} restaurant offering fast and convenient dining options.`;
  } else if (isCasual) {
    return `Casual ${cuisine.toLowerCase()} restaurant perfect for a relaxed dining experience.`;
  } else if (isFineDining) {
    return `Upscale ${cuisine.toLowerCase()} restaurant offering an elegant dining experience.`;
  } else {
    return `${cuisine} restaurant serving delicious food in a welcoming atmosphere.`;
  }
}

function getTagsFromTypes(types: any): any[] {
  if (!types || !Array.isArray(types)) return ["Restaurant"];
  const tags: any[] = [];
  const cuisine = getCuisineFromTypes(types);
  if (cuisine !== "Restaurant") tags.push(cuisine);
  if (types.includes("meal_takeaway")) tags.push("Takeout");
  if (types.includes("meal_delivery")) tags.push("Delivery");
  if (types.includes("dine_in")) tags.push("Dine-in");
  if (types.includes("breakfast_restaurant")) tags.push("Breakfast");
  if (types.includes("lunch_restaurant")) tags.push("Lunch");
  if (types.includes("dinner_restaurant")) tags.push("Dinner");
  if (types.includes("fast_food_restaurant")) tags.push("Fast Food");
  if (types.includes("casual_restaurant")) tags.push("Casual Dining");
  if (types.includes("fine_dining_restaurant")) tags.push("Fine Dining");
  return tags.length > 0 ? tags : ["Restaurant"];
} 