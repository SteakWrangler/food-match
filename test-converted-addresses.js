// Test script to see if restaurant search works with OpenCage-converted addresses
// Run with: node test-converted-addresses.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testConvertedAddresses() {
  console.log('🔍 Testing restaurant search with OpenCage-converted addresses...\n');

  const testAddresses = [
    'San Diego, California',
    'City of New York, New York',
    'Los Angeles, California'
  ];

  for (const address of testAddresses) {
    console.log(`Testing restaurant search for: ${address}`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          location: address,
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
        console.log(`   Cuisine: ${data.restaurants[0].cuisine}`);
        console.log(`   Rating: ${data.restaurants[0].rating}`);
      } else {
        console.log(`⚠️  No restaurants found`);
      }
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
    
    console.log(''); // Add spacing between tests
  }
}

testConvertedAddresses(); 