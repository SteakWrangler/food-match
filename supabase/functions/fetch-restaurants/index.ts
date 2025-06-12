
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, radius = 5000, limit = 20, categories = 'restaurants' } = await req.json()
    
    const YELP_API_KEY = Deno.env.get('YELP_API_KEY')
    if (!YELP_API_KEY) {
      throw new Error('Yelp API key not configured')
    }

    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(location)}&radius=${radius}&limit=${limit}&categories=${categories}&sort_by=rating`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Yelp data to match our Restaurant interface
    const restaurants = data.businesses.map((business: any) => ({
      id: business.id,
      name: business.name,
      cuisine: business.categories?.[0]?.title || 'Restaurant',
      image: business.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      rating: business.rating || 4.0,
      priceRange: business.price || '$$',
      distance: `${(business.distance / 1609.34).toFixed(1)} mi`, // Convert meters to miles
      estimatedTime: `${Math.ceil(business.distance / 1609.34 * 3)} min`, // Rough estimate
      description: business.categories?.map((cat: any) => cat.title).join(', ') || 'Great local restaurant',
      tags: [
        ...(business.categories?.slice(0, 2).map((cat: any) => cat.title) || []),
        business.price || '$$',
        business.rating >= 4.5 ? 'Highly Rated' : 'Popular'
      ]
    }))

    return new Response(
      JSON.stringify({ restaurants }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
