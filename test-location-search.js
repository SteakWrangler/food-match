// Test script to debug location search step
// Run with: node test-location-search.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testLocationSearch() {
  console.log('🔍 Testing location search step...\n');

  const testLocations = [
    'San Diego, CA',
    'San Diego',
    'San Diego, California',
    'San Diego, CA, USA',
    '32.7157, -117.1611' // San Diego coordinates
  ];

  for (const location of testLocations) {
    console.log(`Testing location: "${location}"`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          location: location,
          radius: 5000,
          openNow: true
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.log(`❌ Error: ${data.error}`);
        if (data.details) {
          console.log(`   Details: ${data.details}`);
        }
      } else if (data.restaurants && data.restaurants.length > 0) {
        console.log(`✅ Success: Found ${data.restaurants.length} restaurants`);
        console.log(`   Sample: ${data.restaurants[0].name}`);
        console.log(`   Location ID: ${data.restaurants[0].debug?.originalData?.location_id || 'N/A'}`);
        break; // Found working location, stop testing
      } else {
        console.log(`⚠️  No restaurants found`);
      }
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
    
    console.log(''); // Add spacing between tests
  }
}

testLocationSearch(); 