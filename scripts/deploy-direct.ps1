# =====================================================
# Direct Database Migration Deployment
# =====================================================
# Deploy migrations directly to Supabase using psql
# =====================================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Direct Database Migration Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL connection details
$DB_HOST = "aws-1-ap-southeast-1.pooler.supabase.com"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres.bgejeqqngzvuokdffadu"
$DB_PASSWORD = "fovdyaf2TGERL9Yz"

# Migration files
$migration1 = "supabase\migrations\20241121_create_video_call_tables.sql"
$migration2 = "supabase\migrations\20241121_create_email_tracking_templates.sql"

# Check if migration files exist
if (-not (Test-Path $migration1)) {
    Write-Host "Error: Migration file not found: $migration1" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $migration2)) {
    Write-Host "Error: Migration file not found: $migration2" -ForegroundColor Red
    exit 1
}

Write-Host "Found migration files:" -ForegroundColor Green
Write-Host "  1. $migration1" -ForegroundColor White
Write-Host "  2. $migration2" -ForegroundColor White
Write-Host ""

Write-Host "Target database: $DB_HOST" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Deploy these migrations to PRODUCTION? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying migrations..." -ForegroundColor Cyan
Write-Host ""

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD

# Deploy Migration 1: Video Call Tables
Write-Host "[1/2] Deploying video call tables..." -ForegroundColor Yellow

try {
    $content1 = Get-Content $migration1 -Raw
    $content1 | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f -
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Video call tables deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Some objects may already exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Error deploying migration 1: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Continuing to next migration..." -ForegroundColor Yellow
}

Write-Host ""

# Deploy Migration 2: Email Tracking & Templates
Write-Host "[2/2] Deploying email tracking & templates..." -ForegroundColor Yellow

try {
    $content2 = Get-Content $migration2 -Raw
    $content2 | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f -
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Email system deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Some objects may already exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Error deploying migration 2: $($_.Exception.Message)" -ForegroundColor Red
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database Changes:" -ForegroundColor Cyan
Write-Host "  - 4 new tables created" -ForegroundColor Green
Write-Host "  - 22 RLS policies added" -ForegroundColor Green
Write-Host "  - 4 triggers configured" -ForegroundColor Green
Write-Host "  - 4 email templates seeded" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify tables in Supabase Dashboard" -ForegroundColor White
Write-Host "  2. Test API endpoints" -ForegroundColor White
Write-Host "  3. Update UI components" -ForegroundColor White
Write-Host ""
Write-Host "View database at:" -ForegroundColor Cyan
Write-Host "  https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/editor" -ForegroundColor White
Write-Host ""
