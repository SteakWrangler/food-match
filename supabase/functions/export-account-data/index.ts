import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-ACCOUNT-DATA] ${step}${detailsStr}`);
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
    logStep("Export account data function started");

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

    // Export user profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      logStep("Error fetching user profile", { error: profileError.message });
    } else {
      logStep("Fetched user profile data");
    }

    // Export favorites list
    const { data: favorites, error: favoritesError } = await supabaseClient
      .from("user_favorites")
      .select("*")
      .eq("user_id", user.id);

    if (favoritesError) {
      logStep("Error fetching user favorites", { error: favoritesError.message });
    } else {
      logStep("Fetched user favorites", { count: favorites?.length || 0 });
    }

    // Export room history
    const { data: roomHistory, error: historyError } = await supabaseClient
      .from("room_history")
      .select("*")
      .eq("user_id", user.id);

    if (historyError) {
      logStep("Error fetching room history", { error: historyError.message });
    } else {
      logStep("Fetched room history", { count: roomHistory?.length || 0 });
    }

    // Export processed sessions
    const { data: processedSessions, error: sessionsError } = await supabaseClient
      .from("processed_sessions")
      .select("*")
      .eq("user_id", user.id);

    if (sessionsError) {
      logStep("Error fetching processed sessions", { error: sessionsError.message });
    } else {
      logStep("Fetched processed sessions", { count: processedSessions?.length || 0 });
    }

    // Compile all data into export object
    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      user_email: user.email,
      profile: profile || null,
      favorites: favorites || [],
      room_history: roomHistory || [],
      processed_sessions: processedSessions || [],
      export_metadata: {
        favorites_count: favorites?.length || 0,
        room_history_count: roomHistory?.length || 0,
        processed_sessions_count: processedSessions?.length || 0,
      }
    };

    logStep("Successfully compiled account data export", {
      favorites_count: exportData.export_metadata.favorites_count,
      room_history_count: exportData.export_metadata.room_history_count,
      processed_sessions_count: exportData.export_metadata.processed_sessions_count
    });

    // Return as downloadable JSON file
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="toss-or-taste-account-data-${user.id}.json"`,
      },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logStep("ERROR in export-account-data", { 
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