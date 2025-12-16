# Test Visualization - Run in separate process
Write-Host "Waiting for server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Running visualization test..." -ForegroundColor Cyan
Set-Location "d:\127995803\Beauty-with-AI-Precision\ai-service"
python test_viz_simple.py

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
