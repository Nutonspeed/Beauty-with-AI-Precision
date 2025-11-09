# Test AI Service and Save Response
Write-Host "Testing AI Service - Saving response to file" -ForegroundColor Cyan
Write-Host ""

$TEST_IMAGE = "ai-service\test_images\face_sample.jpg"
$filePath = Resolve-Path $TEST_IMAGE
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
    "Content-Type: image/jpeg$LF",
    [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes),
    "--$boundary--$LF"
) -join $LF

$body = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes($bodyLines)

try {
    Write-Host "Sending request..." -ForegroundColor Yellow
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8000/api/analyze/multi-mode" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    
    Write-Host "SUCCESS! Saving to ai-test-response.json" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Out-File "ai-test-response.json" -Encoding UTF8
    
    Write-Host ""
    Write-Host "Response saved to: ai-test-response.json" -ForegroundColor Cyan
    Write-Host "Quick Summary:" -ForegroundColor Yellow
    Write-Host "  Spots: $($response.spots.detections.Count)" -ForegroundColor Gray
    Write-Host "  Wrinkles: $($response.wrinkles.detections.Count)" -ForegroundColor Gray
    Write-Host "  Pores: $($response.pores.detections.Count)" -ForegroundColor Gray
    Write-Host "  Processing Time: $($response.processing_time)s" -ForegroundColor Gray
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
