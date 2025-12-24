# Test Script for Pricing API
# Run this after applying the fix migration in Supabase

Write-Host "Testing Pricing API..." -ForegroundColor Green

# Test B2C Plans
Write-Host "`n=== Testing B2C Plans ===" -ForegroundColor Yellow
try {
    $b2cResponse = Invoke-RestMethod -Uri "http://localhost:3005/api/pricing/plans?type=b2c" -ErrorAction Stop
    Write-Host "✅ B2C Plans API Success" -ForegroundColor Green
    $b2cResponse.plans | ForEach-Object {
        Write-Host "  - $($_.name): ฿$($_.price_amount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ B2C Plans API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test B2B Plans
Write-Host "`n=== Testing B2B Plans ===" -ForegroundColor Yellow
try {
    $b2bResponse = Invoke-RestMethod -Uri "http://localhost:3005/api/pricing/plans?type=b2b" -ErrorAction Stop
    Write-Host "✅ B2B Plans API Success" -ForegroundColor Green
    $b2bResponse.plans | ForEach-Object {
        Write-Host "  - $($_.name): ฿$($_.price_amount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ B2B Plans API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test All Plans
Write-Host "`n=== Testing All Plans ===" -ForegroundColor Yellow
try {
    $allResponse = Invoke-RestMethod -Uri "http://localhost:3005/api/pricing/plans" -ErrorAction Stop
    Write-Host "✅ All Plans API Success" -ForegroundColor Green
    Write-Host "  B2C Plans: $($allResponse.plans.b2c.Count)" -ForegroundColor Cyan
    Write-Host "  B2B Plans: $($allResponse.plans.b2b.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ All Plans API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test Complete!" -ForegroundColor Green
