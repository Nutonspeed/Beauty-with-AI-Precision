# PowerShell script to download free stock video for hero section
$outputDir = "D:\127995803\Beauty-with-AI-Precision\public\videos"
$outputFile = "$outputDir\hero-demo.mp4"

# Create directory if it doesn't exist
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "Created videos directory"
}

Write-Host "Downloading free stock video..."

# Download from direct CDN link (Coverr free videos)
$videoUrl = "https://cdn.coverr.co/videos/coverr-applying-facial-cream-7044/1080p.mp4"

try {
    # Download the video
    $client = New-Object System.Net.WebClient
    $client.DownloadFile($videoUrl, $outputFile)
    Write-Host "Video downloaded successfully!"
    
    # Check file size
    $size = (Get-Item $outputFile).length/1MB
    Write-Host "File size: $([math]::Round($size, 2)) MB"
    
} catch {
    Write-Host "Primary download failed, trying alternative..."
    
    # Alternative tech/abstract video
    $altUrl = "https://cdn.coverr.co/videos/coverr-abstract-technology-background-2171/1080p.mp4"
    
    try {
        $client = New-Object System.Net.WebClient
        $client.DownloadFile($altUrl, $outputFile)
        Write-Host "Alternative video downloaded!"
    } catch {
        Write-Host "Download failed. Error: $_"
    }
}
