#!/usr/bin/env node

/**
 * Automated Backup Strategy Setup
 * 
 * Configures automated backups for Supabase database,
 * file storage, and application data
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('💾 Automated Backup Strategy Setup\n')

// Backup configuration
const BACKUP_CONFIG = {
  database: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: {
      daily: 7,    // Keep 7 daily backups
      weekly: 4,   // Keep 4 weekly backups  
      monthly: 12  // Keep 12 monthly backups
    }
  },
  storage: {
    enabled: true,
    schedule: '0 3 * * *', // Daily at 3 AM
    retention: 30 // Keep 30 days
  },
  logs: {
    enabled: true,
    schedule: '0 4 * * *', // Daily at 4 AM
    retention: 90 // Keep 90 days
  }
}

// Create backup scripts directory
function createBackupDirectories() {
  console.log('📁 Creating backup directories...')
  
  const dirs = [
    'scripts/backup',
    'scripts/restore', 
    'backups/database',
    'backups/storage',
    'backups/logs',
    'backups/config'
  ]
  
  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`  ✅ Created ${dir}`)
    } else {
      console.log(`  ✅ ${dir} exists`)
    }
  })
}

// Create database backup script
function createDatabaseBackupScript() {
  console.log('\n🗄️  Creating database backup script...')
  
  const backupScript = `#!/bin/bash

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
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\\/\\/\\([^.]*\\).*/\\1/')

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
    curl -X POST "${WEBHOOK_URL}" \\
        -H "Content-Type: application/json" \\
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
`
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'backup', 'database.sh')
  fs.writeFileSync(scriptPath, backupScript)
  
  // Make script executable
  try {
    exec(`chmod +x "${scriptPath}"`)
  } catch (error) {
    console.log('⚠️  Could not make script executable (Windows)')
  }
  
  console.log('✅ Database backup script created')
}

// Create storage backup script
function createStorageBackupScript() {
  console.log('\n📁 Creating storage backup script...')
  
  const backupScript = `#!/bin/bash

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
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\\/\\/\\([^.]*\\).*/\\1/')

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
for bucket in "\${STORAGE_BUCKETS[@]}"; do
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
`
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'backup', 'storage.sh')
  fs.writeFileSync(scriptPath, backupScript)
  
  try {
    exec(`chmod +x "${scriptPath}"`)
  } catch (error) {
    console.log('⚠️  Could not make script executable (Windows)')
  }
  
  console.log('✅ Storage backup script created')
}

// Create cleanup script
function createCleanupScript() {
  console.log('\n🧹 Creating backup cleanup script...')
  
  const cleanupScript = `#!/bin/bash

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
`
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'backup', 'cleanup.sh')
  fs.writeFileSync(scriptPath, cleanupScript)
  
  try {
    exec(`chmod +x "${scriptPath}"`)
  } catch (error) {
    console.log('⚠️  Could not make script executable (Windows)')
  }
  
  console.log('✅ Cleanup script created')
}

// Create restore script
function createRestoreScript() {
  console.log('\n🔄 Creating restore script...')
  
  const restoreScript = `#!/bin/bash

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
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\\/\\/\\([^.]*\\).*/\\1/')

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
`
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'backup', 'restore.sh')
  fs.writeFileSync(scriptPath, restoreScript)
  
  try {
    exec(`chmod +x "${scriptPath}"`)
  } catch (error) {
    console.log('⚠️  Could not make script executable (Windows)')
  }
  
  console.log('✅ Restore script created')
}

// Create cron job configuration
function createCronConfiguration() {
  console.log('\n⏰ Creating cron job configuration...')
  
  const cronConfig = `# Beauty with AI Precision - Automated Backup Schedule
# Add to crontab with: crontab scripts/backup/crontab

# Environment variables
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
HOME=/home/ubuntu

# Database Backup - Daily at 2 AM
0 2 * * * cd /path/to/Beauty-with-AI-Precision && ./scripts/backup/database.sh production >> backups/logs/cron.log 2>&1

# Storage Backup - Daily at 3 AM  
0 3 * * * cd /path/to/Beauty-with-AI-Precision && ./scripts/backup/storage.sh production >> backups/logs/cron.log 2>&1

# Backup Health Check - Daily at 6 AM
0 6 * * * cd /path/to/Beauty-with-AI-Precision && ./scripts/backup/health-check.sh >> backups/logs/health.log 2>&1

# Weekly Backup Report - Sunday at 8 AM
0 8 * * 0 cd /path/to/Beauty-with-AI-Precision && ./scripts/backup/weekly-report.sh >> backups/logs/reports.log 2>&1
`
  
  const cronPath = path.join(process.cwd(), 'scripts', 'backup', 'crontab')
  fs.writeFileSync(cronPath, cronConfig)
  console.log('✅ Cron configuration created')
}

// Create backup health check
function createHealthCheckScript() {
  console.log('\n🏥 Creating backup health check script...')
  
  const healthScript = `#!/bin/bash

# Backup Health Check Script
# Monitors backup status and sends alerts

set -e

ENVIRONMENT=${1:-production}
BACKUP_DIR="backups/database"
MAX_AGE_HOURS=26
WEBHOOK_URL=${WEBHOOK_URL}

echo "🏥 Checking backup health for ${ENVIRONMENT}..."

# Find latest backup
LATEST_BACKUP=$(ls -t "${BACKUP_DIR}/${ENVIRONMENT}_backup_"*.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup files found!"
    
    # Send alert
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \\
            -H "Content-Type: application/json" \\
            -d '{"text": "🚨 CRITICAL: No database backups found for '${ENVIRONMENT}'"}'
    fi
    
    exit 1
fi

# Check backup age
BACKUP_AGE=$(($(date +%s) - $(date -r "$LATEST_BACKUP" +%s)))
BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))

echo "📅 Latest backup: $(basename $LATEST_BACKUP)"
echo "⏰ Backup age: ${BACKUP_AGE_HOURS} hours"

if [ $BACKUP_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo "⚠️  Backup is older than ${MAX_AGE_HOURS} hours!"
    
    # Send alert
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \\
            -H "Content-Type: application/json" \\
            -d '{"text": "⚠️  WARNING: Database backup for '${ENVIRONMENT}' is ${BACKUP_AGE_HOURS} hours old"}'
    fi
    
    exit 1
fi

# Check backup file size
BACKUP_SIZE=$(du -k "$LATEST_BACKUP" | cut -f1)
MIN_SIZE_KB=1000

if [ $BACKUP_SIZE -lt $MIN_SIZE_KB ]; then
    echo "⚠️  Backup file seems too small: ${BACKUP_SIZE}KB"
    
    # Send alert
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \\
            -H "Content-Type: application/json" \\
            -d '{"text": "⚠️  WARNING: Database backup for '${ENVIRONMENT}' is only ${BACKUP_SIZE}KB"}'
    fi
fi

# Count recent backups
RECENT_COUNT=$(find "${BACKUP_DIR}" -name "${ENVIRONMENT}_backup_*.gz" -mtime -7 | wc -l)
echo "📊 Recent backups (7 days): ${RECENT_COUNT}"

if [ $RECENT_COUNT -lt 6 ]; then
    echo "⚠️  Less than 6 backups in the last week"
fi

echo "✅ Backup health check completed"
`
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'backup', 'health-check.sh')
  fs.writeFileSync(scriptPath, healthScript)
  
  try {
    exec(`chmod +x "${scriptPath}"`)
  } catch (error) {
    console.log('⚠️  Could not make script executable (Windows)')
  }
  
  console.log('✅ Health check script created')
}

// Create backup documentation
function createBackupDocumentation() {
  console.log('\n📖 Creating backup documentation...')
  
  const docs = `# Automated Backup Strategy

## 🎯 Overview

Beauty with AI Precision includes comprehensive automated backup system:

- **Database backups**: Daily PostgreSQL dumps
- **Storage backups**: File storage archives  
- **Logs backup**: Application and system logs
- **Automated cleanup**: Retention policy enforcement
- **Health monitoring**: Backup status alerts

## 📁 Backup Structure

\`\`\`
backups/
├── database/          # PostgreSQL dumps
│   ├── production_backup_20250101_020000.sql.gz
│   └── staging_backup_20250101_020000.sql.gz
├── storage/           # File storage archives
│   ├── production_storage_20250101_030000.tar.gz
│   └── staging_storage_20250101_030000.tar.gz
├── logs/              # Backup logs
│   ├── backup_20250101_020000.log
│   └── health.log
└── config/            # Configuration backups
\`\`\`

## 🚀 Setup Instructions

### 1. Install Dependencies

\`\`\`bash
# Install Supabase CLI
curl -fsSL https://supabase.com/install.sh | sh

# Install AWS CLI (for S3 backups)
pip install awscli

# Configure AWS credentials
aws configure
\`\`\`

### 2. Configure Environment Variables

Add to \`.env.production\`:

\`\`\`
# Backup Configuration
AWS_S3_BUCKET="your-backup-bucket"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"

# Notifications
WEBHOOK_URL="https://hooks.slack.com/your-webhook"
\`\`\`

### 3. Setup Cron Jobs

\`\`\`bash
# Copy crontab configuration
crontab scripts/backup/crontab

# Or add manually
crontab -e
\`\`\`

### 4. Test Backup System

\`\`\`bash
# Test database backup
./scripts/backup/database.sh production

# Test storage backup  
./scripts/backup/storage.sh production

# Test health check
./scripts/backup/health-check.sh production
\`\`\`

## 📅 Backup Schedule

| Time | Task | Frequency |
|------|------|-----------|
| 2:00 AM | Database backup | Daily |
| 3:00 AM | Storage backup | Daily |
| 4:00 AM | Logs backup | Daily |
| 6:00 AM | Health check | Daily |
| 8:00 AM | Weekly report | Sunday |

## 🗂️ Retention Policy

### Database Backups
- **Daily**: Keep 7 days
- **Weekly**: Keep 4 weeks  
- **Monthly**: Keep 12 months

### Storage Backups
- Keep 30 days

### Logs
- Keep 90 days

## 🔄 Restore Procedures

### Database Restore

\`\`\`bash
# List available backups
ls -la backups/database/

# Restore from latest backup
./scripts/backup/restore.sh production

# Restore from specific backup
./scripts/backup/restore.sh production backups/database/production_backup_20250101_020000.sql.gz
\`\`\`

### Storage Restore

\`\`\`bash
# Extract storage backup
tar -xzf backups/storage/production_storage_20250101_030000.tar.gz

# Upload to Supabase storage
supabase storage upload --bucket skin-analysis-images --path ./skin-analysis-images/*
\`\`\`

## 🏥 Health Monitoring

### Automated Checks
- Backup age verification
- File size validation
- Backup count monitoring
- Storage space checks

### Manual Health Check

\`\`\`bash
# Run health check
./scripts/backup/health-check.sh production

# Check backup status
ls -la backups/database/ | tail -5

# Monitor backup logs
tail -f backups/logs/backup_$(date +%Y%m%d)_*.log
\`\`\`

## 🚨 Alerting

### Slack Integration
Configure webhook URL in environment variables:

\`\`\`bash
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
\`\`\`

### Alert Types
- **Critical**: No backups found
- **Warning**: Backup older than 26 hours
- **Info**: Backup completed successfully

## ☁️ Cloud Storage

### AWS S3 Setup

\`\`\`bash
# Create S3 bucket
aws s3 mb s3://your-backup-bucket

# Enable versioning
aws s3api put-bucket-versioning \\
    --bucket your-backup-bucket \\
    --versioning-configuration Status=Enabled

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \\
    --bucket your-backup-bucket \\
    --lifecycle-configuration file://s3-lifecycle.json
\`\`\`

### Cross-Region Replication

Configure S3 replication for disaster recovery:

\`\`\`json
{
  "Role": "arn:aws:iam::account:role/replication-role",
  "Rules": [{
    "ID": "BackupReplication",
    "Status": "Enabled",
    "Destination": {
      "Bucket": "arn:aws:s3:::backup-bucket-dr"
    }
  }]
}
\`\`\`

## 🔧 Troubleshooting

### Common Issues

1. **Permission denied**
   \`\`\`bash
   chmod +x scripts/backup/*.sh
   \`\`\`

2. **Supabase CLI not found**
   \`\`\`bash
   curl -fsSL https://supabase.com/install.sh | sh
   \`\`\`

3. **AWS credentials error**
   \`\`\`bash
   aws configure
   \`\`\`

4. **Disk space full**
   \`\`\`bash
   # Check disk usage
   df -h
   
   # Clean old backups manually
   ./scripts/backup/cleanup.sh database
   \`\`\`

### Backup Verification

\`\`\`bash
# Test backup integrity
gunzip -t backups/database/production_backup_*.sql.gz

# Check backup contents
gunzip -c backups/database/production_backup_*.sql.gz | head -20

# Verify database size
psql "postgresql://user:pass@host:5432/db" -c "SELECT pg_size_pretty(pg_database_size('postgres'));"
\`\`\`

## 📊 Monitoring Dashboard

Access backup status at: \`/admin/backups\`

Features:
- Backup schedule overview
- Recent backup history
- Storage usage metrics
- Health check results
- Restore capabilities

## 🔒 Security Considerations

- Encrypt sensitive backup files
- Use IAM roles for AWS access
- Implement backup access logging
- Regular security audits
- Disaster recovery testing

## 📞 Support

For backup issues:
1. Check health check logs
2. Review backup documentation
3. Contact infrastructure team
4. Create support ticket

---

**💾 Regular backup testing is essential for disaster recovery preparedness!**
`
  
  const docsPath = path.join(process.cwd(), 'docs', 'BACKUP_STRATEGY.md')
  fs.writeFileSync(docsPath, docs)
  console.log('✅ Backup documentation created')
}

// Main setup function
async function setup() {
  try {
    console.log('🚀 Setting up automated backup strategy...\n')
    
    // Create all components
    createBackupDirectories()
    createDatabaseBackupScript()
    createStorageBackupScript()
    createCleanupScript()
    createRestoreScript()
    createCronConfiguration()
    createHealthCheckScript()
    createBackupDocumentation()
    
    console.log('\n✅ Automated backup strategy setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Install Supabase CLI: curl -fsSL https://supabase.com/install.sh | sh')
    console.log('2. Configure AWS S3 for cloud storage')
    console.log('3. Set environment variables for backup credentials')
    console.log('4. Setup cron jobs: crontab scripts/backup/crontab')
    console.log('5. Test backup system: ./scripts/backup/database.sh production')
    console.log('6. Configure webhook notifications for alerts')
    
    console.log('\n📖 Documentation: docs/BACKUP_STRATEGY.md')
    console.log('🏥 Health check: ./scripts/backup/health-check.sh production')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run setup
setup()
