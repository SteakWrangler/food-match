// Test script to verify Worldwide Restaurants API integration
// Run with: node test-worldwide-api.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testWorldwideRestaurantsAPI() {
  console.log('🧪 Testing Worldwide Restaurants API Integration...\n');

  try {
    // Test 1: Restaurant Search with San Diego
    console.log('1. Testing restaurant search with San Diego...');
    const searchResponse = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        location: 'San Diego, CA',
        radius: 5000,
        openNow: true
      })
    });

    const searchData = await searchResponse.json();
    console.log('✅ Restaurant search response:', searchData.restaurants?.length || 0, 'restaurants found');
    
    if (searchData.error) {
      console.log('❌ Error:', searchData.error);
      console.log('Details:', searchData.details);
    }
    
    if (searchData.restaurants && searchData.restaurants.length > 0) {
      console.log('   Sample restaurant:', searchData.restaurants[0].name);
      console.log('   Sample cuisine:', searchData.restaurants[0].cuisine);
      console.log('   Sample rating:', searchData.restaurants[0].rating);
      console.log('   Sample address:', searchData.restaurants[0].address);
    }

    // Test 2: Restaurant Search with coordinates
    console.log('\n2. Testing restaurant search with coordinates...');
    const searchResponse2 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        location: '32.7157, -117.1611', // San Diego coordinates
        radius: 5000,
        openNow: true
      })
    });

    const searchData2 = await searchResponse2.json();
    console.log('✅ Restaurant search response (coordinates):', searchData2.restaurants?.length || 0, 'restaurants found');
    
    if (searchData2.error) {
      console.log('❌ Error:', searchData2.error);
      console.log('Details:', searchData2.details);
    }

    // Test 3: Reverse Geocoding
    console.log('\n3. Testing reverse geocoding...');
    const geocodeResponse = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'reverse-geocode',
        lat: 32.7157,
        lng: -117.1611
      })
    });

    const geocodeData = await geocodeResponse.json();
    console.log('✅ Reverse geocoding response:', geocodeData.address || 'No address found');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorldwideRestaurantsAPI(); 