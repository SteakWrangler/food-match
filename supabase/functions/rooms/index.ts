
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory storage for rooms (in production, you'd use a database)
const rooms = new Map<string, any>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, roomId, roomData } = await req.json();

    switch (action) {
      case 'create':
        rooms.set(roomId, roomData);
        console.log(`Room created: ${roomId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      case 'get':
        const room = rooms.get(roomId);
        console.log(`Room requested: ${roomId}, found: ${!!room}`);
        return new Response(
          JSON.stringify({ roomData: room || null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      case 'update':
        if (rooms.has(roomId)) {
          rooms.set(roomId, roomData);
          console.log(`Room updated: ${roomId}`);
        }
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
    }
  } catch (error) {
    console.error('Error in rooms function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
