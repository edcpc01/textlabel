@echo off
setlocal EnableDelayedExpansion
title TextLabel - Monitor Zebra ZPL
color 0A

:: =====================================================
::  Monitor TextLabel - ZEBRA ZPL
::  Detecta C*.txt e C*.zpl na pasta Downloads e envia
::  via RAW para a impressora Zebra configurada abaixo.
::
::  Para formularios A4 PDF use: iniciar_monitor.bat
:: =====================================================

set "IMPRESSORA_ZPL=ZDesigner ZT230-200dpi ZPL"
set "PASTA=%USERPROFILE%\Downloads"
set "PS1_ZPL=%~dp0print_raw.ps1"

if not exist "%PASTA%\Impressos" mkdir "%PASTA%\Impressos"

echo ========================================
echo  Monitor TextLabel - ZEBRA ZPL
echo ========================================
echo  Pasta   : %PASTA%
echo  Zebra   : %IMPRESSORA_ZPL%
echo  Aguardando C*.txt e C*.zpl...
echo  Ctrl+C para encerrar.
echo ========================================

:LOOP
    for %%F in ("%PASTA%\C*.txt" "%PASTA%\C*.zpl") do (
        if exist "%%F" (
            echo [%TIME%] [ZPL] Detectado: %%~nxF
            copy /y "%%F" "%PASTA%\Impressos\%%~nxF" >nul 2>&1
            del /f /q "%%F" >nul 2>&1
            powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1_ZPL%" "%PASTA%\Impressos\%%~nxF" "%IMPRESSORA_ZPL%"
        )
    )
    timeout /t 1 /nobreak >nul
goto LOOP
