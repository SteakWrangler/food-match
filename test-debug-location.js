// Test script to debug location search API response
// Run with: node test-debug-location.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testDebugLocation() {
  console.log('🔍 Debugging location search API response...\n');

  try {
    // Test the debug action that shows the location search response
    console.log('Testing location search for "San Diego, CA"...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'test-restaurant-search'
      })
    });

    const data = await response.json();
    console.log('✅ Debug response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDebugLocation(); 