# BIDERA — configuration Vercel (login requis une fois)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-vercel.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

function Test-VercelAuth {
  $out = npx vercel@latest whoami 2>&1 | Out-String
  return ($LASTEXITCODE -eq 0 -and $out -notmatch "Logged out")
}

function Read-EnvValue([string]$name) {
  foreach ($line in Get-Content ".env.local") {
    if ($line -match "^\s*$name=(.*)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Add-VercelEnv([string]$name, [string]$value, [string]$envs = "production,preview,development") {
  if ([string]::IsNullOrWhiteSpace($value)) { return }
  Write-Host "  + $name"
  $value | npx vercel@latest env add $name $envs --force 2>&1 | Out-Null
}

Write-Step "Verification connexion Vercel"
if (-not (Test-VercelAuth)) {
  Write-Host "Connexion requise. Ouverture du navigateur..." -ForegroundColor Yellow
  Start-Process "https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2FAmar2K111%2Fmateriabidera"
  npx vercel@latest login
  if (-not (Test-VercelAuth)) {
    throw "Connexion Vercel echouee. Relancez le script apres vous etre connecte."
  }
}

Write-Step "Liaison du projet materiabidera"
if (-not (Test-Path ".vercel/project.json")) {
  npx vercel@latest link --yes --project materiabidera 2>&1
  if ($LASTEXITCODE -ne 0) {
    npx vercel@latest link --yes 2>&1
  }
}

Write-Step "Variables d'environnement"
$vars = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AI_PROVIDER",
  "GEMINI_API_KEY",
  "ANTHROPIC_API_KEY"
)
foreach ($v in $vars) {
  Add-VercelEnv $v (Read-EnvValue $v)
}

Write-Step "Premier deploiement production (build sur les serveurs Vercel)"
npx vercel@latest deploy --prod --yes 2>&1

Write-Step "Connexion Git pour deploiements auto sur push"
npx vercel@latest git connect "https://github.com/Amar2K111/materiabidera" 2>&1

Write-Host "`nTermine. Chaque push sur main declenchera un redeploiement." -ForegroundColor Green
