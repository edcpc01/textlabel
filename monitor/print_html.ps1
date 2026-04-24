param(
    [string]$Arquivo,
    [string]$Impressora
)

try {
    $alvo = Get-WmiObject -Class Win32_Printer | Where-Object { $_.Name -eq $Impressora } | Select-Object -First 1
    if (-not $alvo) {
        throw "Impressora '$Impressora' nao encontrada no Windows."
    }

    if (-not (Test-Path $Arquivo)) {
        throw "Arquivo HTML nao encontrado: $Arquivo"
    }

    $edgePath = $null
    $candidatos = @(
        'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        'C:\Program Files\Google\Chrome\Application\chrome.exe'
    )
    foreach ($c in $candidatos) {
        if (Test-Path $c) {
            $edgePath = $c
            break
        }
    }
    if (-not $edgePath) {
        throw "Nao foi encontrado Edge/Chrome para impressao silenciosa."
    }

    $sumatraPath = $null
    $sumatraCandidates = @(
        'C:\Program Files\SumatraPDF\SumatraPDF.exe',
        'C:\Program Files (x86)\SumatraPDF\SumatraPDF.exe'
    )
    foreach ($s in $sumatraCandidates) {
        if (Test-Path $s) {
            $sumatraPath = $s
            break
        }
    }

    # Pipeline rapido: HTML -> PDF (Edge headless) -> impressao direta
    $tmpPdf = Join-Path $env:TEMP ("textlabel_" + [Guid]::NewGuid().ToString("N") + ".pdf")
    $arquivoUri = "file:///" + (($Arquivo -replace '\\','/').Replace(' ', '%20'))
    $pdfArgs = @(
        '--headless=new',
        '--disable-gpu',
        '--run-all-compositor-stages-before-draw',
        '--virtual-time-budget=5000',
        "--print-to-pdf=$tmpPdf",
        '--print-to-pdf-no-header',
        $arquivoUri
    )

    Start-Process -FilePath $edgePath -ArgumentList $pdfArgs -WindowStyle Hidden -Wait
    if (-not (Test-Path $tmpPdf)) {
        throw "Falha ao gerar PDF temporario para impressao."
    }

    $antes = @(Get-PrintJob -PrinterName $Impressora -ErrorAction SilentlyContinue).Count

    if ($sumatraPath) {
        Start-Process -FilePath $sumatraPath -ArgumentList @('-print-to', $Impressora, '-silent', '-exit-when-done', $tmpPdf) -WindowStyle Hidden -Wait
    } else {
        Write-Host "Aviso: SumatraPDF nao encontrado. Usando fallback kiosk."
        Start-Process -FilePath $edgePath -ArgumentList "--kiosk-printing", "--new-window", "`"$Arquivo`"" -WindowStyle Hidden
        Start-Sleep -Seconds 8
    }

    $sucesso = $false
    for ($i = 0; $i -lt 6; $i++) {
        Start-Sleep -Milliseconds 600
        $depois = @(Get-PrintJob -PrinterName $Impressora -ErrorAction SilentlyContinue).Count
        if ($depois -gt $antes) {
            $sucesso = $true
            break
        }
    }

    # Fecha apenas janelas abertas para imprimir os formularios
    Get-Process -Name msedge, chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match 'Formul' } | Stop-Process -Force

    if (Test-Path $tmpPdf) {
        Remove-Item $tmpPdf -Force -ErrorAction SilentlyContinue
    }

    if ($sucesso) {
        Write-Host "OK - Formulario enviado para a fila."
    } else {
        Write-Host "OK - Formulario processado, mas a fila pode limpar rapido; valide na impressora."
    }
    exit 0
} catch {
    Write-Host "ERRO: $_"
    exit 1
}
