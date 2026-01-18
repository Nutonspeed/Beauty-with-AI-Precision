# Simple video download script
$output = "D:\127995803\Beauty-with-AI-Precision\public\videos\hero-demo.mp4"
New-Item -ItemType Directory -Path (Split-Path $output) -Force | Out-Null

# Download from Videvo CDN (free stock)
$url = "https://cdn.videvo.net/videvo_files/video/free/2015-03/large_watermarked/Binary_Code_preview.mp4"

Write-Host "Downloading video..."
try {
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host "Success! Video saved to: $output"
} catch {
    Write-Host "Failed. Please download manually from:"
    Write-Host "https://www.pexels.com/search/videos/technology/"
}
