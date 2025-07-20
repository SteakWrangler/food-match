import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Simplified ChatGPT processor - only generates descriptions
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

    // Initialize Supabase client for cache
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
        const processedRestaurants: RestaurantData[] = [];

        for (const restaurant of restaurants) {
          // Check cache first
          const { data: cachedData, error: cacheError } = await supabase
            .from('chatgpt_cache')
            .select('*')
            .eq('restaurant_name', restaurant.name)
            .single();

          if (cachedData && !cacheError) {
            // Use cached data
            console.log(`Using cached data for ${restaurant.name}`);
            processedRestaurants.push({
              ...restaurant,
              cuisine: cachedData.cuisine || restaurant.cuisine,
              tags: cachedData.tags || restaurant.tags,
              description: cachedData.description || restaurant.description,
              processedByChatGPT: true,
              chatGPTConfidence: cachedData.confidence_score
            });
            continue;
          }

          // Process with ChatGPT
          console.log(`Processing ${restaurant.name} with ChatGPT`);
          
          const chatGPTResult = await processWithChatGPT(restaurant, openaiApiKey);
          
          if (chatGPTResult) {
            // COMMENTED OUT - Tag processing logic
            // const tagsWithConfidence = chatGPTResult.tags.map(t => ({
            //   tag: t.tag,
            //   confidence: t.confidence
            // }));
            
            // const tagStrings = chatGPTResult.tags.map(t => t.tag);
            
            // Save to cache
            const cacheEntry = {
              restaurant_name: restaurant.name,
              google_place_id,
              // cuisine: chatGPTResult.cuisine, // COMMENTED OUT
              // tags: tagStrings, // COMMENTED OUT
              // tags_with_confidence: tagsWithConfidence, // COMMENTED OUT
              description: chatGPTResult.description,
              confidence_score: chatGPTResult.confidence_score,
              raw_chatgpt_response: chatGPTResult
            };

            await supabase
              .from('chatgpt_cache')
              .upsert(cacheEntry, { 
                onConflict: 'restaurant_name',
                ignoreDuplicates: false 
              });

            // Add processed restaurant
            processedRestaurants.push({
              ...restaurant,
              // cuisine: chatGPTResult.cuisine, // COMMENTED OUT
              // tags: tagStrings, // COMMENTED OUT
              description: chatGPTResult.description,
              processedByChatGPT: true,
              chatGPTConfidence: chatGPTResult.confidence_score
            });
          } else {
            // If ChatGPT processing failed, use original data
            processedRestaurants.push({
              ...restaurant,
              processedByChatGPT: false,
              chatGPTConfidence: 0
            });
          }
        }

        return new Response(JSON.stringify({ 
          restaurants: processedRestaurants,
          count: processedRestaurants.length,
          processed_count: processedRestaurants.filter(r => r.processedByChatGPT).length
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error processing restaurants with ChatGPT:', error);
        return new Response(JSON.stringify({ 
          error: "Failed to process restaurants",
          details: error.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // If no valid action is provided
    return new Response(JSON.stringify({ 
      error: "Invalid action. Use 'process-restaurants'" 
    }), {
      status: 400,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Unhandled error in ChatGPT processor function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

async function processWithChatGPT(restaurant: RestaurantData, apiKey: string): Promise<ChatGPTResponse | null> {
  try {
    // Create a simple, clear prompt for ChatGPT
    const prompt = `Analyze this restaurant and provide a description.

Restaurant: ${restaurant.name}
Address: ${restaurant.address || 'Unknown'}
Rating: ${restaurant.rating || 'Unknown'}
Price Range: ${restaurant.priceRange || 'Unknown'}

// COMMENTED OUT - Tag selection prompts
// For this restaurant, which of these CUISINE tags would you most likely associate with it? (Select ALL that apply):
// Italian, Mexican, Chinese, Japanese, Thai, Indian, American, French, Greek, Mediterranean, Korean, Vietnamese, Spanish, German, British, Irish, Caribbean, Middle Eastern, African, Brazilian, Peruvian, Argentinian, Cuban, Puerto Rican, Fusion, Pizza, Sushi, BBQ, Seafood, Steakhouse, Bakery, Desserts, Burgers, Pasta, Tacos, Burritos, Ramen, Pho, Curry, Kebab, Falafel, Gyros, Paella, Tapas, Schnitzel, Fish & Chips, Bangers & Mash, Jerk Chicken, Ceviche, Asado, Ropa Vieja, Mofongo, Empanadas, Sandwiches, Subs, Wings, Noodles, Chicken, Hot Dogs, Ice Cream, Coffee

// For this restaurant, which of these SERVICE tags would you most likely associate with it? (Select ALL that apply):
// Dine-in, Takeout, Delivery, Fast Food, Fast Casual, Fine Dining, Casual Dining, Upscale Casual, Family Style, Buffet, Food Truck, Bar, Sports Bar, Pub, Cafe, Coffee Shop

// For this restaurant, which of these ATMOSPHERE tags would you most likely associate with it? (Select ALL that apply):
// Romantic, Family Friendly, Date Night, Business Lunch, Group Dining, Outdoor Seating, Live Music, Entertainment, Late Night, Breakfast, Brunch, Lunch, Dinner, Weekend Brunch, Trendy, Cozy, Lively

// For this restaurant, which of these DIETARY tags would you most likely associate with it? (Select ALL that apply):
// Vegetarian Friendly, Vegan, Gluten Free, Healthy, Organic, Low Carb, Keto Friendly, Dairy Free, Nut Free

// For this restaurant, which of these PRICE tags would you most likely associate with it? (Select ALL that apply):
// Budget Friendly, Mid Range, Upscale, Luxury, Value

// For this restaurant, which of these FEATURE tags would you most likely associate with it? (Select ALL that apply):
// Wine List, Craft Beer, Cocktails, Coffee, Desserts, Bakery, Fresh, Local, Seasonal, Farm to Table, Chef Driven, Award Winning, Celebrity Chef, Historic, Trendy

Use your knowledge about restaurants to provide an accurate and helpful description. For well-known chains, use your knowledge of what they serve.

Respond in this exact JSON format:
{
  "description": "string (brief description of the restaurant)"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a restaurant analysis expert. Provide accurate, helpful information about restaurants based on their name, location, and available data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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

    console.log('ChatGPT raw response for', restaurant.name, ':', content);

    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      console.log('Parsed ChatGPT result for', restaurant.name, ':', result);
      
      // COMMENTED OUT - Tag processing logic
      // let tags: TagWithConfidence[] = [];
      // if (Array.isArray(result.tags)) {
      //   if (result.tags.length > 0 && typeof result.tags[0] === 'string') {
      //     // Old format: string array
      //     tags = result.tags.map((tag: string) => ({ tag, confidence: 8 }));
      //   } else {
      //     // New format: object array with confidence
      //     tags = result.tags.map((tagObj: any) => ({
      //       tag: tagObj.tag || tagObj,
      //       confidence: tagObj.confidence || 8
      //     }));
      //   }
      // }
      
      return {
        // cuisine: result.cuisine || 'Unknown', // COMMENTED OUT
        // tags: tags, // COMMENTED OUT
        description: result.description || 'A restaurant offering various dishes.',
        confidence_score: result.confidence_score || 5
      };
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
} 