#!/bin/bash

# Feedback System Setup Script
# This script helps deploy the feedback system components

echo "🚀 Setting up Feedback System..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy database migration
echo "📊 Deploying database migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migration deployed successfully"
else
    echo "❌ Failed to deploy database migration"
    exit 1
fi

# Deploy feedback processor function
echo "🔧 Deploying feedback processor function..."
supabase functions deploy feedback-processor

if [ $? -eq 0 ]; then
    echo "✅ Feedback processor function deployed successfully"
else
    echo "❌ Failed to deploy feedback processor function"
    exit 1
fi

# Deploy email service function (optional)
echo "📧 Deploying email service function..."
supabase functions deploy email-service

if [ $? -eq 0 ]; then
    echo "✅ Email service function deployed successfully"
else
    echo "⚠️  Failed to deploy email service function (this is optional)"
fi

echo ""
echo "🎉 Feedback system setup complete!"
echo ""
echo "Next steps:"
echo "1. Test the feedback form in your app"
echo "2. Check the Supabase dashboard for feedback submissions"
echo "3. Set up email notifications by configuring an email service"
echo "4. Monitor function logs for any issues"
echo ""
echo "For email integration, see FEEDBACK_SYSTEM_README.md" 