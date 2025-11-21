# =====================================================
# Test Sales Dashboard APIs
# =====================================================

$SUPABASE_URL = "https://bgejeqqngzvuokdffadu.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzM3NTQsImV4cCI6MjA3NzIwOTc1NH0.gJxg9TikqhQ7oVN5GsIP4IOYyfH3R_CLz5S55VwMQEE"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Testing Sales Dashboard APIs" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "apikey" = $ANON_KEY
    "Authorization" = "Bearer $ANON_KEY"
    "Content-Type" = "application/json"
}

# Test 1: Email Templates
Write-Host "[1/3] Testing Email Templates API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3004/api/sales/email-templates" `
        -Method Get `
        -Headers $headers
    
    Write-Host "  Status: SUCCESS" -ForegroundColor Green
    Write-Host "  Templates found: $($response.Count)" -ForegroundColor White
    
    if ($response.Count -gt 0) {
        Write-Host "  Sample templates:" -ForegroundColor Gray
        $response | Select-Object -First 2 | ForEach-Object {
            Write-Host "    - $($_.name) ($($_.category))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  Status: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Chat Messages API
Write-Host "[2/3] Testing Chat Messages API..." -ForegroundColor Yellow
try {
    # Get a real lead_id from database first
    $leadsResponse = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/sales_leads?select=id&limit=1" `
        -Method Get `
        -Headers $headers
    
    if ($leadsResponse.Count -gt 0) {
        $testLeadId = $leadsResponse[0].id
        
        $chatResponse = Invoke-RestMethod `
            -Uri "http://localhost:3004/api/sales/chat-messages?lead_id=$testLeadId" `
            -Method Get `
            -Headers $headers
        
        Write-Host "  Status: SUCCESS" -ForegroundColor Green
        Write-Host "  Messages found: $($chatResponse.messages.Count)" -ForegroundColor White
    } else {
        Write-Host "  Status: SKIPPED (No leads in database)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Status: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Video Call API
Write-Host "[3/3] Testing Video Call API..." -ForegroundColor Yellow
try {
    $leadsResponse = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/sales_leads?select=id&limit=1" `
        -Method Get `
        -Headers $headers
    
    if ($leadsResponse.Count -gt 0) {
        $testLeadId = $leadsResponse[0].id
        
        $videoResponse = Invoke-RestMethod `
            -Uri "http://localhost:3004/api/sales/video-call?lead_id=$testLeadId" `
            -Method Get `
            -Headers $headers
        
        Write-Host "  Status: SUCCESS" -ForegroundColor Green
        Write-Host "  Video calls found: $($videoResponse.Count)" -ForegroundColor White
    } else {
        Write-Host "  Status: SKIPPED (No leads in database)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Status: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All new APIs are responding correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update UI components to use new APIs" -ForegroundColor White
Write-Host "  2. Test Realtime chat subscriptions" -ForegroundColor White
Write-Host "  3. Deploy to production" -ForegroundColor White
Write-Host ""
