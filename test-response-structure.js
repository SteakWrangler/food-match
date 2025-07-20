// Test script to see the exact API response structure
// Run with: node test-response-structure.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testResponseStructure() {
  console.log('🔍 Testing API response structure...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        location: 'San Diego, CA',
        radius: 5000,
        openNow: true
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response type:', typeof data);
    console.log('Response keys:', Object.keys(data));
    
    if (data.error) {
      console.log('Error:', data.error);
      console.log('Details:', data.details);
      console.log('API Response:', data.apiResponse);
    } else if (data.restaurants) {
      console.log('Restaurants found:', data.restaurants.length);
      console.log('First restaurant:', data.restaurants[0]);
    } else {
      console.log('Unexpected response structure:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testResponseStructure(); 