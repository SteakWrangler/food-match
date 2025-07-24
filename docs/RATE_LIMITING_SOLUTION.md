# Rate Limiting Solution for API Overusage Prevention

## Overview

This document outlines multiple strategies to prevent API overusage when your app is publicly accessible without charging. The goal is to set hard limits on API calls per day to control costs while maintaining functionality.

## Current API Usage

Your app currently uses:
- **Google Places API** - Restaurant search and details
- **ChatGPT API** - AI enhancement (currently disabled)
- **Supabase Edge Functions** - As intermediary

## Solution Options

### 1. **Supabase Edge Function Rate Limiting** (Recommended)

**How it works:**
- Track API usage per user/IP in Supabase database
- Set daily limits (e.g., 100 Google Places calls per day)
- Block requests when limits are exceeded
- Clean up old usage data automatically

**Implementation:**
```typescript
// Rate limits per day
const RATE_LIMITS = {
  'google-places': 100,  // 100 requests per day
  'chatgpt': 50,         // 50 requests per day
  'general': 200         // 200 requests per day
};
```

**Benefits:**
- ✅ Granular control per API type
- ✅ Per-user/IP tracking
- ✅ Database-backed (persistent across restarts)
- ✅ Automatic cleanup of old data
- ✅ Fail-safe (allows requests if rate limiting fails)

**Files to create:**
- `supabase/migrations/20250115000005_create_api_usage_table.sql`
- `supabase/functions/rate-limiter/index.ts` (optional standalone function)

**Files to modify:**
- `supabase/functions/google-places/index.ts` (add rate limiting)
- `supabase/functions/chatgpt-processor/index.ts` (add rate limiting)

### 2. **Supabase Project-Level Limits**

**How it works:**
- Set limits at the Supabase project level
- Configure in Supabase dashboard
- Applies to all Edge Function invocations

**Configuration:**
```bash
# In Supabase dashboard
Edge Functions: 100,000 invocations/month
Database: 500MB storage
Bandwidth: 50GB/month
```

**Benefits:**
- ✅ Simple to configure
- ✅ No code changes required
- ✅ Project-wide protection

**Limitations:**
- ❌ Not per-user/IP specific
- ❌ Not per-API type specific
- ❌ Hard to customize limits

### 3. **External API Provider Limits**

**Google Places API:**
- Set quotas in Google Cloud Console
- Configure daily limits per API key
- Monitor usage in Google Cloud Console

**OpenAI API:**
- Set spending limits in OpenAI dashboard
- Configure rate limits per API key
- Monitor usage in OpenAI dashboard

**Benefits:**
- ✅ Direct control at API level
- ✅ Real-time monitoring
- ✅ Automatic blocking when exceeded

**Limitations:**
- ❌ Requires separate configuration per API
- ❌ No unified dashboard
- ❌ Hard to coordinate across APIs

### 4. **Application-Level Rate Limiting**

**How it works:**
- Track usage in your React app
- Store limits in localStorage
- Block requests client-side

**Implementation:**
```typescript
// In your React app
const checkClientSideRateLimit = (apiType: string) => {
  const key = `rate_limit_${apiType}`;
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem(key) || '{}');
  
  if (usage.date !== today) {
    usage.count = 0;
    usage.date = today;
  }
  
  if (usage.count >= DAILY_LIMITS[apiType]) {
    throw new Error('Daily limit exceeded');
  }
  
  usage.count++;
  localStorage.setItem(key, JSON.stringify(usage));
};
```

**Benefits:**
- ✅ No server changes required
- ✅ Immediate implementation
- ✅ Works offline

**Limitations:**
- ❌ Easy to bypass (clear localStorage)
- ❌ Not shared across devices
- ❌ Can be manipulated by users

## Recommended Implementation

### Phase 1: Database-Backed Rate Limiting

1. **Create API usage table:**
```sql
-- Run migration: 20250115000005_create_api_usage_table.sql
CREATE TABLE public.api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

2. **Add rate limiting to Google Places function:**
```typescript
// In supabase/functions/google-places/index.ts
const RATE_LIMIT_CONFIG = {
  maxRequests: 100, // 100 requests per day
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  keyPrefix: 'google_places'
};
```

3. **Deploy the changes:**
```bash
# Deploy migration
npx supabase db push

# Deploy updated function
npx supabase functions deploy google-places
```

### Phase 2: Monitoring and Alerts

1. **Create usage monitoring dashboard:**
```typescript
// Monitor API usage
const getUsageStats = async () => {
  const { data } = await supabase
    .from('api_usage')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24*60*60*1000).toISOString());
  
  return {
    total: data?.length || 0,
    byKey: groupBy(data, 'key'),
    byHour: groupByHour(data)
  };
};
```

2. **Set up alerts:**
- Email notifications when usage exceeds 80% of daily limit
- Slack/Discord webhooks for real-time alerts
- Dashboard for monitoring usage patterns

### Phase 3: Advanced Features

1. **User Authentication Integration:**
```typescript
// Track authenticated users separately
const identifier = user ? `user:${user.id}` : `ip:${ip}`;
```

2. **Different Limits for Different Users:**
```typescript
const getRateLimit = (userType: string) => {
  switch (userType) {
    case 'premium': return 500;
    case 'authenticated': return 200;
    default: return 100;
  }
};
```

3. **Graceful Degradation:**
```typescript
// When rate limited, return cached data
if (rateLimitExceeded) {
  return getCachedRestaurants(location);
}
```

## Configuration Options

### Daily Limits (Recommended)
```typescript
const DAILY_LIMITS = {
  'google-places': 100,    // 100 restaurant searches per day
  'chatgpt': 50,          // 50 AI enhancements per day
  'geocoding': 200,       // 200 location lookups per day
  'total': 500            // 500 total API calls per day
};
```

### Hourly Limits (Alternative)
```typescript
const HOURLY_LIMITS = {
  'google-places': 10,    // 10 restaurant searches per hour
  'chatgpt': 5,          // 5 AI enhancements per hour
  'geocoding': 20,       // 20 location lookups per hour
  'total': 50            // 50 total API calls per hour
};
```

### Per-User Limits
```typescript
const USER_LIMITS = {
  'anonymous': 50,        // 50 calls per day for anonymous users
  'authenticated': 200,   // 200 calls per day for authenticated users
  'premium': 1000        // 1000 calls per day for premium users
};
```

## Cost Estimation

### Current API Costs (Estimated)
- **Google Places API**: $0.017 per request
- **ChatGPT API**: $0.002 per 1K tokens
- **Supabase Edge Functions**: $0.0000002 per 100ms

### With Rate Limiting
- **100 Google Places calls/day**: $1.70/day
- **50 ChatGPT calls/day**: $0.10/day
- **Total**: ~$1.80/day ($54/month)

### Without Rate Limiting
- **Unlimited usage**: Could exceed $100+/day
- **Risk**: Malicious users could rack up huge bills

## Implementation Steps

### Step 1: Create Database Table
```bash
# Run the migration
npx supabase db push
```

### Step 2: Update Google Places Function
```bash
# Deploy updated function with rate limiting
npx supabase functions deploy google-places
```

### Step 3: Test Rate Limiting
```bash
# Test with multiple requests
curl -X POST https://your-project.supabase.co/functions/v1/google-places \
  -H "Content-Type: application/json" \
  -d '{"action":"search-restaurants","location":"New York"}'
```

### Step 4: Monitor Usage
```bash
# Check usage in Supabase dashboard
# Or query the api_usage table directly
```

## Error Handling

### Rate Limit Exceeded Response
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "remaining": 0,
  "resetTime": 1640995200000,
  "limit": 100,
  "window": "24h"
}
```

### Graceful Fallback
```typescript
// When rate limited, return cached/mock data
if (error.message.includes('Rate limit exceeded')) {
  return getCachedRestaurants(location) || getMockRestaurants();
}
```

## Monitoring and Alerts

### Usage Dashboard
- Track daily/hourly usage patterns
- Identify peak usage times
- Monitor for unusual activity

### Alert Thresholds
- **Warning**: 80% of daily limit reached
- **Critical**: 95% of daily limit reached
- **Emergency**: 100% of daily limit reached

### Notification Channels
- Email alerts to admin
- Slack/Discord webhooks
- Supabase dashboard monitoring

## Security Considerations

### Rate Limit Bypass Prevention
- Use IP-based tracking as fallback
- Implement request signing
- Monitor for suspicious patterns

### Data Privacy
- Don't store sensitive user data in usage logs
- Anonymize IP addresses after 7 days
- Comply with privacy regulations

## Future Enhancements

### Advanced Features
1. **Geographic Rate Limiting**: Different limits per country/region
2. **Time-based Limits**: Higher limits during off-peak hours
3. **Dynamic Limits**: Adjust based on server load
4. **Whitelist/Blacklist**: Allow/block specific IPs or users

### Integration Options
1. **Payment Integration**: Allow users to purchase additional API calls
2. **Subscription Tiers**: Different limits for different subscription levels
3. **Usage Analytics**: Detailed usage reports and insights

## Conclusion

The recommended approach is **Database-Backed Rate Limiting** because it provides:
- ✅ Granular control per API type
- ✅ Persistent tracking across restarts
- ✅ Per-user/IP specific limits
- ✅ Easy to implement and maintain
- ✅ Cost-effective protection

This solution will prevent API overusage while maintaining a good user experience for legitimate users. 