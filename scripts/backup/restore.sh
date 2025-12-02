#!/bin/bash

# Database Restore Script for Beauty with AI Precision
# Usage: ./scripts/backup/restore.sh [environment] [backup_file]

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_FILE=${2:-latest}
BACKUP_DIR="backups/database"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    source .env.${ENVIRONMENT}
elif [ -f ".env.local" ]; then
    source .env.local
fi

echo "🔄 Starting database restore for ${ENVIRONMENT}..."

# Find backup file if not specified
if [ "$BACKUP_FILE" = "latest" ]; then
    BACKUP_FILE=$(ls -t "${BACKUP_DIR}/${ENVIRONMENT}_backup_"*.gz | head -1)
    if [ -z "$BACKUP_FILE" ]; then
        echo "❌ No backup files found"
        exit 1
    fi
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "📁 Restoring from: $BACKUP_FILE"

# Extract project reference
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

# Confirm restore
echo "⚠️  This will overwrite the current database!"
read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Decompress backup if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "🗜️  Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > "/tmp/restore_${ENVIRONMENT}.sql"
    RESTORE_FILE="/tmp/restore_${ENVIRONMENT}.sql"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Restore database
echo "🔄 Restoring database..."
psql "postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres" < "$RESTORE_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restore completed successfully"
else
    echo "❌ Database restore failed"
    exit 1
fi

# Clean up
rm -f "/tmp/restore_${ENVIRONMENT}.sql"

echo "🎉 Database restore completed!"
