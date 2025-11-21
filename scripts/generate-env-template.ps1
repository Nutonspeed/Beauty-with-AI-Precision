# Generate Environment Variables Template for Vercel
# This script creates a ready-to-paste format for Vercel dashboard

Write-Host "🚀 Vercel Environment Variables Generator" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Please create .env.local first by running: .\scripts\setup-env.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Generating Vercel environment variables..." -ForegroundColor Green
Write-Host ""
Write-Host "Copy and paste these into Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "(Project Settings > Environment Variables)" -ForegroundColor Gray
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan

# Read .env.local
$content = Get-Content ".env.local"

# Filter out comments and empty lines
$variables = $content | Where-Object { 
    $_ -notmatch "^\s*#" -and 
    $_ -notmatch "^\s*$" -and
    $_ -match "=" 
}

# Process each variable
foreach ($line in $variables) {
    # Skip lines with placeholder values
    if ($line -match "your-" -or $line -match "localhost") {
        continue
    }
    
    # Extract variable name and value
    if ($line -match "^([^=]+)=(.+)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        
        # Skip if value looks like a placeholder
        if ($value.Length -lt 10 -and -not ($value -match "^(true|false|\d+)$")) {
            continue
        }
        
        Write-Host "$name=$value"
    }
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚙️  Important:" -ForegroundColor Yellow
Write-Host "1. Select 'Production, Preview, and Development' for all variables" -ForegroundColor White
Write-Host "2. For production, use LIVE Stripe keys (pk_live_... and sk_live_...)" -ForegroundColor White
Write-Host "3. Update STRIPE_WEBHOOK_SECRET after deploying (get from Stripe dashboard)" -ForegroundColor White
Write-Host "4. Update AI_SERVICE_URL to your Railway/Render URL" -ForegroundColor White
Write-Host "5. Update NEXT_PUBLIC_APP_URL to your production domain" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed guide, see: docs/QUICK_START_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
