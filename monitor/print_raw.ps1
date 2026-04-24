# TextLabel - Envia ZPL RAW para impressora
param(
    [string]$Arquivo,
    [string]$Impressora
)

try {
    # Le o conteudo ZPL
    $zpl = [System.IO.File]::ReadAllText($Arquivo, [System.Text.Encoding]::UTF8)

    # Usa System.Drawing.Printing para envio RAW
    Add-Type -AssemblyName System.Drawing

    $pd = New-Object System.Drawing.Printing.PrintDocument
    $pd.PrinterSettings.PrinterName = $Impressora

    # Verifica se impressora existe
    if (-not $pd.PrinterSettings.IsValid) {
        Write-Host "ERRO: Impressora '$Impressora' nao encontrada"
        exit 1
    }

    # Captura os bytes ZPL
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($zpl)
    $idx = 0

    $pd.add_PrintPage({
        param($sender, $ev)
        # Marca como RAW - nao renderiza graficos
        $ev.HasMorePages = $false
    })

    # Metodo alternativo: usa RawPrinterHelper via P/Invoke correto
    $code = @"
using System;
using System.IO;
using System.Runtime.InteropServices;

public class ZebraPrint {
    [DllImport("winspool.Drv", CharSet=CharSet.Ansi, SetLastError=true)]
    private static extern bool OpenPrinter(string printerName, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", SetLastError=true)]
    private static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", CharSet=CharSet.Ansi, SetLastError=true)]
    private static extern int StartDocPrinter(IntPtr hPrinter, int level, ref DOCINFOA di);

    [DllImport("winspool.Drv", SetLastError=true)]
    private static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", SetLastError=true)]
    private static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", SetLastError=true)]
    private static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", SetLastError=true)]
    private static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Ansi)]
    public struct DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    public static int SendToPrinter(string printerName, byte[] data) {
        IntPtr hPrinter;
        if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) return -1;

        DOCINFOA di = new DOCINFOA();
        di.pDocName  = "TextLabel-ZPL";
        di.pDataType = "RAW";

        if (StartDocPrinter(hPrinter, 1, ref di) <= 0) { ClosePrinter(hPrinter); return -2; }
        if (!StartPagePrinter(hPrinter)) { EndDocPrinter(hPrinter); ClosePrinter(hPrinter); return -3; }

        IntPtr ptr = Marshal.AllocHGlobal(data.Length);
        Marshal.Copy(data, 0, ptr, data.Length);
        Int32 written = 0;
        WritePrinter(hPrinter, ptr, data.Length, out written);
        Marshal.FreeHGlobal(ptr);

        EndPagePrinter(hPrinter);
        EndDocPrinter(hPrinter);
        ClosePrinter(hPrinter);
        return written;
    }
}
"@

    Add-Type -TypeDefinition $code -Language CSharp

    $written = [ZebraPrint]::SendToPrinter($Impressora, $bytes)

    if ($written -gt 0) {
        Write-Host "OK - $written bytes enviados"
        exit 0
    } else {
        Write-Host "ERRO - codigo $written"
        exit 1
    }
} catch {
    Write-Host "ERRO: $_"
    exit 1
}
