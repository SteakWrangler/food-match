# Quick Rate Limit Setup Guide

## Overview
This guide will help you implement rate limiting to prevent API overusage when your app is publicly accessible.

## Current Situation
- Your app is free and publicly accessible
- Uses Google Places API (costs money per request)
- No protection against unlimited usage
- Risk of high costs if someone abuses the API

## Quick Solution (Recommended)

### Step 1: Create the Database Table
Run this migration to create the API usage tracking table:

```bash
# Deploy the migration
npx supabase db push
```

The migration creates a table called `api_usage` that tracks:
- Which user/IP made the request
- When the request was made
- What type of API was called

### Step 2: Set Daily Limits
Configure these limits in your Supabase Edge Functions:

```typescript
// Recommended daily limits
const DAILY_LIMITS = {
  'google-places': 100,    // 100 restaurant searches per day
  'chatgpt': 50,          // 50 AI enhancements per day (if enabled)
  'geocoding': 200,       // 200 location lookups per day
  'total': 500            // 500 total API calls per day
};
```

### Step 3: Deploy Rate Limiting
Update your Google Places function to include rate limiting:

```bash
# Deploy the updated function
npx supabase functions deploy google-places
```

## What This Protects Against

### Scenario 1: Random User Finds Your Site
- **Before**: Could make unlimited API calls, racking up huge bills
- **After**: Limited to 100 restaurant searches per day

### Scenario 2: Malicious User
- **Before**: Could write a script to spam your API
- **After**: Blocked after 100 requests per day

### Scenario 3: Accidental Overuse
- **Before**: Legitimate users could accidentally use too much
- **After**: Clear limits prevent accidental overuse

## Cost Protection

### Current Risk
- **Google Places API**: $0.017 per request
- **Unlimited usage**: Could cost $100+/day
- **Monthly risk**: $3,000+ per month

### With Rate Limiting
- **100 requests/day**: $1.70/day
- **Monthly cost**: ~$54/month
- **Savings**: 98% cost reduction

## Implementation Options

### Option 1: Simple Database Rate Limiting (Recommended)
**Pros:**
- ✅ Easy to implement
- ✅ Persistent across restarts
- ✅ Per-user/IP tracking
- ✅ Automatic cleanup

**Cons:**
- ❌ Requires database table
- ❌ Small performance overhead

### Option 2: Supabase Project Limits
**Pros:**
- ✅ No code changes needed
- ✅ Set in Supabase dashboard
- ✅ Project-wide protection

**Cons:**
- ❌ Not per-user specific
- ❌ Hard to customize
- ❌ Affects all functions

### Option 3: External API Limits
**Pros:**
- ✅ Direct control at API level
- ✅ Real-time monitoring

**Cons:**
- ❌ Requires separate setup per API
- ❌ No unified dashboard

## Quick Start Commands

```bash
# 1. Deploy the database migration
npx supabase db push

# 2. Deploy the updated Google Places function
npx supabase functions deploy google-places

# 3. Test the rate limiting
curl -X POST https://your-project.supabase.co/functions/v1/google-places \
  -H "Content-Type: application/json" \
  -d '{"action":"search-restaurants","location":"New York"}'

# 4. Check usage in Supabase dashboard
# Go to: https://supabase.com/dashboard/project/[your-project]/database
# Query: SELECT * FROM api_usage ORDER BY timestamp DESC LIMIT 10;
```

## Monitoring Your Usage

### Check Daily Usage
```sql
-- Run this in Supabase SQL editor
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as requests,
  COUNT(DISTINCT key) as unique_users
FROM api_usage 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Check Current Day Usage
```sql
-- Run this in Supabase SQL editor
SELECT 
  key,
  COUNT(*) as requests_today
FROM api_usage 
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY key
ORDER BY requests_today DESC;
```

## Error Messages Users Will See

When rate limit is exceeded:
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "remaining": 0,
  "resetTime": 1640995200000,
  "limit": 100,
  "window": "24h"
}
```

## Customization Options

### Adjust Limits
```typescript
// In your Edge Function
const RATE_LIMIT_CONFIG = {
  maxRequests: 50,  // Change this number
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  keyPrefix: 'google_places'
};
```

### Different Limits for Different APIs
```typescript
const getRateLimit = (apiType: string) => {
  switch (apiType) {
    case 'google-places': return 100;
    case 'chatgpt': return 50;
    case 'geocoding': return 200;
    default: return 50;
  }
};
```

### Per-User Limits
```typescript
const getUserLimit = (userType: string) => {
  switch (userType) {
    case 'premium': return 500;
    case 'authenticated': return 200;
    default: return 100;
  }
};
```

## Troubleshooting

### Rate Limiting Not Working
1. Check if the `api_usage` table exists
2. Verify the function was deployed successfully
3. Check Supabase logs for errors

### Too Many False Positives
1. Increase the daily limit
2. Check if IP detection is working correctly
3. Verify the time window is correct

### Performance Issues
1. Add database indexes (already included in migration)
2. Clean up old usage data regularly
3. Monitor database query performance

## Next Steps

### Phase 1: Basic Protection (Current)
- ✅ Implement daily limits
- ✅ Track usage per user/IP
- ✅ Block excessive requests

### Phase 2: Enhanced Monitoring
- [ ] Add usage dashboard
- [ ] Set up email alerts
- [ ] Monitor usage patterns

### Phase 3: Advanced Features
- [ ] Different limits for different user types
- [ ] Geographic rate limiting
- [ ] Time-based limits
- [ ] Payment integration for additional usage

## Support

If you need help implementing this:
1. Check the Supabase logs for errors
2. Verify the database migration ran successfully
3. Test with a small number of requests first
4. Monitor usage in the Supabase dashboard

This solution will protect your API costs while maintaining a good user experience for legitimate users. 