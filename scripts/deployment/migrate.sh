#!/bin/bash

# Supabase Migration Helper Script
# Your database password: kqXEz04mAm23jZpk

DB_PASSWORD="kqXEz04mAm23jZpk"

echo "🔧 Supabase Migration Helper"
echo ""

case "$1" in
  "new")
    if [ -z "$2" ]; then
      echo "Usage: ./migrate.sh new <migration_name>"
      echo "Example: ./migrate.sh new add_user_preferences"
      exit 1
    fi
    echo "📝 Creating new migration: $2"
    supabase migration new "$2" -p "$DB_PASSWORD"
    ;;
  
  "push")
    echo "🚀 Pushing migrations to remote database..."
    supabase db push -p "$DB_PASSWORD"
    ;;
  
  "pull")
    echo "📥 Pulling schema from remote database..."
    supabase db pull -p "$DB_PASSWORD"
    ;;
  
  "list")
    echo "📋 Listing migrations..."
    supabase migration list -p "$DB_PASSWORD"
    ;;
  
  "status")
    echo "📊 Migration status..."
    supabase migration list -p "$DB_PASSWORD"
    ;;
  
  *)
    echo "Usage: ./migrate.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  new <name>     - Create a new migration"
    echo "  push           - Push migrations to remote"
    echo "  pull           - Pull schema from remote"
    echo "  list           - List all migrations"
    echo "  status         - Show migration status"
    echo ""
    echo "Examples:"
    echo "  ./migrate.sh new add_google_places_integration"
    echo "  ./migrate.sh push"
    echo "  ./migrate.sh list"
    ;;
esac 