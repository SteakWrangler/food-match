import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPLE-IAP-PROCESS-CREDITS] ${step}${detailsStr}`);
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
    logStep("Apple IAP credits processing started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { creditAmount, source } = await req.json();
    if (!creditAmount || typeof creditAmount !== 'number') {
      throw new Error("creditAmount is required and must be a number");
    }
    logStep("Processing Apple IAP credits", { userId: user.id, creditAmount, source });

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("room_credits")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`);
    }

    const currentCredits = profile?.room_credits || 0;
    const newCredits = currentCredits + creditAmount;

    // Update user credits
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        room_credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Failed to update credits: ${updateError.message}`);
    }

    logStep("Apple IAP credits added successfully", { 
      userId: user.id, 
      previousCredits: currentCredits, 
      creditsAdded: creditAmount, 
      newTotal: newCredits 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      creditsAdded: creditAmount,
      newTotal: newCredits 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in apple-iap-process-credits", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});