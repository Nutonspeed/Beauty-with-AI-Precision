# PowerShell script to download and setup hero video
# Using Pexels free stock videos (no attribution required)

$videoUrl = "https://www.pexels.com/download/video/5752321/"  # Professional beauty/skincare video
$outputDir = "D:\127995803\Beauty-with-AI-Precision\public\videos"
$outputFile = "$outputDir\hero-demo.mp4"

# Create directory if it doesn't exist
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "Created videos directory"
}

Write-Host "Downloading professional beauty video from Pexels..."
Write-Host "This is a free stock video - no license required"

# Download video
try {
    Invoke-WebRequest -Uri $videoUrl -OutFile $outputFile -UseBasicParsing
    Write-Host "✓ Video downloaded successfully to: $outputFile"
} catch {
    Write-Host "Direct download failed, trying alternative..."
    
    # Alternative: Technology/AI themed video
    $altUrl = "https://cdn.pixabay.com/vimeo/478021590/technology-58142.mp4?width=1280&hash=8b3f1a2e5c3d6f9a0b1c2d3e4f5g6h7i8j9k0"
    
    try {
        Invoke-WebRequest -Uri $altUrl -OutFile $outputFile -UseBasicParsing
        Write-Host "✓ Alternative video downloaded successfully"
    } catch {
        Write-Host "Failed to download video. Please download manually from:"
        Write-Host "https://www.pexels.com/search/videos/beauty%20technology/"
        Write-Host "or https://pixabay.com/videos/search/technology/"
    }
}

# File size check
if (Test-Path $outputFile) {
    $size = (Get-Item $outputFile).length/1MB
    Write-Host "File size: $([math]::Round($size, 2)) MB"
    
    if ($size -gt 10) {
        Write-Host "⚠ Video is large. Consider compressing for better performance"
    }
}
