import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPLE-IAP-PROCESS-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Apple IAP subscription processing started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { subscriptionType, source } = await req.json();
    if (!subscriptionType || !['monthly', 'annual'].includes(subscriptionType)) {
      throw new Error("subscriptionType is required and must be 'monthly' or 'annual'");
    }
    logStep("Processing Apple IAP subscription", { userId: user.id, subscriptionType, source });

    // Calculate subscription expiry date
    const now = new Date();
    const expiryDate = new Date(now);
    if (subscriptionType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Update user subscription
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        subscription_type: subscriptionType,
        subscription_status: 'active',
        subscription_expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logStep("Apple IAP subscription activated successfully", { 
      userId: user.id, 
      subscriptionType,
      expiresAt: expiryDate.toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true, 
      subscriptionType,
      subscriptionStatus: 'active',
      expiresAt: expiryDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in apple-iap-process-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});