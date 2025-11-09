# Start AI Service Script
Write-Host "🚀 Starting Beauty AI Analysis Service..." -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Change to ai-service directory
$targetDir = "d:\127995803\Beauty-with-AI-Precision\ai-service"
Set-Location $targetDir

$newDir = Get-Location
Write-Host "Changed to: $newDir" -ForegroundColor Green
Write-Host ""

# Verify main.py exists
if (Test-Path "main.py") {
    Write-Host "✅ main.py found" -ForegroundColor Green
} else {
    Write-Host "❌ main.py NOT found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting uvicorn server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
