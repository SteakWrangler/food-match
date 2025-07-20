// Debug test script to check API key and Zyla Labs API
// Run with: node test-debug-api.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testDebugAPI() {
  console.log('🔍 Debugging Worldwide Restaurants API...\n');

  try {
    // Test 1: Check API key
    console.log('1. Testing API key...');
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

    // Test 2: Test restaurant search step by step
    console.log('\n2. Testing restaurant search step by step...');
    const searchResponse = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'test-restaurant-search'
      })
    });

    const searchData = await searchResponse.json();
    console.log('✅ Restaurant search test response:', JSON.stringify(searchData, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDebugAPI(); 