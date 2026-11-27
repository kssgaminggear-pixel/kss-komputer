# Dijalankan Task Scheduler. Chrome dibuka dengan jendela, jadi pengguna harus sedang login.
$ErrorActionPreference = 'Continue'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$logDir = Join-Path $env:USERPROFILE '.kss-sync\logs'
New-Item -ItemType Directory -Force $logDir | Out-Null
$log = Join-Path $logDir ("sync-{0}.log" -f (Get-Date -Format 'yyyy-MM-dd'))

$env:Path += ";$env:ProgramFiles\GitHub CLI"
Set-Location $repo
cmd /c "node scripts\sync\run.mjs >> `"$log`" 2>&1"
$code = $LASTEXITCODE

Get-ChildItem $logDir -Filter 'sync-*.log' |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
  Remove-Item -Confirm:$false
exit $code
