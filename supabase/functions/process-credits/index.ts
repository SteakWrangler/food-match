import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-CREDITS] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");
    logStep("Processing session", { sessionId });

    // Check if this session has already been processed
    const { data: existingSession, error: checkError } = await supabaseClient
      .from("processed_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Failed to check processed sessions: ${checkError.message}`);
    }

    if (existingSession) {
      logStep("Session already processed", { 
        sessionId, 
        creditsAdded: existingSession.credits_added,
        processedAt: existingSession.processed_at 
      });
      return new Response(JSON.stringify({ 
        success: true, 
        creditsAdded: existingSession.credits_added,
        message: "Session already processed",
        alreadyProcessed: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    const userId = session.metadata?.user_id;
    if (!userId) {
      throw new Error("User ID not found in session metadata");
    }

    // Get the line items to determine which credits to add
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;
    logStep("Found price ID", { priceId });

    let creditsToAdd = 0;
    switch (priceId) {
      case "price_1RvncFD2Qzu3jxiCzi4Lrh5o": // 1 room credit for $1
        creditsToAdd = 1;
        break;
      case "price_1RvncpD2Qzu3jxiCbbDsb8FS": // 5 room credits for $4
        creditsToAdd = 5;
        break;
      default:
        logStep("Unknown price ID, no credits to add", { priceId });
        return new Response(JSON.stringify({ message: "No credits to process" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
    }

    logStep("Adding credits to user", { userId, creditsToAdd });

    // Add credits to user profile
    const { data: profile, error: updateError } = await supabaseClient
      .from("profiles")
      .select("room_credits")
      .eq("id", userId)
      .single();

    if (updateError) {
      throw new Error(`Failed to get user profile: ${updateError.message}`);
    }

    const currentCredits = profile?.room_credits || 0;
    const newCredits = currentCredits + creditsToAdd;

    const { error: creditError } = await supabaseClient
      .from("profiles")
      .update({
        room_credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (creditError) {
      throw new Error(`Failed to update credits: ${creditError.message}`);
    }

    // Record that this session has been processed
    const { error: recordError } = await supabaseClient
      .from("processed_sessions")
      .insert({
        session_id: sessionId,
        user_id: userId,
        credits_added: creditsToAdd
      });

    if (recordError) {
      logStep("Warning: Failed to record processed session", { error: recordError.message });
      // Don't throw error here as credits were already added successfully
    }

    logStep("Credits added successfully", { 
      userId, 
      previousCredits: currentCredits, 
      creditsAdded: creditsToAdd, 
      newTotal: newCredits 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      creditsAdded: creditsToAdd,
      newTotal: newCredits 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-credits", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});