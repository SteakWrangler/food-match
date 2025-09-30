import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-ACCOUNT-DELETION-INFO] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Get account deletion info function started");

    // User authentication validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Calculate subscription value remaining
    let subscriptionInfo = {
      hasActiveSubscription: false,
      subscriptionType: 'none',
      subscriptionStatus: 'inactive',
      remainingValue: 0,
      subscriptionExpiresAt: null,
      provider: 'none'
    };

    // Check Stripe subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          const priceId = subscription.items.data[0].price.id;
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          const now = new Date();
          const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          let subscriptionType = 'unknown';
          let monthlyValue = 0;
          
          // Determine subscription type and value
          if (priceId === "price_1RvnXJD2Qzu3jxiC4fn6yJul") {
            subscriptionType = "monthly";
            monthlyValue = 9.99; // Assuming $9.99/month
          } else if (priceId === "price_1RvnXJD2Qzu3jxiCZQ5TO4TR") {
            subscriptionType = "yearly";
            monthlyValue = 99.99 / 12; // Assuming $99.99/year
          }
          
          const remainingValue = (daysRemaining / 30) * monthlyValue;
          
          subscriptionInfo = {
            hasActiveSubscription: true,
            subscriptionType,
            subscriptionStatus: 'active',
            remainingValue: Math.max(0, remainingValue),
            subscriptionExpiresAt: currentPeriodEnd.toISOString(),
            provider: 'stripe'
          };
          
          logStep("Found active Stripe subscription", subscriptionInfo);
        }
      }
    }

    // Check Apple IAP subscription if no Stripe subscription found
    if (!subscriptionInfo.hasActiveSubscription) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("subscription_type, subscription_status, subscription_expires_at")
        .eq("id", user.id)
        .single();

      if (profile?.subscription_status === 'active' && 
          (profile.subscription_type === 'monthly' || profile.subscription_type === 'annual')) {
        
        const expiresAt = new Date(profile.subscription_expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let monthlyValue = 0;
        if (profile.subscription_type === 'monthly') {
          monthlyValue = 9.99; // Assuming $9.99/month
        } else if (profile.subscription_type === 'annual') {
          monthlyValue = 99.99 / 12; // Assuming $99.99/year
        }
        
        const remainingValue = (daysRemaining / 30) * monthlyValue;
        
        subscriptionInfo = {
          hasActiveSubscription: true,
          subscriptionType: profile.subscription_type,
          subscriptionStatus: 'active',
          remainingValue: Math.max(0, remainingValue),
          subscriptionExpiresAt: profile.subscription_expires_at,
          provider: 'apple'
        };
        
        logStep("Found active Apple IAP subscription", subscriptionInfo);
      }
    }

    // Count user's favorites
    const { data: favorites, error: favoritesError } = await supabaseClient
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id);

    const favoritesCount = favoritesError ? 0 : (favorites?.length || 0);
    logStep("Counted user favorites", { count: favoritesCount });

    // Count room history entries
    const { data: roomHistory, error: historyError } = await supabaseClient
      .from("room_history")
      .select("id")
      .eq("user_id", user.id);

    const roomHistoryCount = historyError ? 0 : (roomHistory?.length || 0);
    logStep("Counted room history", { count: roomHistoryCount });

    // Get remaining room credits count (from profile)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("room_credits")
      .eq("id", user.id)
      .single();

    const roomCreditsCount = profile?.room_credits || 0;
    logStep("Got room credits count", { count: roomCreditsCount });

    const deletionInfo = {
      subscriptionInfo,
      dataInfo: {
        favoritesCount,
        roomHistoryCount,
        roomCreditsCount
      },
      warnings: {
        hasActiveSubscription: subscriptionInfo.hasActiveSubscription,
        hasData: favoritesCount > 0 || roomHistoryCount > 0,
        hasCredits: roomCreditsCount > 0,
        requiresManualCancellation: subscriptionInfo.provider === 'apple' && subscriptionInfo.hasActiveSubscription
      }
    };

    logStep("Successfully compiled account deletion info", deletionInfo.warnings);

    return new Response(JSON.stringify(deletionInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("ERROR in get-account-deletion-info", { 
      message: errorMessage, 
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    let statusCode = 500;
    if (errorMessage.includes("Authentication error") || errorMessage.includes("not authenticated")) {
      statusCode = 401;
    } else if (errorMessage.includes("authorization header")) {
      statusCode = 400;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});