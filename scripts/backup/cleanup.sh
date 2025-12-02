#!/bin/bash

# Backup Cleanup Script
# Removes old backups based on retention policy

set -e

BACKUP_TYPE=${1:-database}
ENVIRONMENT=${2:-production}
BACKUP_DIR="backups/${BACKUP_TYPE}"

echo "🧹 Cleaning old ${BACKUP_TYPE} backups for ${ENVIRONMENT}..."

# Retention policy
DAILY_RETENTION=7
WEEKLY_RETENTION=4  
MONTHLY_RETENTION=12

# Remove old daily backups (keep last N days)
echo "  🗓️  Removing old daily backups..."
find "${BACKUP_DIR}" -name "${ENVIRONMENT}_${BACKUP_TYPE}_*.sql.gz" -mtime +${DAILY_RETENTION} -delete

# Keep weekly backups (Sundays)
echo "  📅 Keeping weekly backups..."
find "${BACKUP_DIR}" -name "${ENVIRONMENT}_${BACKUP_TYPE}_*.sql.gz" -mtime +$((DAILY_RETENTION + WEEKLY_RETENTION * 7)) ! -newermt "$(date -d 'last sunday' +%Y-%m-%d)" -delete

# Keep monthly backups (1st of month)
echo "  📆 Keeping monthly backups..."
find "${BACKUP_DIR}" -name "${ENVIRONMENT}_${BACKUP_TYPE}_*.sql.gz" -mtime +$((DAILY_RETENTION + WEEKLY_RETENTION * 7 + MONTHLY_RETENTION * 30)) ! -newermt "$(date -d 'first day of last month' +%Y-%m-%d)" -delete

# Count remaining backups
REMAINING=$(find "${BACKUP_DIR}" -name "${ENVIRONMENT}_${BACKUP_TYPE}_*.sql.gz" | wc -l)
echo "📊 Remaining backups: ${REMAINING}"

echo "✅ Cleanup completed!"
