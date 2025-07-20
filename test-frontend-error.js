// Test script to debug the frontend error
// Run with: node test-frontend-error.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testFrontendError() {
  console.log('🔍 Testing the exact request the frontend is making...\n');

  // Test with the exact parameters the frontend is using
  const testCases = [
    {
      name: 'Frontend-style request with action',
      body: {
        action: 'search-restaurants',
        location: '28.5147136, -81.1958272', // Orlando coordinates
        radius: 5000,
        openNow: true
      }
    },
    {
      name: 'Frontend-style request without action',
      body: {
        location: '28.5147136, -81.1958272', // Orlando coordinates
        radius: 5000,
        openNow: true
      }
    },
    {
      name: 'City name test',
      body: {
        action: 'search-restaurants',
        location: 'Orlando, FL',
        radius: 5000,
        openNow: true
      }
    }
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
        body: JSON.stringify(testCase.body)
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
      } else {
        console.log(`⚠️  No restaurants found`);
      }
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }
}

testFrontendError(); 