// Test script to call Zyla Labs API directly
// Run with: node test-direct-zyla.js

async function testDirectZyla() {
  console.log('🔍 Testing Zyla Labs API directly...\n');

  // Replace this with your actual API key from Zyla Labs dashboard
  const apiKey = 'YOUR_ZYLALABS_API_KEY_HERE';
  
  if (apiKey === 'YOUR_ZYLALABS_API_KEY_HERE') {
    console.log('❌ Please replace YOUR_ZYLALABS_API_KEY_HERE with your actual API key');
    console.log('You can get it from your Zyla Labs dashboard');
    return;
  }

  try {
    // Test 1: Location search
    console.log('1. Testing location search directly...');
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
    console.log('Location response headers:', Object.fromEntries(locationResponse.headers.entries()));
    
    const locationText = await locationResponse.text();
    console.log('Location response body:', locationText);
    
    if (locationResponse.ok) {
      const locationData = JSON.parse(locationText);
      console.log('✅ Location search successful:', JSON.stringify(locationData, null, 2));

      if (locationData.results && locationData.results.data && locationData.results.data.length > 0) {
        const locationId = locationData.results.data[0].result_object.location_id;
        console.log('Location ID:', locationId);

        // Test 2: Restaurant search
        console.log('\n2. Testing restaurant search directly...');
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
        console.log('Restaurant response headers:', Object.fromEntries(restaurantResponse.headers.entries()));
        
        const restaurantText = await restaurantResponse.text();
        console.log('Restaurant response body:', restaurantText);
        
        if (restaurantResponse.ok) {
          const restaurantData = JSON.parse(restaurantText);
          console.log('✅ Restaurant search successful:', JSON.stringify(restaurantData, null, 2));
        } else {
          console.log('❌ Restaurant search failed with status:', restaurantResponse.status);
        }
      }
    } else {
      console.log('❌ Location search failed with status:', locationResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectZyla(); 