# ===================================
# Migration Status Checker
# ตรวจสอบสถานะ migrations และเช็คว่ามี conflicts หรือไม่
# ===================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Migration Status Checker" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get all migration files
$migrationPath = "supabase\migrations"
$migrations = Get-ChildItem -Path $migrationPath -Filter "*.sql" | Sort-Object Name

Write-Host "Found Migration Files: $($migrations.Count) files" -ForegroundColor Green
Write-Host ""

# Group migrations by category
$oldMigrations = @()
$newMigrations = @()
$fixMigrations = @()

foreach ($migration in $migrations) {
    $name = $migration.Name
    
    if ($name -like "*fix*") {
        $fixMigrations += $name
    } elseif ($name -match "^2024") {
        $oldMigrations += $name
    } elseif ($name -match "^202501(0[1-4])") {
        $oldMigrations += $name
    } else {
        $newMigrations += $name
    }
}

# Display categorized migrations
Write-Host "OLD Migrations (Base Tables - may already be executed):" -ForegroundColor Yellow
$oldMigrations | ForEach-Object { Write-Host "   OK $_" -ForegroundColor Gray }
Write-Host ""

Write-Host "Fix Migrations:" -ForegroundColor Magenta
$fixMigrations | ForEach-Object { Write-Host "   OK $_" -ForegroundColor Gray }
Write-Host ""

Write-Host "NEW Migrations (Tasks 11-20 - pending):" -ForegroundColor Green
$newMigrations | ForEach-Object { Write-Host "   -> $_" -ForegroundColor Cyan }
Write-Host ""

# Check for conflicts
Write-Host "Checking for conflicts..." -ForegroundColor Yellow
Write-Host ""

# Check if inventory table already exists in old migrations
$inventoryConflict = Select-String -Path "$migrationPath\20250104_create_admin_tables.sql" -Pattern "CREATE TABLE.*inventory" -Quiet
if ($inventoryConflict) {
    Write-Host "CONFLICT FOUND: inventory table exists in 20250104_create_admin_tables.sql" -ForegroundColor Red
    Write-Host "   -> 20250105_create_inventory_system.sql will conflict!" -ForegroundColor Red
    Write-Host "   -> Use 20250105_create_inventory_system_v2.sql instead" -ForegroundColor Yellow
    Write-Host ""
}

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Old Migrations: $($oldMigrations.Count) files" -ForegroundColor Gray
Write-Host "Fix Migrations: $($fixMigrations.Count) files" -ForegroundColor Gray
Write-Host "New Migrations: $($newMigrations.Count) files" -ForegroundColor Cyan
Write-Host ""

# Recommendations
Write-Host "Recommendations:" -ForegroundColor Green
Write-Host "1. Check Supabase Dashboard to see which migrations already executed" -ForegroundColor White
Write-Host "2. Backup database before running new migrations" -ForegroundColor White
Write-Host "3. Fix conflicts in inventory system migration (use v2)" -ForegroundColor White
Write-Host "4. Run new migrations one by one and check for errors" -ForegroundColor White
Write-Host ""
