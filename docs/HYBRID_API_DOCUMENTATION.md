# Google Places + ChatGPT API System Documentation

## Overview

The Google Places + ChatGPT API System provides enhanced restaurant data by combining Google Places API with ChatGPT processing. The system includes intelligent caching to optimize costs and performance.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   External      │
│   (React)       │◄──►│   Functions     │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ - useRoom.ts    │    │ - google-places │    │ - Google Places │
│ - RestaurantCard│    │ - chatgpt-proc  │    │ - OpenAI        │
│ - LocationModal │    │ - cache-manager │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Supabase      │
                    │   Database      │
                    │                 │
                    │ - chatgpt_cache│
                    └─────────────────┘
```

## Components

### 1. Google Places API Function
**File**: `supabase/functions/google-places/index.ts`

Fetches basic restaurant data from Google Places API including:
- Restaurant names and locations
- Ratings and price levels
- Photos and basic information
- Address and contact details
- Reverse geocoding for location detection

### 2. ChatGPT Processor Function
**File**: `supabase/functions/chatgpt-processor/index.ts`

Enhances restaurant data with AI processing:
- Cuisine classification
- Relevant tags from predefined list
- Contextual descriptions
- Confidence scores
- Caching for cost optimization

### 3. Cache Manager Function
**File**: `supabase/functions/cache-manager/index.ts`

Manages caching of ChatGPT results:
- Check cache before processing
- Save new results to database
- Provide cache statistics
- Cleanup expired entries

### 4. Hybrid Integration Layer
**File**: `src/integrations/supabase/hybridRestaurants.ts`

Orchestrates the entire system:
- Calls Google Places API
- Checks cache for each restaurant
- Processes uncached restaurants with ChatGPT
- Returns enhanced restaurant data

## Database Schema

### ChatGPT Cache Table
```sql
CREATE TABLE chatgpt_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_name TEXT NOT NULL,
  google_place_id TEXT,
  cuisine TEXT,
  tags TEXT[],
  description TEXT,
  confidence_score INTEGER,
  raw_chatgpt_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_name)
);
```

## API Usage

### Frontend Integration

```typescript
import { getSupabaseWorldwideRestaurantsAPI } from '@/integrations/supabase/worldwideRestaurants';

const api = getSupabaseWorldwideRestaurantsAPI();

// Search with Google Places + ChatGPT system
const restaurants = await api.searchRestaurants({
  location: 'New York, NY',
  radius: 5000,
  limit: 20
});
```

### Direct Function Calls

```typescript
// Google Places API
const { data, error } = await supabase.functions.invoke('google-places', {
  body: {
    action: 'search-restaurants',
    location: 'New York, NY',
    radius: 5000,
    limit: 10
  }
});

// ChatGPT Processor
const { data, error } = await supabase.functions.invoke('chatgpt-processor', {
  body: {
    action: 'process-restaurants',
    restaurants: googlePlacesData.restaurants,
    google_place_id: 'New York, NY'
  }
});

// Cache Manager
const { data, error } = await supabase.functions.invoke('cache-manager', {
  body: { action: 'get-stats' }
});
```

## Restaurant Interface

The enhanced Restaurant interface includes new fields:

```typescript
interface Restaurant {
  // Existing fields
  id: string;
  name: string;
  cuisine: string;
  image: string;
  images?: string[];
  rating: number;
  priceRange: string;
  distance: string;
  estimatedTime: string;
  description: string;
  tags: string[];
  
  // NEW FIELDS FOR GOOGLE PLACES + CHATGPT SYSTEM
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  googleTypes?: string[];
  processedByChatGPT?: boolean; // Track if ChatGPT processed this
  chatGPTConfidence?: number; // Confidence score from ChatGPT
}
```

## UI Components

### RestaurantCard Enhancements

The RestaurantCard component now displays:
- **AI Enhanced Badge**: Purple badge with sparkles icon for ChatGPT-processed restaurants
- **Confidence Score**: Visual progress bar showing ChatGPT confidence (1-10)
- **Contact Information**: Address, phone, and website when available
- **Enhanced Tags**: Better categorization and display of restaurant tags

### Filter System

New filters available:
- **AI Enhanced Only**: Show only ChatGPT-processed restaurants
- **Minimum Confidence**: Filter by ChatGPT confidence score
- **High Confidence Only**: Show restaurants with confidence 8+
- **Cached Data Only**: Show restaurants with cached ChatGPT data

## Testing

### Run System Tests
```bash
node scripts/test/test-hybrid-system.js
```

### Run Performance Monitoring
```bash
# Check system health
node scripts/monitor/monitor-hybrid-performance.js health

# Run performance test
node scripts/monitor/monitor-hybrid-performance.js test 10

# Start continuous monitoring
node scripts/monitor/monitor-hybrid-performance.js monitor 30000
```

## Environment Variables

Required environment variables:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External APIs
GOOGLE_PLACES_API_KEY=your_google_places_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Deployment

### Deploy Supabase Functions
```bash
cd supabase
npx supabase functions deploy google-places
npx supabase functions deploy chatgpt-processor
npx supabase functions deploy cache-manager
npx supabase functions deploy hybrid-restaurants
```

### Set Environment Variables
```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your_key
supabase secrets set OPENAI_API_KEY=your_key
```

## Performance Optimization

### Caching Strategy
- ChatGPT results are cached by restaurant name
- Cache hit rate target: >70%
- Estimated cost savings: 80%+ reduction in ChatGPT API calls

### Response Time Targets
- Google Places API: <2 seconds
- ChatGPT processing: <3 seconds per restaurant
- Overall system response: <5 seconds

### Error Handling
- Graceful degradation for API failures
- Retry logic for transient errors
- Fallback to basic Google Places data if ChatGPT fails

## Monitoring

### Key Metrics
- Response times for each API
- Cache hit/miss rates
- ChatGPT API usage and costs
- Error rates and types
- AI enhancement success rate

### Alerts
- Response time >5 seconds
- Cache hit rate <50%
- Error rate >10%
- ChatGPT API quota exceeded

## Troubleshooting

### Common Issues

1. **Google Places API Errors**
   - Check API key validity
   - Verify quota limits
   - Check location format

2. **ChatGPT Processing Failures**
   - Verify OpenAI API key
   - Check rate limits
   - Review prompt formatting

3. **Cache Issues**
   - Check database connectivity
   - Verify table schema
   - Review cache policies

4. **Performance Issues**
   - Monitor response times
   - Check cache hit rates
   - Review API quotas

### Debug Commands
```bash
# Test individual components
node scripts/test/test-hybrid-system.js

# Check cache statistics
curl -X POST "https://your-project.supabase.co/functions/v1/cache-manager" \
  -H "Authorization: Bearer your_anon_key" \
  -H "Content-Type: application/json" \
  -d '{"action": "get-stats"}'

# Monitor system health
node scripts/monitor/monitor-hybrid-performance.js health
```

## Future Enhancements

### Planned Features
- Advanced filtering options
- User preference learning
- Integration with additional APIs
- Machine learning improvements
- Real-time collaboration features

### Optimization Opportunities
- Batch processing for ChatGPT
- Intelligent cache invalidation
- Predictive caching
- Cost optimization algorithms

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review system logs
3. Run diagnostic tests
4. Contact the development team

---

**Document Version**: 1.0
**Last Updated**: [Current Date]
**Next Review**: [Implementation Date + 1 week] 