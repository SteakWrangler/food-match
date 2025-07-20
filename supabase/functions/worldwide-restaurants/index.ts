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

  // Validate API keys
  const zylaApiKey = Deno.env.get("ZYLALABS_API_KEY");
  const opencageApiKey = Deno.env.get("OPENCAGE_API_KEY");
  
  if (!zylaApiKey) {
    return new Response(JSON.stringify({ error: "Missing Zyla Labs API key" }), {
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

  const { action, location, radius = 5000, keyword, minPrice, maxPrice, openNow, lat, lng, limit = 20 } = body;

  // Add a test action to help debug
  if (action === 'test-api-key' || action === 'debug-api-key' || action === 'debug-api-key-v2') {
    const apiKey = Deno.env.get("ZYLALABS_API_KEY");
    
    // Test the API key with a simple request to the location endpoint
    try {
      const testUrl = "https://www.zylalabs.com/api/757/worldwide+restaurants+api/476/search+location";
      const testResponse = await fetch(testUrl, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: "San Diego, CA",
          limit: 1
        })
      });
      
      const testData = await testResponse.json();
      
      return new Response(JSON.stringify({ 
        message: "Function is working",
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        testResponseStatus: testResponse.status,
        testResponseData: testData
      }), {
        headers: corsHeaders
      });
    } catch (testError) {
      return new Response(JSON.stringify({ 
        message: "Function is working",
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        testError: testError.message
      }), {
        headers: corsHeaders
      });
    }
  }

  // Add a new test action to debug the restaurant search step
  if (action === 'test-restaurant-search') {
    const apiKey = Deno.env.get("ZYLALABS_API_KEY");
    
    try {
      // First get location ID
      const locationUrl = "https://www.zylalabs.com/api/757/worldwide+restaurants+api/476/search+location";
      const locationResponse = await fetch(locationUrl, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: "San Diego, CA",
          limit: 1
        })
      });
      
      const locationData = await locationResponse.json();
      console.log('Location response:', locationData);
      
      if (!locationData.results || !locationData.results.data || locationData.results.data.length === 0) {
        return new Response(JSON.stringify({ 
          error: "No location found",
          locationData: locationData
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      const locationId = locationData.results.data[0].result_object.location_id;
      console.log('Location ID:', locationId);
      
      // Now test restaurant search
      const restaurantUrl = "https://www.zylalabs.com/api/757/worldwide+restaurants+api/477/search+restaurants+in+location";
      const restaurantResponse = await fetch(restaurantUrl, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location_id: locationId,
          limit: 5
        })
      });
      
      console.log('Restaurant response status:', restaurantResponse.status);
      
      if (!restaurantResponse.ok) {
        const errorText = await restaurantResponse.text();
        return new Response(JSON.stringify({ 
          error: `Restaurant search failed: HTTP ${restaurantResponse.status}`,
          details: errorText,
          locationId: locationId
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      const restaurantData = await restaurantResponse.json();
      
      return new Response(JSON.stringify({ 
        message: "Restaurant search test successful",
        locationId: locationId,
        restaurantData: restaurantData
      }), {
        headers: corsHeaders
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Test failed",
        details: error.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // Helper function to convert coordinates to address using OpenCage
  async function coordinatesToAddress(lat: number, lng: number): Promise<string> {
    if (!opencageApiKey) {
      console.log('OpenCage API key not available, returning coordinates as address');
      return `${lat}, ${lng}`;
    }

    try {
      const opencageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${opencageApiKey}&no_annotations=1`;
      console.log(`Calling OpenCage API: ${opencageUrl}`);
      
      const response = await fetch(opencageUrl);
      
      if (!response.ok) {
        console.log(`OpenCage API error: ${response.status}`);
        return `${lat}, ${lng}`;
      }

      const data = await response.json();
      console.log('OpenCage response:', data);
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        // Build a readable address
        const city = components.city || components.town || components.village;
        const state = components.state;
        const country = components.country;
        
        if (city && state) {
          return `${city}, ${state}`;
        } else if (city) {
          return city;
        } else {
          return `${lat}, ${lng}`;
        }
      }
      
      return `${lat}, ${lng}`;
    } catch (error) {
      console.log('OpenCage API error:', error.message);
      return `${lat}, ${lng}`;
    }
  }

  // Handle reverse geocoding
  if (action === 'reverse-geocode') {
    if (!lat || !lng) {
      return new Response(JSON.stringify({ error: "Latitude and longitude are required" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const address = await coordinatesToAddress(lat, lng);
    return new Response(JSON.stringify({ address }), {
      headers: corsHeaders
    });
  }

  // Handle restaurant search
  if (action === 'search-restaurants' || !action) {
    console.log(`Restaurant search called with action: ${action}, location: ${location}`);
    
    if (!location) {
      console.log('Location is missing');
      return new Response(JSON.stringify({ error: "Location is required" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // API key is already validated above

    // Check if location is coordinates (e.g., "32.71562, -117.1558")
    const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    let searchQuery = location;
    
    if (coordMatch) {
      // If coordinates are provided, convert them to an address using OpenCage
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      console.log(`Coordinates detected: ${lat}, ${lng}`);
      
      // Convert coordinates to address
      searchQuery = await coordinatesToAddress(lat, lng);
      console.log(`Converted coordinates to address: ${searchQuery}`);
      
      // If OpenCage failed and returned raw coordinates, try to use a fallback
      if (searchQuery === `${lat}, ${lng}`) {
        console.log('OpenCage failed, trying to determine city from coordinates');
        
        // Simple fallback: try to determine the city based on coordinates
        if (lat >= 28.4 && lat <= 28.6 && lng >= -81.3 && lng <= -81.1) {
          searchQuery = 'Orlando, FL';
          console.log('Detected Orlando area, using Orlando, FL');
        } else if (lat >= 32.6 && lat <= 32.9 && lng >= -117.2 && lng <= -117.0) {
          searchQuery = 'San Diego, CA';
          console.log('Detected San Diego area, using San Diego, CA');
        } else if (lat >= 40.6 && lat <= 40.8 && lng >= -74.1 && lng <= -73.9) {
          searchQuery = 'New York, NY';
          console.log('Detected New York area, using New York, NY');
        } else if (lat >= 34.0 && lat <= 34.2 && lng >= -118.3 && lng <= -118.1) {
          searchQuery = 'Los Angeles, CA';
          console.log('Detected Los Angeles area, using Los Angeles, CA');
        } else if (lat >= 41.8 && lat <= 42.0 && lng >= -87.7 && lng <= -87.5) {
          searchQuery = 'Chicago, IL';
          console.log('Detected Chicago area, using Chicago, IL');
        } else if (lat >= 25.7 && lat <= 25.8 && lng >= -80.2 && lng <= -80.1) {
          searchQuery = 'Miami, FL';
          console.log('Detected Miami area, using Miami, FL');
        }
      }
    }
    
    console.log(`Using search query: ${searchQuery}`);

    // Step 1: Get location ID using the search location endpoint
    const locationSearchUrl = "https://www.zylalabs.com/api/757/worldwide+restaurants+api/476/search+location";
    
    console.log(`Step 1: Searching for location ID at: ${locationSearchUrl}`);
    
    try {
      // First, get the location ID
      const locationResponse = await fetch(locationSearchUrl, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${zylaApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 1
        })
      });

      console.log(`Location search response status: ${locationResponse.status}`);
      
      if (!locationResponse.ok) {
        const locationError = await locationResponse.text();
        return new Response(JSON.stringify({ 
          error: `Location search failed: HTTP ${locationResponse.status}`,
          details: locationError
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const locationData = await locationResponse.json();
      console.log(`Location search response:`, locationData);

      if (!locationData.results || !locationData.results.data || locationData.results.data.length === 0) {
        return new Response(JSON.stringify({ 
          error: "No location found for the given coordinates"
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const locationId = locationData.results.data[0].result_object.location_id;
      console.log(`Found location ID: ${locationId}`);

      // Step 2: Search for restaurants using the location ID
      const restaurantsUrl = "https://www.zylalabs.com/api/757/worldwide+restaurants+api/477/search+restaurants+in+location";
      
      console.log(`Step 2: Searching for restaurants with location ID: ${locationId}`);
      
      const restaurantSearchBody = {
        location_id: locationId,
        limit: limit
      };

      if (keyword) {
        (restaurantSearchBody as any).query = keyword;
      }

      console.log(`Making restaurant search request with body:`, restaurantSearchBody);
      console.log(`Requesting ${limit} restaurants from Zyla Labs API`);

      const restaurantsResponse = await fetch(restaurantsUrl, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${zylaApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(restaurantSearchBody)
      });

      console.log(`Restaurant search response status: ${restaurantsResponse.status}`);
      console.log(`Restaurant search response headers:`, Object.fromEntries(restaurantsResponse.headers.entries()));

      if (!restaurantsResponse.ok) {
        const restaurantError = await restaurantsResponse.text();
        console.error(`Restaurant search failed: HTTP ${restaurantsResponse.status}`);
        console.error(`Error details:`, restaurantError);
        console.error(`Request body that failed:`, restaurantSearchBody);
        console.error(`Location ID:`, locationId);
        return new Response(JSON.stringify({ 
          error: `Restaurant search failed: HTTP ${restaurantsResponse.status}`,
          details: restaurantError,
          requestBody: restaurantSearchBody,
          locationId: locationId
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const restaurantsData = await restaurantsResponse.json();
      console.log(`Restaurant search response:`, restaurantsData);

      // Check if we have restaurant data - the API returns data in a specific structure
      console.log('API response structure:', typeof restaurantsData, restaurantsData);
      
      // The API returns data in a specific structure with results.data
      if (!restaurantsData || !restaurantsData.results || !restaurantsData.results.data) {
        console.log('No valid restaurant data found in response');
        return new Response(JSON.stringify({ 
          error: `No restaurants found for the given location`,
          apiResponse: restaurantsData
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Extract the restaurant array from the API response
      const restaurantArray = restaurantsData.results.data;
      
      if (restaurantArray.length === 0) {
        return new Response(JSON.stringify({ 
          error: `No restaurants found for the given location`,
          apiResponse: restaurantsData
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Transform the API response to match our Restaurant interface
      const restaurants = restaurantArray.map((place: any) => {
        // Extract cuisine from the cuisine array if it exists
        let cuisine = null;
        if (place.cuisine && Array.isArray(place.cuisine) && place.cuisine.length > 0) {
          cuisine = place.cuisine[0].name || place.cuisine[0];
        } else if (place.cuisine) {
          cuisine = place.cuisine;
        }

        // Extract tags from cuisine array
        const tags = place.cuisine && Array.isArray(place.cuisine) 
          ? place.cuisine.map((c: any) => c.name || c).filter(Boolean)
          : [];

        // Extract images from photo structure
        let image: string | null = null;
        let images: string[] = [];
        
        if (place.photo && place.photo.images) {
          // Extract all available images
          const photoImages = place.photo.images;
          
          // Add images in order of preference: original, large, medium, small
          if (photoImages.original && photoImages.original.url) {
            images.push(photoImages.original.url);
          }
          if (photoImages.large && photoImages.large.url) {
            images.push(photoImages.large.url);
          }
          if (photoImages.medium && photoImages.medium.url) {
            images.push(photoImages.medium.url);
          }
          if (photoImages.small && photoImages.small.url) {
            images.push(photoImages.small.url);
          }
          
          // Set the primary image (first one available)
          if (images.length > 0) {
            image = images[0];
            // Remove the primary image from the additional images array
            images = images.slice(1);
          }
        } else if (place.image) {
          image = place.image;
        }

        return {
          id: place.location_id || place.id || `restaurant_${Math.random().toString(36).substr(2, 9)}`,
          name: place.name || "Unknown Restaurant",
          cuisine: cuisine,
          image: image,
          images: images.length > 0 ? images : undefined, // Only include if there are additional images
          rating: place.rating ? parseFloat(place.rating) : null,
          priceRange: place.price_level || place.price || null,
          distance: null, // Distance calculation removed since we don't have search coordinates
          estimatedTime: null, // Time estimation removed since we don't have search coordinates
          description: place.description || null,
          tags: tags,
          address: place.address || null,
          phone: place.phone || null,
          website: place.website || place.web_url || null,
          openingHours: place.hours?.week_ranges || [],
          debug: {
            originalData: place
          }
        };
      });

      console.log(`Found ${restaurants.length} restaurants`);

      return new Response(JSON.stringify({ restaurants }), {
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error calling Worldwide Restaurants API:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch restaurants from Zyla Labs API",
        details: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // If no valid action is provided
  return new Response(JSON.stringify({ error: "Invalid action. Use 'search-restaurants' or 'reverse-geocode'" }), {
    status: 400,
    headers: corsHeaders
  });
  } catch (error) {
    console.error('Unhandled error in function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

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
    return `${Math.round(distance * 5280)} ft`;
  } else {
    return `${distance.toFixed(1)} mi`;
  }
}

function estimateDeliveryTime(distance: string): string {
  const distanceValue = parseFloat(distance.replace(/[^\d.]/g, ''));
  const unit = distance.includes('ft') ? 'ft' : 'mi';
  
  if (unit === 'ft') {
    return "10-15 min";
  } else if (distanceValue <= 1) {
    return "15-20 min";
  } else if (distanceValue <= 3) {
    return "20-30 min";
  } else if (distanceValue <= 5) {
    return "30-45 min";
  } else {
    return "45+ min";
  }
} 