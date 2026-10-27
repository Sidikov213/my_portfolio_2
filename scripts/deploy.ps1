# Local deploy helper (Windows PowerShell)
# 1) git push origin main
# 2) ssh to VPS and run remote rebuild

param(
  [string]$HostName = $(if ($env:DEPLOY_SSH_HOST) { $env:DEPLOY_SSH_HOST } else { "159.194.235.82" }),
  [string]$User = $(if ($env:DEPLOY_SSH_USER) { $env:DEPLOY_SSH_USER } else { "root" })
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "==> git push"
git push origin main

Write-Host "==> remote deploy"
Get-Content "$PSScriptRoot\deploy-on-server.sh" -Raw |
  ssh -o BatchMode=yes "${User}@${HostName}" "sed 's/\r$//' | bash -s"

Write-Host "==> live: http://${HostName}"
