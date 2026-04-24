# monitor_impressao.ps1
# Monitora a pasta Downloads e imprime PDFs do TextLabel via SumatraPDF
# Compativel com Windows PowerShell 5.x e PowerShell 7+
#
# SumatraPDF PORTATIL (sem instalacao):
#   1. Baixe em: https://www.sumatrapdfreader.org/download-free-pdf-viewer
#      (escolha "64-bit" em "Portable version")
#   2. Coloque o arquivo SumatraPDF.exe na MESMA PASTA deste script
#   3. Execute iniciar_monitor.bat
#
# Uso: duplo clique em iniciar_monitor.bat

param(
    [string]$Impressora  = "",
    [string]$SumatraPath = "",
    [string]$Pasta       = "$env:USERPROFILE\Downloads"
)

$cfgImpressora = Join-Path $PSScriptRoot "impressora.txt"
$cfgSumatra    = Join-Path $PSScriptRoot "sumatra_path.txt"

# --- Localiza SumatraPDF ---
if (-not $SumatraPath -and (Test-Path $cfgSumatra)) {
    $SumatraPath = (Get-Content $cfgSumatra -Raw).Trim()
}

if (-not $SumatraPath -or -not (Test-Path $SumatraPath)) {
    # Ordem de busca: pasta do script → LocalAppData → Program Files → Program Files (x86)
    $candidatos = @(
        (Join-Path $PSScriptRoot "SumatraPDF.exe"),
        "$env:LOCALAPPDATA\SumatraPDF\SumatraPDF.exe",
        "$env:LOCALAPPDATA\Programs\SumatraPDF\SumatraPDF.exe",
        "C:\Program Files\SumatraPDF\SumatraPDF.exe",
        "C:\Program Files (x86)\SumatraPDF\SumatraPDF.exe"
    )
    foreach ($c in $candidatos) {
        if (Test-Path $c) { $SumatraPath = $c; break }
    }
}

if (-not $SumatraPath -or -not (Test-Path $SumatraPath)) {
    Write-Host ""
    Write-Host "=== TextLabel - Monitor de Impressao ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ERRO: SumatraPDF nao encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Como resolver (SEM permissao de admin):" -ForegroundColor Yellow
    Write-Host "  1. Acesse: https://www.sumatrapdfreader.org/download-free-pdf-viewer"
    Write-Host "  2. Clique em 'Portable version' (64-bit ou 32-bit)"
    Write-Host "  3. Salve o arquivo SumatraPDF.exe nesta pasta:"
    Write-Host "     $PSScriptRoot" -ForegroundColor Cyan
    Write-Host "  4. Execute iniciar_monitor.bat novamente."
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Salva caminho encontrado para proximas execucoes
$SumatraPath | Out-File -FilePath $cfgSumatra -Encoding UTF8

# --- Configuracao de impressora ---
if (-not $Impressora -and (Test-Path $cfgImpressora)) {
    $Impressora = (Get-Content $cfgImpressora -Raw).Trim()
}

if (-not $Impressora) {
    Write-Host ""
    Write-Host "=== TextLabel - Monitor de Impressao ===" -ForegroundColor Cyan
    Write-Host "Nenhuma impressora configurada." -ForegroundColor Yellow
    Write-Host "Digite o nome exato da impressora (Enter = impressora padrao do sistema):"
    $Impressora = (Read-Host "> ").Trim()
    if ($Impressora) {
        $Impressora | Out-File -FilePath $cfgImpressora -Encoding UTF8
        Write-Host "Impressora salva em: $cfgImpressora" -ForegroundColor Green
    }
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
