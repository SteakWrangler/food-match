import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

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

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      useHybrid = true
    } = body;

    if (action !== 'search-restaurants') {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!location) {
      return new Response(JSON.stringify({ error: "Location is required" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    try {
      // Step 1: Get restaurants from Google Places
      const { data: googlePlacesData, error: googleError } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'search-restaurants',
          location,
          radius,
          keyword,
          minPrice,
          maxPrice,
          openNow,
          limit
        },
      });

      if (googleError) {
        throw new Error(`Google Places API error: ${googleError.message}`);
      }

      if (!googlePlacesData || !googlePlacesData.restaurants) {
        throw new Error('No restaurants returned from Google Places API');
      }

      console.log(`Found ${googlePlacesData.restaurants.length} restaurants from Google Places`);

      // Step 2: Process with ChatGPT (with caching)
      const { data: chatGPTData, error: chatGPTError } = await supabase.functions.invoke('chatgpt-processor', {
        body: {
          action: 'process-restaurants',
          restaurants: googlePlacesData.restaurants,
          google_place_id: location
        },
      });

      if (chatGPTError) {
        console.warn('ChatGPT processing failed, using Google Places data only:', chatGPTError.message);
        return new Response(JSON.stringify({
          restaurants: googlePlacesData.restaurants,
          processed_count: 0,
          cache_hits: 0,
          cache_misses: googlePlacesData.restaurants.length
        }), {
          headers: corsHeaders
        });
      }

      if (!chatGPTData || !chatGPTData.restaurants) {
        console.warn('No ChatGPT data returned, using Google Places data only');
        return new Response(JSON.stringify({
          restaurants: googlePlacesData.restaurants,
          processed_count: 0,
          cache_hits: 0,
          cache_misses: googlePlacesData.restaurants.length
        }), {
          headers: corsHeaders
        });
      }

      console.log(`Processed ${chatGPTData.processed_count} restaurants with ChatGPT`);

      // Step 3: Return final data
      return new Response(JSON.stringify({
        restaurants: chatGPTData.restaurants,
        processed_count: chatGPTData.processed_count || 0,
        cache_hits: chatGPTData.cache_hits || 0,
        cache_misses: chatGPTData.cache_misses || 0,
        total_restaurants: chatGPTData.restaurants.length
      }), {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Error in hybrid restaurants function:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        restaurants: []
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

  } catch (error) {
    console.error('Unexpected error in hybrid restaurants function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      restaurants: []
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}); 