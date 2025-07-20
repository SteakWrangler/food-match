// Test script to try different API key formats
// Run with: node test-api-variations.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testAPIVariations() {
  console.log('🔍 Testing different API variations...\n');

  try {
    // Test 1: Try with different headers
    console.log('1. Testing with different headers...');
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'User-Agent': 'FoodieFindMatch/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        action: 'debug-api-key'
      })
    });

    const data1 = await response1.json();
    console.log('✅ Test 1 response:', JSON.stringify(data1, null, 2));

    // Test 2: Try a simple location search without any extra parameters
    console.log('\n2. Testing simple location search...');
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        location: 'San Diego, CA'
      })
    });

    const data2 = await response2.json();
    console.log('✅ Test 2 response:', JSON.stringify(data2, null, 2));

    // Test 3: Try with a different endpoint or action
    console.log('\n3. Testing with different action...');
    const response3 = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'test-restaurant-search'
      })
    });

    const data3 = await response3.json();
    console.log('✅ Test 3 response:', JSON.stringify(data3, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIVariations(); 