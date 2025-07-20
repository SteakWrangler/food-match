// Test script to see if retries help with 503 errors
// Run with: node test-retry-mechanism.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testWithRetries(location, maxRetries = 3) {
  console.log(`Testing "${location}" with up to ${maxRetries} retries...`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`  Attempt ${attempt}/${maxRetries}...`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          location: location,
          radius: 5000,
          openNow: true
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.log(`    ❌ Error: ${data.error}`);
        if (data.details) {
          console.log(`    Details: ${data.details}`);
        }
        
        // If it's a 503 error, wait before retrying
        if (data.error.includes('503')) {
          const waitTime = attempt * 2000; // 2s, 4s, 6s
          console.log(`    Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          // Non-503 error, don't retry
          console.log(`    Non-503 error, stopping retries`);
          break;
        }
      } else if (data.restaurants && data.restaurants.length > 0) {
        console.log(`    ✅ Success on attempt ${attempt}: Found ${data.restaurants.length} restaurants`);
        console.log(`    Sample: ${data.restaurants[0].name}`);
        return true;
      } else {
        console.log(`    ⚠️  No restaurants found`);
        break;
      }
      
    } catch (error) {
      console.log(`    ❌ Exception: ${error.message}`);
      break;
    }
  }
  
  console.log(`    ❌ All ${maxRetries} attempts failed`);
  return false;
}

async function testRetryMechanism() {
  console.log('🔄 Testing retry mechanism for 503 errors...\n');

  const testLocations = [
    'San Diego, CA',
    'New York, NY',
    'Los Angeles, CA'
  ];

  for (const location of testLocations) {
    console.log(`\n--- Testing: ${location} ---`);
    const success = await testWithRetries(location, 3);
    console.log(`Final result: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
}

testRetryMechanism(); 