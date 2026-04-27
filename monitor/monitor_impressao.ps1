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

# --- Funcoes auxiliares ---
function Get-ImpressorasInstaladas {
    try {
        return @(Get-Printer -ErrorAction Stop | Select-Object -ExpandProperty Name)
    } catch {
        return @()
    }
}

function Resolve-NomeImpressora {
    param([string]$NomeArquivo, [string[]]$Disponiveis)
    if (-not $NomeArquivo) { return $null }
    # Match exato (case-insensitive)
    foreach ($p in $Disponiveis) {
        if ($p -ieq $NomeArquivo) { return $p }
    }
    # Match aproximado: trata "_" do nome do arquivo como wildcard (resolve ê → _ etc.)
    $pattern = '^' + ([regex]::Escape($NomeArquivo) -replace '_', '.') + '$'
    foreach ($p in $Disponiveis) {
        if ($p -match $pattern) { return $p }
    }
    return $null
}

function Get-ImpressoraDoArquivo {
    param([string]$NomeArquivo)
    # Padrao: F<x>_<y>_<z>_<ts>__<NomeImpressora>.pdf
    if ($NomeArquivo -match '^F.+__(.+)\.pdf$') {
        return $matches[1]
    }
    return $null
}

# --- Inicializa lista de arquivos ja existentes (nao reimprimir) ---
$jaProcessados = @{}
Get-ChildItem -Path $Pasta -Filter "F*.pdf" -ErrorAction SilentlyContinue | ForEach-Object {
    $jaProcessados[$_.FullName] = $true
}

# --- Loop de monitoramento (polling a cada 3 segundos) ---
while ($true) {
    $arquivos = Get-ChildItem -Path $Pasta -Filter "F*.pdf" -ErrorAction SilentlyContinue
    $impressorasOK = Get-ImpressorasInstaladas

    foreach ($arq in $arquivos) {
        $caminho = $arq.FullName

        if (-not $jaProcessados.ContainsKey($caminho)) {
            $jaProcessados[$caminho] = $true

            # Aguarda o download completar antes de imprimir
            Start-Sleep -Milliseconds 1500

            if (-not (Test-Path $caminho)) { continue }

            # Decide qual impressora usar: prioridade → sufixo do arquivo → impressora.txt → padrao
            $impDoArquivo = Get-ImpressoraDoArquivo $arq.Name
            $impEscolhida = $null
            if ($impDoArquivo) {
                $impEscolhida = Resolve-NomeImpressora -NomeArquivo $impDoArquivo -Disponiveis $impressorasOK
                if (-not $impEscolhida) {
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] AVISO: impressora '$impDoArquivo' (do arquivo) nao encontrada no Windows. Usando fallback." -ForegroundColor Yellow
                }
            }
            if (-not $impEscolhida -and $Impressora) {
                $impEscolhida = Resolve-NomeImpressora -NomeArquivo $Impressora -Disponiveis $impressorasOK
                if (-not $impEscolhida) { $impEscolhida = $Impressora }
            }

            $alvo = if ($impEscolhida) { $impEscolhida } else { '(impressora padrao do sistema)' }
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Imprimindo: $($arq.Name) -> $alvo" -ForegroundColor Yellow

            try {
                if ($impEscolhida) {
                    $proc = Start-Process -FilePath $SumatraPath -ArgumentList @('-print-to', $impEscolhida, '-silent', $caminho) -NoNewWindow -PassThru -Wait
                } else {
                    $proc = Start-Process -FilePath $SumatraPath -ArgumentList @('-print-to-default', '-silent', $caminho) -NoNewWindow -PassThru -Wait
                }
                if ($proc.ExitCode -eq 0) {
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] OK: $($arq.Name)" -ForegroundColor Green
                } else {
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] FALHA (exit=$($proc.ExitCode)): $($arq.Name)" -ForegroundColor Red
                }
            } catch {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERRO ao imprimir $($arq.Name): $_" -ForegroundColor Red
            }
        }
    }

    Start-Sleep -Seconds 3
}
