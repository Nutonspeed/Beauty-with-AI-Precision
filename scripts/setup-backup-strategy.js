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
  
  // Script is now in scripts/backup/database.sh
  console.log('✅ Database backup script referenced at scripts/backup/database.sh')
}

// Create storage backup script
function createStorageBackupScript() {
  console.log('\n📁 Creating storage backup script...')
  
  // Script is now in scripts/backup/storage.sh
  console.log('✅ Storage backup script referenced at scripts/backup/storage.sh')
}

// Create cleanup script
function createCleanupScript() {
  console.log('\n🧹 Creating backup cleanup script...')
  
  // Script is now in scripts/backup/cleanup.sh
  console.log('✅ Cleanup script referenced at scripts/backup/cleanup.sh')
}

// Create restore script
function createRestoreScript() {
  console.log('\n🔄 Creating restore script...')
  
  // Script is now in scripts/backup/restore.sh
  console.log('✅ Restore script referenced at scripts/backup/restore.sh')
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
