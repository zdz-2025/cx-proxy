$port = 3000
$proc = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'proxy[\\/]proxy\.js' }
if ($proc) {
    Write-Host "Proxy already running (PID $($proc.Id))" -ForegroundColor Yellow
    exit
}
Write-Host "Starting DeepSeek Gateway on http://127.0.0.1:$port" -ForegroundColor Green
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "$env:USERPROFILE\.codex\proxy\proxy.js" -RedirectStandardError "$env:USERPROFILE\.codex\proxy\proxy_err.log"
Write-Host "Started. Use 'codex' in a new terminal to use DeepSeek models." -ForegroundColor Green
