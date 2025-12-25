# Test Script for Admin Subscription Management
# Make sure you're logged in as Super Admin before running

Write-Host "Testing Admin Subscription Management..." -ForegroundColor Green

# Test Admin Subscriptions API
Write-Host "`n=== Testing Admin Subscriptions API ===" -ForegroundColor Yellow
try {
    $token = "YOUR_AUTH_TOKEN_HERE"  # Replace with actual auth token
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:3005/api/admin/subscriptions" -Headers $headers -ErrorAction Stop
    Write-Host "✅ Admin Subscriptions API Success" -ForegroundColor Green
    Write-Host "  Total subscriptions: $($response.subscriptions.Count)" -ForegroundColor Cyan
    
    # Show first subscription details
    if ($response.subscriptions.Count -gt 0) {
        $first = $response.subscriptions[0]
        Write-Host "`nFirst subscription:" -ForegroundColor Yellow
        Write-Host "  Clinic: $($first.name)" -ForegroundColor White
        Write-Host "  Plan: $($first.subscription_plan)" -ForegroundColor White
        Write-Host "  Status: $($first.subscription_status)" -ForegroundColor White
        if ($first.planDetails) {
            Write-Host "  Plan Details: $($first.planDetails.name)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Admin Subscriptions API Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*401*") {
        Write-Host "   Make sure you're logged in as Super Admin" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Test Complete!" -ForegroundColor Green
Write-Host "Note: Update the script with your actual auth token" -ForegroundColor Yellow
