# Load environment variables and run script
# Usage: .\run-with-env.ps1 <script-name.mjs>

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptName
)

# Load .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from $envFile..." -ForegroundColor Cyan
    
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  Set: $key" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
}

# Run the script
Write-Host "Running: node scripts\$ScriptName" -ForegroundColor Green
node "scripts\$ScriptName"

# Exit with the script's exit code
exit $LASTEXITCODE
