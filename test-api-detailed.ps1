# Test API Connection with JSON parsing
$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/test-db-connection' -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

Write-Host "🔌 API Connection Test Results" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Status:" $data.status -ForegroundColor Yellow
Write-Host "Message:" $data.message -ForegroundColor Yellow
Write-Host "Timestamp:" $data.timestamp -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Database Info:" -ForegroundColor Cyan
Write-Host "Connection:" $data.data.connection -ForegroundColor White
Write-Host "Users Found:" $data.data.usersFound -ForegroundColor White
Write-Host ""
Write-Host "📋 Table Counts:" -ForegroundColor Cyan
$data.data.tableCounts.PSObject.Properties | ForEach-Object {
    $color = if ($_.Value -eq "Error") { "Red" } else { "Green" }
    Write-Host ("  {0}: {1}" -f $_.Name, $_.Value) -ForegroundColor $color
}
Write-Host ""
Write-Host "🔧 Environment:" -ForegroundColor Cyan
$data.data.environment.PSObject.Properties | ForEach-Object {
    Write-Host ("  {0}: {1}" -f $_.Name, $_.Value) -ForegroundColor Green
}
