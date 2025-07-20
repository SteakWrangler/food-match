// Test for direct Orlando city search
// Run with: node test-orlando-direct.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testOrlandoDirect() {
  console.log('🔍 Testing direct Orlando city search...\n');

  const testCases = [
    { name: 'Orlando, FL', location: 'Orlando, FL' },
    { name: 'Orlando, Florida', location: 'Orlando, Florida' },
    { name: 'Orlando', location: 'Orlando' },
    { name: 'Miami, FL', location: 'Miami, FL' },
    { name: 'Tampa, FL', location: 'Tampa, FL' }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          location: testCase.location,
          radius: 5000,
          openNow: true
        })
      });

      console.log(`Response status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.error) {
        console.log(`❌ Error: ${data.error}`);
        if (data.details) {
          console.log(`   Details: ${data.details}`);
        }
      } else if (data.restaurants && data.restaurants.length > 0) {
        console.log(`✅ Success: Found ${data.restaurants.length} restaurants`);
        console.log(`   Sample: ${data.restaurants[0].name}`);
        console.log(`   Location: ${data.restaurants[0].address}`);
      } else {
        console.log(`⚠️  No restaurants found`);
      }
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }
}

testOrlandoDirect(); 