import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simplified ChatGPT processor - only generates descriptions (no caching)
// TODO: Tag functionality commented out - can be restored later if needed

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
  // tags: string[]; // COMMENTED OUT - can be restored later
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  googleTypes?: string[];
  processedByChatGPT?: boolean;
  chatGPTConfidence?: number;
}

// interface TagWithConfidence {
//   tag: string;
//   confidence: number;
// }

interface ChatGPTResponse {
  // cuisine: string; // COMMENTED OUT - can be restored later
  // tags: TagWithConfidence[]; // COMMENTED OUT - can be restored later
  description: string;
  confidence_score: number;
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ 
        error: "Missing OpenAI API key",
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

    const { action, restaurants, google_place_id } = body;

    // Process restaurants with ChatGPT
    if (action === 'process-restaurants' || !action) {
      if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
        return new Response(JSON.stringify({ error: "Restaurants array is required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        // Process restaurants in parallel batches for better performance
        const batchSize = 5; // Process 5 restaurants at a time
        const processedRestaurants: RestaurantData[] = [];
        
        for (let i = 0; i < restaurants.length; i += batchSize) {
          const batch = restaurants.slice(i, i + batchSize);
          
          // Process batch in parallel
          const batchPromises = batch.map(restaurant => 
            processWithChatGPT(restaurant, openaiApiKey)
          );
          
          const batchResults = await Promise.all(batchPromises);
          
          // Add processed restaurants
          batch.forEach((restaurant, index) => {
            const chatGPTResult = batchResults[index];
            
            if (chatGPTResult) {
              processedRestaurants.push({
                ...restaurant,
                description: chatGPTResult.description,
                processedByChatGPT: true,
                chatGPTConfidence: chatGPTResult.confidence_score
              });
            } else {
              // Fallback to original restaurant data if ChatGPT processing failed
              processedRestaurants.push({
                ...restaurant,
                processedByChatGPT: false,
                chatGPTConfidence: 0
              });
            }
          });
        }

        return new Response(JSON.stringify({
          restaurants: processedRestaurants,
          processed_count: processedRestaurants.filter(r => r.processedByChatGPT).length,
          total_restaurants: processedRestaurants.length
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error processing restaurants:', error);
        return new Response(JSON.stringify({ 
          error: "Failed to process restaurants",
          restaurants: restaurants.map(r => ({
            ...r,
            processedByChatGPT: false,
            chatGPTConfidence: 0
          }))
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Unexpected error in ChatGPT processor:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

async function processWithChatGPT(restaurant: RestaurantData, apiKey: string): Promise<ChatGPTResponse | null> {
  try {
    // Create a shorter, optimized prompt for faster processing
    const prompt = `Describe this restaurant in 1-2 sentences: ${restaurant.name}${restaurant.address ? ` at ${restaurant.address}` : ''}${restaurant.rating ? ` (${restaurant.rating}★)` : ''}${restaurant.priceRange ? ` (${restaurant.priceRange})` : ''}.

Respond in JSON: {"description": "brief description"}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a restaurant expert. Provide brief, accurate descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent responses
        max_tokens: 150 // Reduced token limit for faster responses
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('No content in OpenAI response');
      return null;
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      
      return {
        description: result.description || `A restaurant called ${restaurant.name}`,
        confidence_score: 8
      };
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', parseError);
      // Fallback description
      return {
        description: `A restaurant called ${restaurant.name}`,
        confidence_score: 5
      };
    }

  } catch (error) {
    console.error('Error processing with ChatGPT:', error);
    return null;
  }
} 