#!/bin/bash

# Storage Backup Script for Beauty with AI Precision
# Backs up Supabase storage files

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="backups/storage"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${ENVIRONMENT}_storage_${DATE}.tar.gz"
LOG_FILE="backups/logs/storage_backup_${DATE}.log"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    source .env.${ENVIRONMENT}
elif [ -f ".env.local" ]; then
    source .env.local
fi

echo "🚀 Starting storage backup for ${ENVIRONMENT}..."
echo "📅 Date: $(date)"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

# Storage directories to backup
STORAGE_BUCKETS=(
    "skin-analysis-images"
    "profile-photos" 
    "treatment-images"
    "documents"
)

TEMP_DIR="/tmp/supabase_backup_${DATE}"
mkdir -p "${TEMP_DIR}"

echo "📦 Downloading storage files..."

# Download each bucket
for bucket in "${STORAGE_BUCKETS[@]}"; do
    echo "  📁 Downloading ${bucket}..."
    
    # Use Supabase CLI to download bucket
    if command -v supabase &> /dev/null; then
        supabase storage download --bucket "${bucket}" --path "${TEMP_DIR}/${bucket}" 2>/dev/null || {
            echo "  ⚠️  Bucket ${bucket} may be empty or inaccessible"
        }
    fi
done

# Create compressed archive
echo "🗜️  Creating compressed archive..."
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" -C "${TEMP_DIR}" .

# Calculate file size
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
echo "📊 Backup size: ${BACKUP_SIZE}"

# Upload to cloud storage
if [ ! -z "$AWS_S3_BUCKET" ] && [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "☁️  Uploading to S3..."
    aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/backups/storage/${BACKUP_FILE}"
    echo "✅ Uploaded to S3"
fi

# Clean temporary directory
rm -rf "${TEMP_DIR}"

# Clean old backups
echo "🧹 Cleaning old storage backups..."
find "${BACKUP_DIR}" -name "${ENVIRONMENT}_storage_*.tar.gz" -mtime +30 -delete

# Log completion
echo "✅ Storage backup completed: ${BACKUP_FILE}" | tee -a "${LOG_FILE}"

echo "🎉 Storage backup process completed!"
