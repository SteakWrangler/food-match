import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
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
    logStep("Delete account function started");

    // User authentication validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Stripe subscription cancellation logic
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Cancel all active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
      });

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.cancel(subscription.id);
        logStep("Cancelled Stripe subscription", { subscriptionId: subscription.id });
      }

      // Delete the Stripe customer
      await stripe.customers.del(customerId);
      logStep("Deleted Stripe customer", { customerId });
    } else {
      logStep("No Stripe customer found for user");
    }

    // Apple IAP subscription handling
    // Note: Apple IAP subscriptions cannot be cancelled server-side
    // We can only deactivate the subscription status in our database
    // The user must manually cancel through Apple Settings
    logStep("Checking for Apple IAP subscription");
    
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("subscription_type, subscription_status")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status === 'active' && 
        (profile.subscription_type === 'monthly' || profile.subscription_type === 'annual')) {
      logStep("Found active Apple IAP subscription - deactivating in database", {
        subscriptionType: profile.subscription_type
      });
      
      await supabaseClient
        .from("profiles")
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
        
      logStep("Apple IAP subscription deactivated in database");
    } else {
      logStep("No active Apple IAP subscription found");
    }

    // User deletion with proper cascade
    logStep("Starting user data deletion");

    // Delete user-specific data from custom tables
    // Note: Some tables will be handled by foreign key constraints after migration
    
    // Delete from user_favorites
    const { error: favoritesError } = await supabaseClient
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id);
    
    if (favoritesError) {
      logStep("Error deleting user favorites", { error: favoritesError.message });
    } else {
      logStep("Deleted user favorites");
    }

    // Delete from room_history
    const { error: historyError } = await supabaseClient
      .from("room_history")
      .delete()
      .eq("user_id", user.id);
    
    if (historyError) {
      logStep("Error deleting room history", { error: historyError.message });
    } else {
      logStep("Deleted room history");
    }

    // Delete from processed_sessions
    const { error: sessionsError } = await supabaseClient
      .from("processed_sessions")
      .delete()
      .eq("user_id", user.id);
    
    if (sessionsError) {
      logStep("Error deleting processed sessions", { error: sessionsError.message });
    } else {
      logStep("Deleted processed sessions");
    }

    // Delete rooms where user is the host
    const { error: roomsError } = await supabaseClient
      .from("rooms")
      .delete()
      .eq("host_user_id", user.id);
    
    if (roomsError) {
      logStep("Error deleting user rooms", { error: roomsError.message });
    } else {
      logStep("Deleted user rooms");
    }

    // Delete user profile
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .delete()
      .eq("id", user.id);
    
    if (profileError) {
      logStep("Error deleting user profile", { error: profileError.message });
    } else {
      logStep("Deleted user profile");
    }

    // Finally, delete the user from Supabase Auth
    const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) {
      throw new Error(`Failed to delete user from auth: ${authDeleteError.message}`);
    }
    
    logStep("User successfully deleted from auth and all associated data removed", { userId: user.id });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Account successfully deleted" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("ERROR in delete-account", { 
      message: errorMessage, 
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    // Return appropriate error status codes
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