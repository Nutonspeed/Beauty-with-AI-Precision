# Test AI Service Direct Analysis
Write-Host "Testing AI Service (localhost:8000) - Multi-Mode Analysis" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$TEST_IMAGE = "ai-service\test_images\face_sample.jpg"

Write-Host "1. Sending image to AI service..." -ForegroundColor Yellow
$startTime = Get-Date

# Create form data
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
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8000/api/analyze/multi-mode" `
        -Method POST `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    
    $elapsed = ((Get-Date) - $startTime).TotalSeconds.ToString('0.00')
    Write-Host "Response received in $elapsed seconds" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "--------" -ForegroundColor Gray
    
    # Display each mode
    Write-Host ""
    Write-Host "Spots Detection:" -ForegroundColor Yellow
    Write-Host "  Count: $($response.spots.detections.Count)" -ForegroundColor Gray
    Write-Host "  Confidence: $($response.spots.confidence)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Wrinkles Detection:" -ForegroundColor Yellow
    Write-Host "  Count: $($response.wrinkles.detections.Count)" -ForegroundColor Gray
    Write-Host "  Confidence: $($response.wrinkles.confidence)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Texture Analysis:" -ForegroundColor Yellow
    Write-Host "  Score: $($response.texture.overall_score)" -ForegroundColor Gray
    Write-Host "  Smoothness: $($response.texture.smoothness)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Pores Detection:" -ForegroundColor Yellow
    Write-Host "  Count: $($response.pores.detections.Count)" -ForegroundColor Gray
    Write-Host "  Confidence: $($response.pores.confidence)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "UV Spots Detection:" -ForegroundColor Yellow
    Write-Host "  Count: $($response.uv_spots.detections.Count)" -ForegroundColor Gray
    Write-Host "  Confidence: $($response.uv_spots.confidence)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Brown Spots Detection:" -ForegroundColor Yellow
    Write-Host "  Count: $($response.brown_spots.detections.Count)" -ForegroundColor Gray
    Write-Host "  Confidence: $($response.brown_spots.confidence)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Red Areas Analysis:" -ForegroundColor Yellow
    Write-Host "  Coverage: $($response.red_areas.coverage_percentage)%" -ForegroundColor Gray
    Write-Host "  Area: $($response.red_areas.red_area_pixels) pixels" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Porphyrins Detection:" -ForegroundColor Yellow
    Write-Host "  Count: $($response.porphyrins.detections.Count)" -ForegroundColor Gray
    Write-Host "  Confidence: $($response.porphyrins.confidence)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Processing Time: $($response.processing_time) seconds" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "AI Service Test: SUCCESS" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception -ForegroundColor Red
}
