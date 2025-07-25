# Feedback System Implementation

This document describes the new feedback system that uses Supabase as an intermediary between users and email notifications.

## Overview

The feedback system has been updated to:
1. Store feedback submissions in a Supabase database
2. Process feedback through a Supabase Edge Function
3. Send email notifications from the server instead of opening the user's email client

## Components

### 1. Database Table (`feedback`)

The feedback table stores all user feedback with the following structure:
- `id`: UUID primary key
- `name`: Optional user name
- `email`: Optional user email
- `message`: Required feedback message
- `user_agent`: Browser/device information
- `ip_address`: User's IP address (captured server-side)
- `created_at`: Timestamp when feedback was submitted
- `processed_at`: Timestamp when feedback was processed
- `email_sent`: Boolean flag indicating if email was sent
- `email_sent_at`: Timestamp when email was sent

### 2. Supabase Functions

#### `feedback-processor`
- Handles feedback submission
- Stores feedback in the database
- Logs feedback for processing
- Returns success/error responses

#### `email-service` (Optional)
- Separate function for sending emails
- Can be integrated with email services like Resend, SendGrid, etc.
- Currently logs email content (ready for production integration)

### 3. Frontend Component

The `FeedbackHeader` component has been updated to:
- Call the `feedback-processor` function instead of opening email client
- Handle success/error responses
- Show appropriate toast notifications
- Reset form on successful submission

## Setup Instructions

### 1. Deploy Database Migration

Run the migration to create the feedback table:
```bash
supabase db push
```

### 2. Deploy Supabase Functions

Deploy the feedback processor function:
```bash
supabase functions deploy feedback-processor
```

Deploy the email service function (optional):
```bash
supabase functions deploy email-service
```

### 3. Environment Variables

For the email service to work in production, you'll need to set up:

1. **Resend API Key** (recommended):
   ```bash
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   ```

2. **Alternative Email Services**:
   - SendGrid
   - Mailgun
   - AWS SES
   - Or any other email service

### 4. Email Integration

To enable actual email sending, uncomment and configure the email service code in `supabase/functions/feedback-processor/index.ts`:

```typescript
// Example with Resend
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'feedback@tossortaste.com',
    to: 'linksmarttechllc@gmail.com',
    subject: 'New Feedback - Toss or Taste App',
    text: emailContent,
  }),
})
```

## Usage

### For Users
1. Click the feedback button (message circle icon) in the header
2. Fill out the feedback form (name and email are optional)
3. Submit the form
4. Receive confirmation toast

### For Administrators
1. Feedback is stored in the `feedback` table in Supabase
2. Check the Supabase dashboard or logs for new feedback
3. Set up email notifications by configuring the email service
4. Monitor feedback through the database or logs

## Security

- Row Level Security (RLS) is enabled on the feedback table
- Anonymous users can insert feedback
- Only service role can read/update feedback records
- User agent and IP address are captured for tracking

## Monitoring

### Database Queries

Check for new feedback:
```sql
SELECT * FROM feedback 
WHERE created_at >= NOW() - INTERVAL '24 hours' 
ORDER BY created_at DESC;
```

Check for unprocessed feedback:
```sql
SELECT * FROM feedback 
WHERE processed_at IS NULL 
ORDER BY created_at ASC;
```

### Function Logs

Monitor function execution in the Supabase dashboard:
1. Go to Functions in your Supabase project
2. Click on `feedback-processor`
3. View logs for any errors or issues

## Future Enhancements

1. **Email Templates**: Create HTML email templates for better formatting
2. **Feedback Categories**: Add categories like "Bug Report", "Feature Request", "General"
3. **Auto-Response**: Send confirmation emails to users who provide their email
4. **Feedback Dashboard**: Create an admin dashboard to view and manage feedback
5. **Rate Limiting**: Add rate limiting to prevent spam
6. **File Attachments**: Allow users to attach screenshots or files

## Troubleshooting

### Common Issues

1. **Function not found**: Ensure the function is deployed with `supabase functions deploy feedback-processor`
2. **Database errors**: Check that the migration has been applied
3. **Email not sending**: Verify email service configuration and API keys
4. **CORS errors**: Ensure the function has proper CORS headers

### Debug Steps

1. Check browser console for JavaScript errors
2. Check Supabase function logs for server-side errors
3. Verify database table exists and has correct structure
4. Test function directly using the Supabase dashboard 