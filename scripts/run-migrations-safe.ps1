# ===================================
# Safe Migration Runner
# รัน migrations อย่างปลอดภัยทีละไฟล์
# ===================================

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Safe Migration Runner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCLI = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCLI) {
    Write-Host "ERROR: Supabase CLI not found" -ForegroundColor Red
    Write-Host "   Install via: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "   Or: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

# Check if linked to project
Write-Host "Checking connection to Supabase Project..." -ForegroundColor Cyan

$linkedProject = supabase status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not linked to Supabase Project" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run these commands first:" -ForegroundColor Yellow
    Write-Host "   supabase login" -ForegroundColor White
    Write-Host "   supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "OK Connected to Supabase" -ForegroundColor Green
Write-Host ""

# Get pending migrations
Write-Host "Checking pending migrations..." -ForegroundColor Cyan
$migrationPath = "supabase\migrations"

# List of new migrations to run (Tasks 11-20)
$newMigrations = @(
    "20250105_create_queue_system.sql",
    "20250105_create_appointment_system.sql",
    "20250105_create_reports_analytics_system.sql",
    "20250105_create_live_chat_system.sql",
    "20250105_create_branch_management_system.sql",
    "20250105_create_marketing_promo_system.sql",
    "20250105_create_loyalty_points_system.sql",
    "20250105_create_inventory_system_v2.sql",  # Use v2 to avoid conflict
    "20250106_create_treatment_history_system.sql"
)

Write-Host "NEW Migrations to run:" -ForegroundColor Green
$newMigrations | ForEach-Object { Write-Host "   -> $_" -ForegroundColor Cyan }
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - Not executing" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Confirm before running
if (-not $Force) {
    Write-Host "WARNING:" -ForegroundColor Yellow
    Write-Host "   - Have you backed up the database?" -ForegroundColor White
    Write-Host "   - Are old migrations executed successfully?" -ForegroundColor White
    Write-Host "   - Are you in development environment?" -ForegroundColor White
    Write-Host ""
    
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Cancelled" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "Starting migrations..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($migration in $newMigrations) {
    $filePath = Join-Path $migrationPath $migration
    
    if (-not (Test-Path $filePath)) {
        Write-Host "WARNING: File not found: $migration" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Running: $migration" -ForegroundColor Cyan
    
    try {
        # Run migration using Supabase CLI
        $result = supabase db execute --file $filePath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK Success" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ERROR Failed: $result" -ForegroundColor Red
            $errorCount++
            
            # Ask if should continue
            $continue = Read-Host "   Continue? (y/N)"
            if ($continue -ne "y" -and $continue -ne "Y") {
                Write-Host ""
                Write-Host "Stopped running migrations" -ForegroundColor Yellow
                break
            }
        }
    } catch {
        Write-Host "   ERROR Exception: $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Migration Results" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "OK Success: $successCount files" -ForegroundColor Green
Write-Host "ERROR Failed: $errorCount files" -ForegroundColor Red
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "All migrations executed successfully!" -ForegroundColor Green
} else {
    Write-Host "Some migrations failed - please check" -ForegroundColor Yellow
}
