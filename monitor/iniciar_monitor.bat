@echo off
:: TextLabel — Iniciar Monitor de Impressao PDF
:: Dê duplo clique neste arquivo para iniciar o monitor.
:: O SumatraPDF deve estar instalado em C:\Program Files\SumatraPDF\

title TextLabel — Monitor de Impressao
PowerShell -ExecutionPolicy Bypass -NoExit -File "%~dp0monitor_impressao.ps1"
