
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, roomId, roomData } = await req.json();

    switch (action) {
      case 'create':
        const { error: insertError } = await supabase
          .from('rooms')
          .insert({
            id: roomId,
            host_id: roomData.hostId,
            participants: roomData.participants,
            current_restaurant_index: roomData.currentRestaurantIndex,
            swipes: roomData.swipes
          })
        
        if (insertError) {
          console.error('Error creating room:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create room' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        console.log(`Room created: ${roomId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      case 'get':
        const { data: room, error: selectError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single()
        
        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Error fetching room:', selectError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch room' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        let roomDataToReturn = null;
        if (room) {
          roomDataToReturn = {
            id: room.id,
            hostId: room.host_id,
            participants: room.participants,
            currentRestaurantIndex: room.current_restaurant_index,
            swipes: room.swipes
          };
        }

        console.log(`Room requested: ${roomId}, found: ${!!room}`);
        return new Response(
          JSON.stringify({ roomData: roomDataToReturn }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      case 'update':
        const { error: updateError } = await supabase
          .from('rooms')
          .update({
            host_id: roomData.hostId,
            participants: roomData.participants,
            current_restaurant_index: roomData.currentRestaurantIndex,
            swipes: roomData.swipes,
            updated_at: new Date().toISOString()
          })
          .eq('id', roomId)
        
        if (updateError) {
          console.error('Error updating room:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update room' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        console.log(`Room updated: ${roomId}`);
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
