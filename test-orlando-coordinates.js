// Test script for the specific Orlando coordinates that were failing
// Run with: node test-orlando-coordinates.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testOrlandoCoordinates() {
  console.log('🔍 Testing the exact Orlando coordinates from the frontend error...\n');

  const testCases = [
    {
      name: 'Orlando coordinates (exact from error)',
      location: '28.5147136, -81.1958272'
    },
    {
      name: 'Orlando city name',
      location: 'Orlando, FL'
    },
    {
      name: 'Orlando with action parameter',
      location: '28.5147136, -81.1958272',
      withAction: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    
    try {
      const body = {
        location: testCase.location,
        radius: 5000,
        openNow: true
      };

      if (testCase.withAction) {
        body.action = 'search-restaurants';
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body)
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

testOrlandoCoordinates(); 