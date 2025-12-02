#!/bin/bash

# Database Backup Script for Beauty with AI Precision
# Usage: ./scripts/backup/database.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${ENVIRONMENT}_backup_${DATE}.sql"
LOG_FILE="backups/logs/backup_${DATE}.log"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    source .env.${ENVIRONMENT}
elif [ -f ".env.local" ]; then
    source .env.local
else
    echo "❌ Environment file not found"
    exit 1
fi

# Validate required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Supabase credentials not configured"
    exit 1
fi

echo "🚀 Starting database backup for ${ENVIRONMENT}..."
echo "📅 Date: $(date)"
echo "📁 Backup file: ${BACKUP_FILE}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

# Database backup using Supabase CLI
if command -v supabase &> /dev/null; then
    echo "📦 Using Supabase CLI..."
    
    # Generate database dump
    supabase db dump --db-url "postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres" > "${BACKUP_DIR}/${BACKUP_FILE}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database backup completed successfully"
        
        # Compress backup
        gzip "${BACKUP_DIR}/${BACKUP_FILE}"
        BACKUP_FILE="${BACKUP_FILE}.gz"
        
        # Calculate file size
        BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
        echo "📊 Backup size: ${BACKUP_SIZE}"
        
        # Upload to cloud storage (optional)
        if [ ! -z "$AWS_S3_BUCKET" ] && [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
            echo "☁️  Uploading to S3..."
            aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/backups/database/${BACKUP_FILE}"
            echo "✅ Uploaded to S3"
        fi
        
        # Clean old backups
        echo "🧹 Cleaning old backups..."
        ./scripts/backup/cleanup.sh database "${ENVIRONMENT}"
        
    else
        echo "❌ Database backup failed"
        exit 1
    fi
else
    echo "⚠️  Supabase CLI not found, using pg_dump..."
    
    # Fallback to pg_dump if Supabase CLI not available
    pg_dump "postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres" > "${BACKUP_DIR}/${BACKUP_FILE}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database backup completed (pg_dump)"
        gzip "${BACKUP_DIR}/${BACKUP_FILE}"
    else
        echo "❌ pg_dump backup failed"
        exit 1
    fi
fi

# Log backup completion
echo "✅ Backup completed: ${BACKUP_FILE}" | tee -a "${LOG_FILE}"

# Send notification (optional)
if [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST "${WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d '{
            "text": "✅ Database backup completed for '${ENVIRONMENT}'",
            "attachments": [{
                "fields": [{
                    "title": "File",
                    "value": "'${BACKUP_FILE}'",
                    "short": true
                }, {
                    "title": "Size", 
                    "value": "'${BACKUP_SIZE}'",
                    "short": true
                }, {
                    "title": "Date",
                    "value": "'$(date)'",
                    "short": true
                }]
            }]
        }'
fi

echo "🎉 Database backup process completed!"
