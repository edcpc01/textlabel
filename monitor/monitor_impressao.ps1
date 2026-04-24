# monitor_impressao.ps1
# Monitora a pasta Downloads e imprime PDFs do TextLabel via SumatraPDF
# Compativel com Windows PowerShell 5.x e PowerShell 7+
#
# Uso: duplo clique em iniciar_monitor.bat
# Ou:  PowerShell -ExecutionPolicy Bypass -File monitor_impressao.ps1

param(
    [string]$Impressora  = "",
    [string]$SumatraPath = "C:\Program Files\SumatraPDF\SumatraPDF.exe",
    [string]$Pasta       = "$env:USERPROFILE\Downloads"
)

# --- Configuracao de impressora ---
$configFile = Join-Path $PSScriptRoot "impressora.txt"

if (-not $Impressora -and (Test-Path $configFile)) {
    $Impressora = (Get-Content $configFile -Raw).Trim()
}

if (-not $Impressora) {
    Write-Host ""
    Write-Host "=== TextLabel - Monitor de Impressao ===" -ForegroundColor Cyan
    Write-Host "Nenhuma impressora configurada." -ForegroundColor Yellow
    Write-Host "Digite o nome exato da impressora (Enter = impressora padrao do sistema):"
    $Impressora = (Read-Host "> ").Trim()
    if ($Impressora) {
        $Impressora | Out-File -FilePath $configFile -Encoding UTF8
        Write-Host "Impressora salva em: $configFile" -ForegroundColor Green
    }
}

# --- Validacoes ---
if (-not (Test-Path $SumatraPath)) {
    Write-Host ""
    Write-Host "ERRO: SumatraPDF nao encontrado em:" -ForegroundColor Red
    Write-Host "  $SumatraPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Baixe gratuitamente em: https://www.sumatrapdfreader.org"
    Write-Host "Ou edite a variavel SumatraPath no topo deste script."
    Read-Host "Pressione Enter para sair"
    exit 1
}

if (-not (Test-Path $Pasta)) {
    New-Item -ItemType Directory -Path $Pasta -Force | Out-Null
}

# --- Cabecalho ---
Write-Host ""
Write-Host "=== TextLabel - Monitor de Impressao ===" -ForegroundColor Cyan
Write-Host "Pasta monitorada : $Pasta"
if ($Impressora) {
    Write-Host "Impressora       : $Impressora"
} else {
    Write-Host "Impressora       : (padrao do sistema)"
}
Write-Host "SumatraPDF       : $SumatraPath"
Write-Host ""
Write-Host "Aguardando PDFs TextLabel (F*.pdf)..." -ForegroundColor Green
Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor DarkGray
Write-Host ""

# --- Inicializa lista de arquivos ja existentes (nao reimprimir) ---
$jaProcessados = @{}
Get-ChildItem -Path $Pasta -Filter "F*.pdf" -ErrorAction SilentlyContinue | ForEach-Object {
    $jaProcessados[$_.FullName] = $true
}

# --- Loop de monitoramento (polling a cada 3 segundos) ---
while ($true) {
    $arquivos = Get-ChildItem -Path $Pasta -Filter "F*.pdf" -ErrorAction SilentlyContinue

    foreach ($arq in $arquivos) {
        $caminho = $arq.FullName

        if (-not $jaProcessados.ContainsKey($caminho)) {
            $jaProcessados[$caminho] = $true

            # Aguarda o download completar antes de imprimir
            Start-Sleep -Milliseconds 1500

            if (-not (Test-Path $caminho)) { continue }

            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Imprimindo: $($arq.Name)" -ForegroundColor Yellow

            try {
                if ($Impressora) {
                    & $SumatraPath -print-to $Impressora -silent $caminho
                } else {
                    & $SumatraPath -print-to-default -silent $caminho
                }
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] OK: $($arq.Name)" -ForegroundColor Green
            } catch {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERRO ao imprimir $($arq.Name): $_" -ForegroundColor Red
            }
        }
    }

    Start-Sleep -Seconds 3
}
