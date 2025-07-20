const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your actual URL
const supabaseKey = 'your-anon-key'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoadMoreRestaurants() {
  try {
    console.log('Testing restaurant search with limit 50...');
    
    const { data, error } = await supabase.functions.invoke('worldwide-restaurants', {
      body: {
        action: 'search-restaurants',
        location: 'San Diego, CA',
        radius: 5000,
        openNow: true,
        limit: 50
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      return;
    }

    if (!data) {
      console.error('No data returned from function');
      return;
    }

    console.log('Function response:', data);
    
    if (data.restaurants) {
      console.log(`Successfully loaded ${data.restaurants.length} restaurants`);
    } else if (data.error) {
      console.error('API error:', data.error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLoadMoreRestaurants(); 