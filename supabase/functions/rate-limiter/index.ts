import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

class RateLimiter {
  private supabase: any;
  
  constructor() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  private async getClientIdentifier(req: Request): Promise<string> {
    // Try to get user ID from JWT if available
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const { data: { user } } = await this.supabase.auth.getUser(token);
        if (user) {
          return `user:${user.id}`;
        }
      } catch (error) {
        console.log("Could not extract user from token, using IP");
      }
    }
    
    // Fallback to IP address
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
    return `ip:${ip}`;
  }

  async checkRateLimit(req: Request, config: RateLimitConfig): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    const identifier = await this.getClientIdentifier(req);
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Get current usage from database
      const { data: usage, error } = await this.supabase
        .from('api_usage')
        .select('*')
        .eq('key', key)
        .gte('timestamp', new Date(windowStart).toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error checking rate limit:', error);
        return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs };
      }

      const currentUsage = usage?.length || 0;
      const remaining = Math.max(0, config.maxRequests - currentUsage);
      const allowed = currentUsage < config.maxRequests;
      const resetTime = now + config.windowMs;

      // Record this request if allowed
      if (allowed) {
        await this.supabase
          .from('api_usage')
          .insert({
            key,
            timestamp: new Date().toISOString(),
            user_agent: req.headers.get('user-agent') || 'unknown'
          });
      }

      return { allowed, remaining, resetTime };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs };
    }
  }
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const rateLimiter = new RateLimiter();
    
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

    const { action, apiType = 'google-places' } = body;

    if (action !== 'check-rate-limit') {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Configure rate limits based on API type
    let config: RateLimitConfig;
    switch (apiType) {
      case 'google-places':
        config = {
          maxRequests: 100, // 100 requests per day
          windowMs: 24 * 60 * 60 * 1000, // 24 hours
          keyPrefix: 'google_places'
        };
        break;
      case 'chatgpt':
        config = {
          maxRequests: 50, // 50 requests per day
          windowMs: 24 * 60 * 60 * 1000, // 24 hours
          keyPrefix: 'chatgpt'
        };
        break;
      default:
        config = {
          maxRequests: 200, // 200 requests per day
          windowMs: 24 * 60 * 60 * 1000, // 24 hours
          keyPrefix: 'general'
        };
    }

    const result = await rateLimiter.checkRateLimit(req, config);

    return new Response(JSON.stringify(result), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error in rate limiter:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      allowed: true,
      remaining: 100,
      resetTime: Date.now() + 24 * 60 * 60 * 1000
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}); 