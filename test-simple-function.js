// Simple test to check if the function is working
// Run with: node test-simple-function.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testSimpleFunction() {
  console.log('🧪 Testing simple function...\n');

  try {
    // Test 1: Basic function call
    console.log('1. Testing basic function call...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'debug-api-key'
      })
    });

    const data = await response.json();
    console.log('✅ Function response:', JSON.stringify(data, null, 2));

    // Test 2: Check if the API key is being read correctly
    if (data.hasApiKey) {
      console.log('✅ API key is present');
      console.log('✅ API key length:', data.apiKeyLength);
      
      if (data.testResponseStatus === 429) {
        console.log('❌ Still getting HTTP 429 from Zyla Labs API');
        console.log('This suggests there might be an issue with the Zyla Labs API itself');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleFunction(); 