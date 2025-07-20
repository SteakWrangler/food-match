#!/bin/bash

echo "🔧 Setting up Supabase CLI for migrations..."

# Check if we're linked to the project
echo "📋 Checking project link..."
supabase projects list | grep "ahfytcfndbnwrabryjnz"

echo ""
echo "📝 To get your database password:"
echo "1. Go to: https://supabase.com/dashboard/project/ahfytcfndbnwrabryjnz/settings/database"
echo "2. Look for 'Database Password'"
echo "3. Copy the password"
echo ""
echo "🔑 Once you have the password, you can run:"
echo "supabase db pull -p 'YOUR_PASSWORD'"
echo "supabase db push -p 'YOUR_PASSWORD'"
echo "supabase migration new your_migration_name"
echo ""
echo "💡 Or set it as an environment variable:"
echo "export SUPABASE_DB_PASSWORD='your_password'"
echo ""
echo "🚀 Then you can run migrations without the -p flag!" 