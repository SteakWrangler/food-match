// Test script to investigate the coordinate search 503 error
// Run with: node test-coordinate-issue.js

const SUPABASE_URL = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

async function testCoordinateIssue() {
  console.log('🔍 Investigating coordinate search 503 error...\n');

  const testCases = [
    { name: 'San Diego coordinates', location: '32.7157, -117.1611' },
    { name: 'New York coordinates', location: '40.7128, -74.0060' },
    { name: 'Los Angeles coordinates', location: '34.0522, -118.2437' },
    { name: 'Chicago coordinates', location: '41.8781, -87.6298' },
    { name: 'Miami coordinates', location: '25.7617, -80.1918' }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name} (${testCase.location})`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/worldwide-restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          location: testCase.location,
          radius: 5000,
          openNow: true
        })
      });

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
    
    console.log(''); // Add spacing between tests
  }
}

testCoordinateIssue(); 