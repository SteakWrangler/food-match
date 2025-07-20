// Test script to check Zyla Labs API key directly
// Run with: node test-api-key.js

async function testZylaLabsAPI() {
  console.log('🔑 Testing Zyla Labs API key directly...\n');

  // This would be your actual API key from Supabase secrets
  // For testing, we'll use a placeholder - you'll need to get the actual key
  const apiKey = 'YOUR_ZYLALABS_API_KEY'; // Replace with actual key
  
  if (apiKey === 'YOUR_ZYLALABS_API_KEY') {
    console.log('❌ Please replace YOUR_ZYLALABS_API_KEY with your actual API key');
    console.log('You can get it from Supabase dashboard or run: supabase secrets list');
    return;
  }

  try {
    // Test 1: Location search
    console.log('1. Testing location search...');
    const locationResponse = await fetch('https://zylalabs.com/api/757/worldwide+restaurants+api/476/search+location', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: "San Diego, CA",
        limit: 1
      })
    });

    console.log('Location response status:', locationResponse.status);
    
    if (!locationResponse.ok) {
      const errorText = await locationResponse.text();
      console.log('❌ Location search failed:', errorText);
      return;
    }

    const locationData = await locationResponse.json();
    console.log('✅ Location search successful:', locationData);

    if (locationData.results && locationData.results.data && locationData.results.data.length > 0) {
      const locationId = locationData.results.data[0].result_object.location_id;
      console.log('Location ID:', locationId);

      // Test 2: Restaurant search
      console.log('\n2. Testing restaurant search...');
      const restaurantResponse = await fetch('https://zylalabs.com/api/757/worldwide+restaurants+api/477/search+restaurants+in+location', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location_id: locationId,
          limit: 5
        })
      });

      console.log('Restaurant response status:', restaurantResponse.status);
      
      if (!restaurantResponse.ok) {
        const errorText = await restaurantResponse.text();
        console.log('❌ Restaurant search failed:', errorText);
        return;
      }

      const restaurantData = await restaurantResponse.json();
      console.log('✅ Restaurant search successful:', restaurantData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testZylaLabsAPI(); 