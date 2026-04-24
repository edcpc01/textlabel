# monitor_impressao.ps1
# Monitora a pasta Downloads e imprime PDFs do TextLabel via SumatraPDF
# Uso: powershell -ExecutionPolicy Bypass -File monitor_impressao.ps1
# Ou dê duplo clique em iniciar_monitor.bat

param(
    [string]$Impressora = "",
    [string]$SumatraPath = "C:\Program Files\SumatraPDF\SumatraPDF.exe",
    [string]$Pasta = "$env:USERPROFILE\Downloads"
)

# Se não passar impressora, tenta ler do arquivo de config local
$configFile = "$PSScriptRoot\impressora.txt"
if (-not $Impressora -and (Test-Path $configFile)) {
    $Impressora = (Get-Content $configFile -Raw).Trim()
}

if (-not $Impressora) {
    Write-Host ""
    Write-Host "=== TextLabel — Monitor de Impressao ===" -ForegroundColor Cyan
    Write-Host "Nenhuma impressora configurada." -ForegroundColor Yellow
    Write-Host "Digite o nome exato da impressora (ou Enter para usar a padrao do sistema):"
    $Impressora = Read-Host "> "
    if ($Impressora) {
        $Impressora | Out-File $configFile -Encoding UTF8
        Write-Host "Impressora salva em $configFile" -ForegroundColor Green
    }
}

if (-not (Test-Path $SumatraPath)) {
    Write-Host ""
    Write-Host "ERRO: SumatraPDF nao encontrado em:" -ForegroundColor Red
    Write-Host "  $SumatraPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Baixe em: https://www.sumatrapdfreader.org/download-free-pdf-viewer"
    Write-Host "Ou edite o caminho no topo deste script."
    Read-Host "Pressione Enter para sair"
    exit 1
}

if (-not (Test-Path $Pasta)) {
    New-Item -ItemType Directory -Path $Pasta -Force | Out-Null
}

Write-Host ""
Write-Host "=== TextLabel — Monitor de Impressao ===" -ForegroundColor Cyan
Write-Host "Pasta monitorada : $Pasta" -ForegroundColor White
if ($Impressora) {
    Write-Host "Impressora       : $Impressora" -ForegroundColor White
} else {
    Write-Host "Impressora       : (padrao do sistema)" -ForegroundColor White
}
Write-Host "SumatraPDF       : $SumatraPath" -ForegroundColor White
Write-Host ""
Write-Host "Aguardando PDFs do TextLabel (padrao F*.pdf)..." -ForegroundColor Green
Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor DarkGray
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path            = $Pasta
$watcher.Filter          = "F*.pdf"
$watcher.NotifyFilter    = [System.IO.NotifyFilters]::FileName
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents   = $false

$acaoImprimir = {
    param($source, $e)
    $arquivo = $e.FullPath
    $nome    = $e.Name

    # Pequena espera para o download completar
    Start-Sleep -Milliseconds 1500

    if (-not (Test-Path $arquivo)) { return }

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Imprimindo: $nome" -ForegroundColor Yellow

    try {
        if ($using:Impressora) {
            & $using:SumatraPath -print-to $using:Impressora -silent $arquivo
        } else {
            & $using:SumatraPath -print-to-default -silent $arquivo
        }
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] OK: $nome" -ForegroundColor Green
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERRO ao imprimir ${nome}: $_" -ForegroundColor Red
    }
}

Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $acaoImprimir | Out-Null
$watcher.EnableRaisingEvents = $true

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "Monitor encerrado." -ForegroundColor DarkGray
}
