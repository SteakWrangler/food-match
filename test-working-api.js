// Test script to try different locations with the working API
// Run with: node test-working-api.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testWorkingAPI() {
  console.log('🎉 Testing working API with different locations...\n');

  const locations = [
    'New York, NY',
    'Los Angeles, CA', 
    'Chicago, IL',
    'Miami, FL',
    'Las Vegas, NV'
  ];

  for (const location of locations) {
    console.log(`Testing location: ${location}`);
    
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
        console.log(`❌ ${location}: ${data.error}`);
        if (data.details) {
          console.log(`   Details: ${data.details}`);
        }
      } else if (data.restaurants && data.restaurants.length > 0) {
        console.log(`✅ ${location}: Found ${data.restaurants.length} restaurants`);
        console.log(`   Sample: ${data.restaurants[0].name}`);
        console.log(`   Cuisine: ${data.restaurants[0].cuisine}`);
        console.log(`   Rating: ${data.restaurants[0].rating}`);
        break; // Found working location, stop testing
      } else {
        console.log(`⚠️  ${location}: No restaurants found`);
      }
      
    } catch (error) {
      console.log(`❌ ${location}: ${error.message}`);
    }
    
    console.log(''); // Add spacing between tests
  }
}

testWorkingAPI(); 