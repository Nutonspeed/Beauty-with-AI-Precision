# Multi-Mode Analysis API Test Script
# Quick test to verify services are running

Write-Host "Testing Multi-Mode Analysis API Workflow" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check test image
$TEST_IMAGE = "ai-service\test_images\face_sample.jpg"
if (Test-Path $TEST_IMAGE) {
    $fileSize = (Get-Item $TEST_IMAGE).Length / 1KB
    Write-Host "Test image found: $TEST_IMAGE ($($fileSize.ToString('0.00')) KB)" -ForegroundColor Green
} else {
    Write-Host "Test image not found: $TEST_IMAGE" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check Next.js server
Write-Host "Checking Next.js server..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -ErrorAction Stop -TimeoutSec 5 -UseBasicParsing
    Write-Host "Next.js server is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "Next.js server is NOT running (start with: pnpm dev)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check AI service
Write-Host "Checking AI service..." -ForegroundColor Yellow
try {
    $aiHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET -ErrorAction Stop
    Write-Host "AI service is healthy (version: $($aiHealth.version), device: $($aiHealth.device))" -ForegroundColor Green
} catch {
    Write-Host "AI service is NOT running (start with: cd ai-service; python run.py)" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "All services are running!" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: API endpoint requires authentication." -ForegroundColor Yellow
Write-Host "To test the complete workflow:" -ForegroundColor Gray
Write-Host "  1. Log in via web interface (http://localhost:3000)" -ForegroundColor Gray
Write-Host "  2. Use authenticated session to upload image" -ForegroundColor Gray
Write-Host "  3. Or run E2E tests with authentication" -ForegroundColor Gray
Write-Host ""
Write-Host "AI service endpoints (no auth required):" -ForegroundColor Cyan
Write-Host "  - http://localhost:8000/api/analyze/multi-mode" -ForegroundColor Gray
Write-Host "  - http://localhost:8000/api/visualize/multi-mode" -ForegroundColor Gray
