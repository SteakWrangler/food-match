// Test script to debug the API key being used
// Run with: node test-api-key-debug.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testAPIKeyDebug() {
  console.log('🔍 Debugging API key...\n');

  try {
    // Test 1: Check API key details
    console.log('1. Testing API key details...');
    const keyResponse = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'debug-api-key'
      })
    });

    const keyData = await keyResponse.json();
    console.log('✅ API key test response:', JSON.stringify(keyData, null, 2));

    // Test 2: Try a different location to see if it's location-specific
    console.log('\n2. Testing with different location...');
    const searchResponse = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        location: 'New York, NY',
        radius: 5000,
        openNow: true
      })
    });

    const searchData = await searchResponse.json();
    console.log('✅ Search response:', JSON.stringify(searchData, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIKeyDebug(); 