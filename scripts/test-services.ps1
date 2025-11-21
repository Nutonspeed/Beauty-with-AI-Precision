# Test Services Connection Script
# This script tests connectivity to all external services

Write-Host "🧪 Testing External Services" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    exit 1
}

# Function to parse env file
function Get-EnvValue {
    param([string]$Key)
    $content = Get-Content ".env.local" -Raw
    $pattern = "$Key=`"(.+?)`""
    $match = [regex]::Match($content, $pattern)
    if ($match.Success) {
        return $match.Groups[1].Value
    }
    return $null
}

# Test Supabase
Write-Host "🗄️  Testing Supabase..." -ForegroundColor Magenta
$supabaseUrl = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
if ($supabaseUrl -and $supabaseUrl -notlike "*your-*") {
    try {
        $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Method GET -ErrorAction Stop -TimeoutSec 10
        Write-Host "✅ Supabase: Connected" -ForegroundColor Green
    } catch {
        Write-Host "❌ Supabase: Failed to connect" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Supabase: Not configured" -ForegroundColor Yellow
}

Write-Host ""

# Test Stripe
Write-Host "💳 Testing Stripe..." -ForegroundColor Magenta
$stripeKey = Get-EnvValue "STRIPE_SECRET_KEY"
if ($stripeKey -and $stripeKey -notlike "*your-*") {
    try {
        $headers = @{
            "Authorization" = "Bearer $stripeKey"
        }
        $response = Invoke-RestMethod -Uri "https://api.stripe.com/v1/balance" -Headers $headers -Method GET -ErrorAction Stop
        Write-Host "✅ Stripe: Connected" -ForegroundColor Green
        Write-Host "   Mode: $($stripeKey.Substring(0, 7))..." -ForegroundColor Gray
    } catch {
        Write-Host "❌ Stripe: Failed to connect" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Stripe: Not configured" -ForegroundColor Yellow
}

Write-Host ""

# Test Resend
Write-Host "📧 Testing Resend..." -ForegroundColor Magenta
$resendKey = Get-EnvValue "RESEND_API_KEY"
if ($resendKey -and $resendKey -notlike "*your-*") {
    try {
        $headers = @{
            "Authorization" = "Bearer $resendKey"
            "Content-Type" = "application/json"
        }
        # Resend doesn't have a test endpoint, so we'll just check if key format is valid
        if ($resendKey -match "^re_[a-zA-Z0-9]+$") {
            Write-Host "✅ Resend: API key format valid" -ForegroundColor Green
            Write-Host "   Send a test email to verify" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Resend: API key format invalid" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Resend: Failed to validate" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Resend: Not configured" -ForegroundColor Yellow
}

Write-Host ""

# Test Twilio
Write-Host "📱 Testing Twilio..." -ForegroundColor Magenta
$twilioSid = Get-EnvValue "TWILIO_ACCOUNT_SID"
$twilioToken = Get-EnvValue "TWILIO_AUTH_TOKEN"
if ($twilioSid -and $twilioToken -and $twilioSid -notlike "*your-*") {
    try {
        $pair = "$($twilioSid):$($twilioToken)"
        $encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
        $headers = @{
            "Authorization" = "Basic $encodedCreds"
        }
        $response = Invoke-RestMethod -Uri "https://api.twilio.com/2010-04-01/Accounts/$twilioSid.json" -Headers $headers -Method GET -ErrorAction Stop
        Write-Host "✅ Twilio: Connected" -ForegroundColor Green
        Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Twilio: Failed to connect" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Twilio: Not configured" -ForegroundColor Yellow
}

Write-Host ""

# Test AI Service
Write-Host "🤖 Testing AI Service..." -ForegroundColor Magenta
$aiServiceUrl = Get-EnvValue "AI_SERVICE_URL"
if ($aiServiceUrl -and $aiServiceUrl -notlike "*localhost*" -and $aiServiceUrl -notlike "*your-*") {
    try {
        $response = Invoke-RestMethod -Uri "$aiServiceUrl/api/health" -Method GET -ErrorAction Stop -TimeoutSec 10
        Write-Host "✅ AI Service: Connected" -ForegroundColor Green
        Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ AI Service: Failed to connect" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  AI Service: Not deployed yet" -ForegroundColor Yellow
    Write-Host "   Deploy to Railway: docs/AI_SERVICE_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
}

Write-Host ""

# Test Hugging Face Token
Write-Host "🤗 Testing Hugging Face..." -ForegroundColor Magenta
$hfToken = Get-EnvValue "HUGGINGFACE_TOKEN"
if ($hfToken -and $hfToken -notlike "*your-*") {
    try {
        $headers = @{
            "Authorization" = "Bearer $hfToken"
        }
        $response = Invoke-RestMethod -Uri "https://huggingface.co/api/whoami-v2" -Headers $headers -Method GET -ErrorAction Stop
        Write-Host "✅ Hugging Face: Token valid" -ForegroundColor Green
        Write-Host "   User: $($response.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Hugging Face: Invalid token" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Hugging Face: Not configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "🏁 Service testing complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "1. Fix any failed connections" -ForegroundColor White
Write-Host "2. Deploy AI service if not done" -ForegroundColor White
Write-Host "3. Start development server: pnpm dev" -ForegroundColor White
Write-Host "4. Test full booking flow" -ForegroundColor White
Write-Host ""
