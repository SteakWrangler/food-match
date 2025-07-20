// Test script to verify OpenCage integration
// Run with: node test-opencage-integration.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testOpenCageIntegration() {
  console.log('🔍 Testing OpenCage integration...\n');

  const testCoordinates = [
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 }
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

testOpenCageIntegration(); 