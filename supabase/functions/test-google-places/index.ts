import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
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

    // Test the API key with a simple Places API call
    try {
      // Test with a simple text search for restaurants in San Diego
      const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+San+Diego&key=${googlePlacesApiKey}`;
      
      console.log('Testing Google Places API with URL:', testUrl);
      
      const response = await fetch(testUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ 
          error: `Google Places API test failed: HTTP ${response.status}`,
          details: errorText,
          hasApiKey: true,
          apiKeyLength: googlePlacesApiKey.length
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({ 
        message: "Google Places API test successful",
        hasApiKey: true,
        apiKeyLength: googlePlacesApiKey.length,
        responseStatus: response.status,
        resultsCount: data.results?.length || 0,
        status: data.status,
        sampleResult: data.results?.[0] ? {
          name: data.results[0].name,
          place_id: data.results[0].place_id,
          rating: data.results[0].rating,
          price_level: data.results[0].price_level,
          types: data.results[0].types
        } : null
      }), {
        headers: corsHeaders
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Google Places API test failed",
        details: error.message,
        hasApiKey: true,
        apiKeyLength: googlePlacesApiKey.length
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  } catch (error) {
    console.error('Unhandled error in test function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}); 