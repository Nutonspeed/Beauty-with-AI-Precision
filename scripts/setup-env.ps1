# Environment Setup Script for Beauty AI Clinic
# This script helps validate and setup environment variables

Write-Host "🚀 Beauty AI Clinic - Environment Setup Validator" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Please edit .env.local and fill in your actual values" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env.local found" -ForegroundColor Green
}

# Function to check if a variable is set
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$Category,
        [string]$Priority,
        [string]$GetFrom = ""
    )
    
    $content = Get-Content ".env.local" -Raw
    $pattern = "$VarName=`"(.+?)`""
    $match = [regex]::Match($content, $pattern)
    
    $isEmpty = $false
    if ($match.Success) {
        $value = $match.Groups[1].Value
        if ($value -like "*your-*" -or $value -like "*localhost*" -or $value.Length -lt 10) {
            $isEmpty = $true
        }
    } else {
        $isEmpty = $true
    }
    
    $status = if ($isEmpty) { "❌" } else { "✅" }
    $color = if ($isEmpty) { "Red" } else { "Green" }
    
    Write-Host "$status $VarName" -ForegroundColor $color -NoNewline
    if ($Priority -eq "CRITICAL") {
        Write-Host " (CRITICAL)" -ForegroundColor Red -NoNewline
    } elseif ($Priority -eq "HIGH") {
        Write-Host " (HIGH)" -ForegroundColor Yellow -NoNewline
    }
    if ($GetFrom -and $isEmpty) {
        Write-Host " - Get from: $GetFrom" -ForegroundColor Gray
    } else {
        Write-Host ""
    }
    
    return -not $isEmpty
}

Write-Host ""
Write-Host "📋 Environment Variables Status:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Track statistics
$total = 0
$configured = 0

# Database (Supabase) - CRITICAL
Write-Host "🗄️  Database (Supabase):" -ForegroundColor Magenta
$vars = @(
    @{Name="NEXT_PUBLIC_SUPABASE_URL"; Priority="CRITICAL"; GetFrom="https://app.supabase.com/project/YOUR_PROJECT/settings/api"},
    @{Name="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Priority="CRITICAL"; GetFrom="https://app.supabase.com/project/YOUR_PROJECT/settings/api"},
    @{Name="SUPABASE_SERVICE_ROLE_KEY"; Priority="CRITICAL"; GetFrom="https://app.supabase.com/project/YOUR_PROJECT/settings/api"}
)
foreach ($var in $vars) {
    $total++
    if (Test-EnvVar -VarName $var.Name -Category "Database" -Priority $var.Priority -GetFrom $var.GetFrom) {
        $configured++
    }
}

Write-Host ""

# Payment (Stripe) - CRITICAL
Write-Host "💳 Payment Gateway (Stripe):" -ForegroundColor Magenta
$vars = @(
    @{Name="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"; Priority="CRITICAL"; GetFrom="https://dashboard.stripe.com/apikeys"},
    @{Name="STRIPE_SECRET_KEY"; Priority="CRITICAL"; GetFrom="https://dashboard.stripe.com/apikeys"},
    @{Name="STRIPE_WEBHOOK_SECRET"; Priority="CRITICAL"; GetFrom="https://dashboard.stripe.com/webhooks"}
)
foreach ($var in $vars) {
    $total++
    if (Test-EnvVar -VarName $var.Name -Category "Payment" -Priority $var.Priority -GetFrom $var.GetFrom) {
        $configured++
    }
}

Write-Host ""

# Email (Resend) - CRITICAL
Write-Host "📧 Email Service (Resend):" -ForegroundColor Magenta
$vars = @(
    @{Name="RESEND_API_KEY"; Priority="CRITICAL"; GetFrom="https://resend.com/api-keys"},
    @{Name="EMAIL_FROM"; Priority="CRITICAL"; GetFrom="Use: onboarding@resend.dev or your-domain"}
)
foreach ($var in $vars) {
    $total++
    if (Test-EnvVar -VarName $var.Name -Category "Email" -Priority $var.Priority -GetFrom $var.GetFrom) {
        $configured++
    }
}

Write-Host ""

# SMS (Twilio) - CRITICAL
Write-Host "📱 SMS Service (Twilio):" -ForegroundColor Magenta
$vars = @(
    @{Name="TWILIO_ACCOUNT_SID"; Priority="CRITICAL"; GetFrom="https://www.twilio.com/console"},
    @{Name="TWILIO_AUTH_TOKEN"; Priority="CRITICAL"; GetFrom="https://www.twilio.com/console"},
    @{Name="TWILIO_PHONE_NUMBER"; Priority="CRITICAL"; GetFrom="Buy number: https://www.twilio.com/console/phone-numbers"}
)
foreach ($var in $vars) {
    $total++
    if (Test-EnvVar -VarName $var.Name -Category "SMS" -Priority $var.Priority -GetFrom $var.GetFrom) {
        $configured++
    }
}

Write-Host ""

# AI Service - HIGH
Write-Host "🤖 AI Service:" -ForegroundColor Magenta
$vars = @(
    @{Name="AI_SERVICE_URL"; Priority="HIGH"; GetFrom="Deploy to Railway first"},
    @{Name="HUGGINGFACE_TOKEN"; Priority="HIGH"; GetFrom="https://huggingface.co/settings/tokens"},
    @{Name="GEMINI_API_KEY"; Priority="MEDIUM"; GetFrom="https://aistudio.google.com/app/apikey (Optional)"}
)
foreach ($var in $vars) {
    $total++
    if (Test-EnvVar -VarName $var.Name -Category "AI" -Priority $var.Priority -GetFrom $var.GetFrom) {
        $configured++
    }
}

Write-Host ""

# Error Tracking - MEDIUM
Write-Host "🔍 Error Tracking (Sentry):" -ForegroundColor Magenta
$vars = @(
    @{Name="NEXT_PUBLIC_SENTRY_DSN"; Priority="MEDIUM"; GetFrom="https://sentry.io/ (Optional)"}
)
foreach ($var in $vars) {
    $total++
    if (Test-EnvVar -VarName $var.Name -Category "Monitoring" -Priority $var.Priority -GetFrom $var.GetFrom) {
        $configured++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Configuration Progress: $configured/$total ($([math]::Round($configured/$total*100))%)" -ForegroundColor Cyan

if ($configured -eq $total) {
    Write-Host ""
    Write-Host "🎉 All environment variables configured!" -ForegroundColor Green
    Write-Host "✅ Ready to start development" -ForegroundColor Green
} else {
    $missing = $total - $configured
    Write-Host ""
    Write-Host "⚠️  $missing variable(s) need configuration" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Edit .env.local file" -ForegroundColor White
    Write-Host "2. Fill in the missing values (check URLs above)" -ForegroundColor White
    Write-Host "3. Run this script again to validate" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 For quick setup guide, see: docs/QUICK_START_DEPLOYMENT.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🔒 Security reminder:" -ForegroundColor Yellow
Write-Host "- Never commit .env.local to Git" -ForegroundColor White
Write-Host "- .env.local is already in .gitignore" -ForegroundColor White
Write-Host "- For production, set variables in Vercel dashboard" -ForegroundColor White
Write-Host ""
