// Test script to check API key format and authentication
// Run with: node test-api-key-format.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testAPIKeyFormat() {
  console.log('🔍 Testing API key format and authentication...\n');

  try {
    // Test 1: Check if the API key is being read correctly
    console.log('1. Testing API key reading...');
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'debug-api-key-v2'
      })
    });

    const data1 = await response1.json();
    console.log('✅ Test 1 response:', JSON.stringify(data1, null, 2));

    // Test 2: Try with a different API endpoint to see if it's endpoint-specific
    console.log('\n2. Testing with a different approach...');
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'debug-api-key'
      })
    });

    const data2 = await response2.json();
    console.log('✅ Test 2 response:', JSON.stringify(data2, null, 2));

    // Test 3: Check if there's a different authentication method
    console.log('\n3. Testing with different auth method...');
    const response3 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-API-Key': 'test', // Try adding an additional header
      },
      body: JSON.stringify({
        action: 'debug-api-key'
      })
    });

    const data3 = await response3.json();
    console.log('✅ Test 3 response:', JSON.stringify(data3, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIKeyFormat(); 