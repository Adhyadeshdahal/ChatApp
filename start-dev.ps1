$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Assert-PathExists {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,
    [Parameter(Mandatory = $true)]
    [string] $Label
  )

  if (-not (Test-Path $Path)) {
    throw "$Label was not found at $Path"
  }
}

function Start-NpmDev {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Name,
    [Parameter(Mandatory = $true)]
    [string] $WorkingDirectory,
    [Parameter(Mandatory = $true)]
    [string[]] $Arguments
  )

  Write-Host "Starting $Name..." -ForegroundColor Cyan
  Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Normal
}

Assert-PathExists -Path (Join-Path $backend "package.json") -Label "Backend package.json"
Assert-PathExists -Path (Join-Path $frontend "package.json") -Label "Frontend package.json"
Assert-PathExists -Path (Join-Path $backend ".env") -Label "Backend .env"
Assert-PathExists -Path (Join-Path $frontend ".env") -Label "Frontend .env"

Start-NpmDev -Name "backend API on http://localhost:5000" -WorkingDirectory $backend -Arguments @("run", "dev")
Start-NpmDev -Name "frontend on http://127.0.0.1:5173" -WorkingDirectory $frontend -Arguments @("run", "dev", "--", "--host", "127.0.0.1")

Write-Host ""
Write-Host "Dev servers are launching in separate windows." -ForegroundColor Green
Write-Host "Open http://127.0.0.1:5173 after Vite finishes starting."
Write-Host "If the backend exits, make sure MongoDB is running or MONGO_URI points to a reachable database."
