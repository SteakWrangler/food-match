// Test script to check OpenCage conversion for Orlando coordinates
// Run with: node test-orlando-opencage.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testOrlandoOpenCage() {
  console.log('🔍 Testing OpenCage conversion for Orlando coordinates...\n');

  const testCoordinates = [
    { name: 'Orlando', lat: 28.5147136, lng: -81.1958272 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 }
  ];

  for (const coord of testCoordinates) {
    console.log(`Testing reverse geocoding for ${coord.name} (${coord.lat}, ${coord.lng})`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'reverse-geocode',
          lat: coord.lat,
          lng: coord.lng
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.log(`❌ Error: ${data.error}`);
      } else {
        console.log(`✅ Address: ${data.address}`);
      }
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
    
    console.log(''); // Add spacing between tests
  }
}

testOrlandoOpenCage(); 