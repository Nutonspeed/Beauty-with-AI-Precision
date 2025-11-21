# =====================================================
# Quick Deploy Script - Apply Migrations to Supabase
# =====================================================
# This script will help you deploy migrations to production
# =====================================================

Write-Host ""
Write-Host "Sales Dashboard Migration Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if migration files exist
$migration1 = "supabase\migrations\20241121_create_video_call_tables.sql"
$migration2 = "supabase\migrations\20241121_create_email_tracking_templates.sql"

if (-not (Test-Path $migration1)) {
    Write-Host "Error: Migration file not found: $migration1" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $migration2)) {
    Write-Host "Error: Migration file not found: $migration2" -ForegroundColor Red
    exit 1
}

Write-Host "Found migration files:" -ForegroundColor Green
Write-Host "   1. $migration1" -ForegroundColor White
Write-Host "   2. $migration2" -ForegroundColor White
Write-Host ""

Write-Host "Deployment Options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Open Supabase SQL Editor (Recommended)" -ForegroundColor Cyan
Write-Host "      -> Manually copy-paste and run SQL in browser" -ForegroundColor Gray
Write-Host ""
Write-Host "  [2] Open Migration Files in VS Code" -ForegroundColor Cyan
Write-Host "      -> View and copy files" -ForegroundColor Gray
Write-Host ""
Write-Host "  [3] View Deployment Guide" -ForegroundColor Cyan
Write-Host "      -> Open step-by-step guide" -ForegroundColor Gray
Write-Host ""
Write-Host "  [4] Cancel" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Select option (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Opening Supabase SQL Editor..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Steps to deploy:" -ForegroundColor Yellow
        Write-Host "  1. Login to Supabase Dashboard" -ForegroundColor White
        Write-Host "  2. Click New Query button" -ForegroundColor White
        Write-Host "  3. Copy content from: $migration1" -ForegroundColor White
        Write-Host "  4. Paste and click RUN" -ForegroundColor White
        Write-Host "  5. Wait for success message" -ForegroundColor White
        Write-Host "  6. Repeat for: $migration2" -ForegroundColor White
        Write-Host ""
        
        Start-Process "https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new"
        
        Write-Host "Browser opened!" -ForegroundColor Green
        Write-Host ""
        
        $openFiles = Read-Host "Open migration files in VS Code? (y/n)"
        if ($openFiles -eq "y") {
            code $migration1
            Start-Sleep -Seconds 1
            code $migration2
            Write-Host "Files opened in VS Code" -ForegroundColor Green
        }
        break
    }
    
    "2" {
        Write-Host ""
        Write-Host "Opening migration files..." -ForegroundColor Cyan
        code $migration1
        Start-Sleep -Seconds 1
        code $migration2
        Write-Host "Files opened in VS Code" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Copy content from first file" -ForegroundColor White
        Write-Host "  2. Go to Supabase Dashboard SQL Editor" -ForegroundColor White
        Write-Host "  3. Paste and run SQL" -ForegroundColor White
        Write-Host "  4. Repeat for second file" -ForegroundColor White
        Write-Host ""
        break
    }
    
    "3" {
        Write-Host ""
        Write-Host "Opening deployment guide..." -ForegroundColor Cyan
        code "MIGRATION_DEPLOYMENT_GUIDE.md"
        Write-Host "Guide opened in VS Code" -ForegroundColor Green
        Write-Host ""
        break
    }
    
    "4" {
        Write-Host ""
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid option. Exiting." -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Helpful Resources:" -ForegroundColor Cyan
Write-Host "  - Full Guide: SALES_DASHBOARD_IMPLEMENTATION.md" -ForegroundColor White
Write-Host "  - Thai Version: SALES_DASHBOARD_IMPLEMENTATION_TH.md" -ForegroundColor White
Write-Host "  - Deployment: MIGRATION_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "  - SQL Editor: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql" -ForegroundColor White
Write-Host "  - Table Editor: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/editor" -ForegroundColor White
Write-Host ""
Write-Host "After deployment, test API endpoints:" -ForegroundColor Yellow
Write-Host "  - GET  /api/sales/chat-messages?lead_id={id}" -ForegroundColor Gray
Write-Host "  - POST /api/sales/video-call" -ForegroundColor Gray
Write-Host "  - GET  /api/sales/email-templates" -ForegroundColor Gray
Write-Host ""
Write-Host "Good luck with your deployment!" -ForegroundColor Green
Write-Host ""
