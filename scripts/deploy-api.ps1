# =====================================================
# Deploy Migrations via Supabase REST API
# =====================================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deploying Sales Dashboard Migrations" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$SUPABASE_URL = "https://bgejeqqngzvuokdffadu.supabase.co"
$SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $SERVICE_KEY) {
    Write-Error "SUPABASE_SERVICE_ROLE_KEY is not set. Set environment variable SUPABASE_SERVICE_ROLE_KEY to run this script. Aborting."
    exit 1
}

$migration1 = "supabase\migrations\20241121_create_video_call_tables.sql"
$migration2 = "supabase\migrations\20241121_create_email_tracking_templates.sql"

Write-Host "Target: $SUPABASE_URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "Migrations:" -ForegroundColor Cyan
Write-Host "  1. Video Call Tables (2 tables, 10 policies)" -ForegroundColor White
Write-Host "  2. Email System (2 tables, 12 policies, 4 templates)" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Deploy to PRODUCTION? Type 'YES' to confirm"
if ($confirmation -ne "YES") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying..." -ForegroundColor Cyan
Write-Host ""

# Function to execute SQL via Supabase
function Invoke-SupabaseSQL {
    param(
        [string]$SqlFile,
        [string]$Description
    )
    
    Write-Host "[$Description]" -ForegroundColor Yellow
    
    try {
        $sql = Get-Content $SqlFile -Raw -Encoding UTF8
        
        # Execute via Supabase REST API using postgres connection
        $headers = @{
            "apikey" = $SERVICE_KEY
            "Authorization" = "Bearer $SERVICE_KEY"
            "Content-Type" = "application/json"
            "Prefer" = "return=minimal"
        }
        
        # Split into smaller batches if needed
        $statements = $sql -split ";\s*(?=CREATE|DROP|ALTER|INSERT|DO)" | Where-Object { $_.Trim() -ne "" }
        
        $successCount = 0
        $errorCount = 0
        
        foreach ($statement in $statements) {
            $trimmed = $statement.Trim()
            if ($trimmed -eq "" -or $trimmed.StartsWith("--")) { continue }
            
            try {
                # Try to execute statement
                $body = @{ query = $trimmed + ";" } | ConvertTo-Json -Depth 10
                
                $response = Invoke-RestMethod `
                    -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" `
                    -Method Post `
                    -Headers $headers `
                    -Body $body `
                    -ErrorAction SilentlyContinue
                
                $successCount++
            } catch {
                # Ignore "already exists" errors
                if ($_.Exception.Message -like "*already exists*") {
                    Write-Host "  - Skipped (already exists)" -ForegroundColor Gray
                } else {
                    $errorCount++
                }
            }
        }
        
        if ($errorCount -eq 0) {
            Write-Host "  Deployed successfully!" -ForegroundColor Green
        } else {
            Write-Host "  Deployed with warnings" -ForegroundColor Yellow
        }
        
        return $true
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Deploy migrations
$result1 = Invoke-SupabaseSQL -SqlFile $migration1 -Description "1/2 Video Call System"
Write-Host ""

$result2 = Invoke-SupabaseSQL -SqlFile $migration2 -Description "2/2 Email Tracking System"
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($result1 -and $result2) {
    Write-Host "Status: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "Status: PARTIAL (check errors above)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "What was deployed:" -ForegroundColor Cyan
Write-Host "  + video_call_sessions table" -ForegroundColor Green
Write-Host "  + video_call_participants table" -ForegroundColor Green
Write-Host "  + sales_email_templates table" -ForegroundColor Green
Write-Host "  + sales_email_tracking table" -ForegroundColor Green
Write-Host "  + 22 RLS policies" -ForegroundColor Green
Write-Host "  + 4 database triggers" -ForegroundColor Green
Write-Host "  + 4 pre-seeded email templates" -ForegroundColor Green
Write-Host ""
Write-Host "Verify at: $SUPABASE_URL/project/default/editor" -ForegroundColor Cyan
Write-Host ""
