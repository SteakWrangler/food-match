import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface OpenCageGeocodeResult {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
  components: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface OpenCageResponse {
  results: OpenCageGeocodeResult[];
  status: {
    code: number;
    message: string;
  };
}

// Function to format address to just city, state, zip
function formatAddress(result: OpenCageGeocodeResult): string {
  const { city, state, postcode } = result.components;
  const parts: string[] = [];
  
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (postcode) parts.push(postcode);
  
  return parts.join(', ');
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const opencageApiKey = Deno.env.get("OPENCAGE_API_KEY");
    
    if (!opencageApiKey) {
      return new Response(JSON.stringify({ 
        error: "Missing OpenCage API key",
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

    const { action, address, lat, lng } = body;

    // Handle geocoding (address to coordinates)
    if (action === 'geocode') {
      if (!address) {
        return new Response(JSON.stringify({ error: "Address is required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${opencageApiKey}&limit=1&countrycode=us`;
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          throw new Error(`Geocoding failed: HTTP ${response.status}`);
        }

        const data: OpenCageResponse = await response.json();
        
        if (data.status.code !== 200 || !data.results || data.results.length === 0) {
          return new Response(JSON.stringify({ 
            error: "No location found",
            status: data.status
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const result = data.results[0];
        const { lat, lng } = result.geometry;
        const formattedAddress = formatAddress(result);

        return new Response(JSON.stringify({ 
          lat, 
          lng, 
          formatted_address: formattedAddress,
          place_id: `${lat},${lng}`, // OpenCage doesn't have place_id, so we create one
          components: result.components
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

    // Handle reverse geocoding (coordinates to address)
    if (action === 'reverse-geocode') {
      if (lat === undefined || lng === undefined) {
        return new Response(JSON.stringify({ error: "Latitude and longitude are required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        const reverseGeocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${opencageApiKey}&limit=1`;
        const response = await fetch(reverseGeocodeUrl);
        
        if (!response.ok) {
          throw new Error(`Reverse geocoding failed: HTTP ${response.status}`);
        }

        const data: OpenCageResponse = await response.json();
        
        if (data.status.code !== 200 || !data.results || data.results.length === 0) {
          return new Response(JSON.stringify({ 
            error: "No address found for the given coordinates",
            status: data.status
          }), {
            status: 400,
            headers: corsHeaders
          });
        }

        const result = data.results[0];
        const formattedAddress = formatAddress(result);

        return new Response(JSON.stringify({ 
          address: formattedAddress,
          place_id: `${lat},${lng}`,
          lat,
          lng,
          components: result.components
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

    // If no valid action is provided
    return new Response(JSON.stringify({ 
      error: "Invalid action. Use 'geocode' or 'reverse-geocode'" 
    }), {
      status: 400,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Unhandled error in geocoding function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
