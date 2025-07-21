import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface CacheEntry {
  restaurant_name: string;
  google_place_id?: string;
  cuisine?: string;
  tags?: string[];
  description?: string;
  confidence_score?: number;
  raw_chatgpt_response?: any;
}

interface CacheStats {
  total_entries: number;
  cache_hits: number;
  cache_misses: number;
  hit_rate: number;
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

    const { action, restaurant_name, cache_data, google_place_id } = body;

    // Check cache for restaurant data
    if (action === 'check-cache') {
      if (!restaurant_name) {
        return new Response(JSON.stringify({ error: "Restaurant name is required" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        // Note: ChatGPT cache has been removed, only checking restaurant_cache
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurant_cache')
          .select('*')
          .eq('name', restaurant_name)
          .single();

        if (restaurantError && restaurantError.code !== 'PGRST116') {
          throw restaurantError;
        }

        if (restaurantData) {
          return new Response(JSON.stringify({ 
            found: true,
            source: 'restaurant_cache',
            data: restaurantData
          }), {
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify({ 
          found: false,
          message: "Restaurant not found in cache"
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error checking cache:', error);
        return new Response(JSON.stringify({ 
          error: "Failed to check cache",
          details: error.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // Note: ChatGPT cache saving has been removed
    if (action === 'save-to-cache') {
      return new Response(JSON.stringify({ 
        error: "ChatGPT cache has been removed. This action is no longer supported." 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get cache statistics
    if (action === 'get-stats') {
      try {
        // Note: ChatGPT cache has been removed, only checking restaurant_cache
        const { count: restaurantCount, error: restaurantError } = await supabase
          .from('restaurant_cache')
          .select('*', { count: 'exact', head: true });

        if (restaurantError) {
          throw restaurantError;
        }

        const stats: CacheStats = {
          total_entries: restaurantCount || 0,
          cache_hits: 0, // This would need to be tracked separately
          cache_misses: 0, // This would need to be tracked separately
          hit_rate: 0 // This would need to be calculated from hits/misses
        };

        return new Response(JSON.stringify({ 
          stats,
          restaurant_cache_entries: restaurantCount || 0,
          note: "ChatGPT cache has been removed"
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error getting cache stats:', error);
        return new Response(JSON.stringify({ 
          error: "Failed to get cache statistics",
          details: error.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // Cleanup expired cache entries (older than 30 days)
    if (action === 'cleanup-expired') {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Note: ChatGPT cache has been removed, only cleaning restaurant_cache
        const { data: restaurantDeleted, error: restaurantError } = await supabase
          .from('restaurant_cache')
          .delete()
          .lt('updated_at', thirtyDaysAgo.toISOString())
          .select();

        if (restaurantError) {
          throw restaurantError;
        }

        return new Response(JSON.stringify({ 
          success: true,
          message: "Cache cleanup completed",
          restaurant_deleted: restaurantDeleted?.length || 0,
          note: "ChatGPT cache has been removed"
        }), {
          headers: corsHeaders
        });

      } catch (error) {
        console.error('Error cleaning up cache:', error);
        return new Response(JSON.stringify({ 
          error: "Failed to cleanup cache",
          details: error.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // If no valid action is provided
    return new Response(JSON.stringify({ 
      error: "Invalid action. Use 'check-cache', 'get-stats', or 'cleanup-expired'. Note: 'save-to-cache' has been removed." 
    }), {
      status: 400,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Unhandled error in cache manager function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}); 