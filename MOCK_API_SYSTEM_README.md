# Mock API System Documentation

## Overview

The application now uses a sophisticated mock API system that simulates the full API flow while returning hard-coded data. This allows for complete testing of the application's functionality without making actual API calls, while still maintaining all the normal application flow including Supabase data storage and room management.

## How It Works

### 1. Mock API Service (`src/integrations/supabase/mockApiService.ts`)

The mock API service simulates the complete API flow:

- **Google Places API Simulation**: Simulates the Google Places API call with realistic delays and response format
- **ChatGPT Processor Simulation**: Simulates the ChatGPT processing step with AI enhancement
- **Cache Manager Simulation**: Simulates cache management operations
- **Realistic Delays**: Adds appropriate delays to simulate real API response times
- **Error Simulation**: Occasionally simulates API failures to test error handling

### 2. API Flow Simulation

The mock system follows the exact same flow as the real API:

1. **Google Places API Call**: Simulates searching for restaurants
2. **ChatGPT Processing**: Simulates AI enhancement of restaurant data
3. **Data Transformation**: Transforms data into the expected format
4. **Room Storage**: Still uses Supabase to store data in rooms
5. **Cache Management**: Simulates cache operations

### 3. Data Storage

**Important**: The mock API system still uses Supabase for:
- Room creation and management
- Participant data storage
- Swipe data storage
- Restaurant data storage in rooms
- All database operations

Only the external API calls (Google Places, ChatGPT) are mocked.

## Files Modified

### 1. New Files Created
- `src/integrations/supabase/mockApiService.ts` - The main mock API service

### 2. Files Modified
- `src/integrations/supabase/hybridRestaurants.ts` - Updated to use mock API service
- `src/hooks/useRoom.ts` - Updated console messages to reflect mock API usage

## Configuration

### Enable Mock API Mode
```typescript
// In src/integrations/supabase/hybridRestaurants.ts
const USE_MOCK_API = true; // Enable mock API simulation
```

### Disable Mock API Mode
```typescript
// In src/integrations/supabase/hybridRestaurants.ts
const USE_MOCK_API = false; // Restore real API calls
```

## Mock Data

The mock API service provides realistic restaurant data including:

- **10 Sample Restaurants**: Diverse cuisines including French, Japanese, Mexican, Italian, American, Thai, Vegetarian, Dessert, Vietnamese, and Mediterranean
- **Complete Data**: Images, ratings, descriptions, tags, contact info, opening hours
- **AI Enhancement**: Simulated ChatGPT processing with confidence scores
- **Proper Format**: Returns data in the exact same format as real APIs

## Benefits

### 1. Complete Testing
- Tests the full application flow
- Tests error handling scenarios
- Tests API response processing
- Tests data transformation

### 2. Cost Savings
- No Google Places API usage
- No ChatGPT API usage
- No external API costs during development

### 3. Development Speed
- No API rate limits
- Consistent test data
- Predictable responses
- Fast iteration cycles

### 4. Realistic Data Format
- Returns data in the exact same format as real APIs
- Maintains proper data structure and field names
- Includes all required fields for the application
- Simulates the complete API response format

## Console Logging

The system provides detailed console logging to track the mock API flow:

```
🔧 MOCK API: Starting full API simulation for restaurant search
🔧 MOCK API: Simulating Google Places API call with params: {...}
🔧 MOCK API: Found 3 restaurants from Google Places
🔧 MOCK API: Simulating ChatGPT Processor API call with params: {...}
🔧 MOCK API: Processed 3 restaurants with ChatGPT
🔧 MOCK API: Fetched 3 initial restaurants from simulated API flow
```

## Data Format

The mock API service provides data in the exact same format as real APIs:

- **Google Places API**: Returns restaurant data with all required fields
- **ChatGPT Processing**: Returns enhanced data with AI processing metadata
- **Cache Operations**: Returns cache statistics in proper format

## Switching Between Modes

### To Enable Real API Calls
1. Set `USE_MOCK_API = false` in `hybridRestaurants.ts`
2. Remove the import of `getMockApiService`
3. Remove the mock API check in `searchRestaurants`
4. Delete `mockApiService.ts` when no longer needed

### To Enable Mock API Mode
1. Set `USE_MOCK_API = true` in `hybridRestaurants.ts`
2. Import `getMockApiService` from `./mockApiService`
3. Add the mock API check in `searchRestaurants`

## Room Management

**Important**: Room management still uses Supabase:

- ✅ Room creation and joining
- ✅ Participant management
- ✅ Swipe data storage
- ✅ Restaurant data storage
- ✅ Filter application
- ✅ Real-time updates (when polling is enabled)

Only the external restaurant search APIs are mocked.

## Testing Scenarios

The mock API system allows testing of:

1. **Normal Flow**: Successful API calls and data processing
2. **Data Format**: Proper input/output format validation
3. **Pagination**: Page token handling
4. **Filtering**: Price, cuisine, distance filters
5. **Cache Behavior**: Cache hits and misses
6. **Data Transformation**: Google Places to ChatGPT data flow

## Performance

The mock API system provides:
- **Fast Development**: No API rate limits or delays
- **Consistent Data**: Predictable test scenarios with 10 diverse restaurants
- **Proper Format**: Exact same data structure as real APIs
- **Complete Coverage**: All API endpoints simulated

## Future Enhancements

Potential improvements to the mock API system:

1. **More Sample Data**: Additional restaurant types and cuisines
2. **Dynamic Filtering**: Mock data that responds to filters
3. **Pagination Simulation**: Realistic page token behavior
4. **Geographic Variation**: Different data based on location
5. **Seasonal Data**: Time-based restaurant availability

## Troubleshooting

### Common Issues

1. **No Restaurants Loading**: Check if `USE_MOCK_API` is set correctly
2. **Console Errors**: Verify mock API service is properly imported
3. **Data Not Saving**: Check Supabase connection (room management still uses real database)
4. **Performance Issues**: Mock delays can be adjusted in `mockApiService.ts`

### Debug Mode

Enable detailed logging by checking the console for:
- `🔧 MOCK API:` prefixed messages
- API simulation steps
- Data transformation logs
- Error simulation messages 