@echo off
setlocal EnableDelayedExpansion
title TextLabel - Monitor USB e Rede
color 0A

:: CONFIGURACOES
set "IMPRESSORA_ZPL=ZDesigner ZT230-200dpi ZPL"
set "PASTA=%USERPROFILE%\Downloads"
set "PS1_ZPL=%~dp0print_raw.ps1"

if not exist "%PASTA%\Impressos" mkdir "%PASTA%\Impressos"

echo ========================================
echo  Monitor TextLabel - MODO ESTAVEL (COM)
echo ========================================

:: LIMPAR CABECALHOS E RODAPES NO REGISTRO DO WINDOWS (IE/COM)
reg add "HKCU\Software\Microsoft\Internet Explorer\PageSetup" /v "header" /t REG_SZ /d "" /f >nul
reg add "HKCU\Software\Microsoft\Internet Explorer\PageSetup" /v "footer" /t REG_SZ /d "" /f >nul
reg add "HKCU\Software\Microsoft\Internet Explorer\PageSetup" /v "margin_bottom" /t REG_SZ /d "0" /f >nul
reg add "HKCU\Software\Microsoft\Internet Explorer\PageSetup" /v "margin_left" /t REG_SZ /d "0" /f >nul
reg add "HKCU\Software\Microsoft\Internet Explorer\PageSetup" /v "margin_right" /t REG_SZ /d "0" /f >nul
reg add "HKCU\Software\Microsoft\Internet Explorer\PageSetup" /v "margin_top" /t REG_SZ /d "0" /f >nul

:LOOP
    :: 1) PROCESSAR ETIQUETAS ZPL
    for %%F in ("%PASTA%\C*.txt") do (
        echo [%TIME%] [ZPL] Detectado: %%~nxF
        copy /y "%%F" "%PASTA%\Impressos\%%~nxF" >nul 2>&1
        del /f /q "%%F" >nul 2>&1
        powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1_ZPL%" "%PASTA%\Impressos\%%~nxF" "%IMPRESSORA_ZPL%"
    )

    :: 2) PROCESSAR FORMULARIOS HTM
    for %%F in ("%PASTA%\F*.htm") do (
        echo [%TIME%] [HTM] Detectado: %%~nxF
        
        set "FILE_NAME=%%~nF"
        set "PRINTER_NAME=NONE"
        set "TEMP_NAME=!FILE_NAME:*__=!"
        if "!TEMP_NAME!" neq "!FILE_NAME!" (set "PRINTER_NAME=!TEMP_NAME!")

        copy /y "%%F" "%PASTA%\Impressos\%%~nxF" >nul 2>&1
        del /f /q "%%F" >nul 2>&1

        if "!PRINTER_NAME!"=="NONE" (
            start "" "%PASTA%\Impressos\%%~nxF"
        ) else (
            echo -^> Imprimindo Silencioso em: !PRINTER_NAME!
            
            :: Dispara a impressao via Objeto COM (Internet Explorer Wrapper)
            :: Este metodo e o mais estavel para impressao multipagina silenciosa
            powershell -Command "$ie = New-Object -ComObject InternetExplorer.Application; $ie.Navigate('file:///%PASTA:\=/%/Impressos/%%~nxF'); while($ie.ReadyState -ne 4){Start-Sleep -m 100}; $n=New-Object -ComObject WScript.Network; $n.SetDefaultPrinter('!PRINTER_NAME!'); $ie.ExecWB(6,2); Start-Sleep -s 10; $ie.Quit()"
        )
    )
    timeout /t 1 /nobreak >nul
goto LOOP



