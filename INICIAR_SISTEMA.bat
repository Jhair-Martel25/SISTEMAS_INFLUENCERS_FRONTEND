@echo off
title Sistema Influencers - Backend + Frontend
color 0b
echo ===================================================
echo     INICIANDO SISTEMA DE INFLUENCERS Y EMBAJADORES
echo ===================================================
echo.

:: 1. Verificar e iniciar Backend (puerto 3000)
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Backend ya esta corriendo en el puerto 3000.
) else (
    echo [..] Iniciando Backend en el puerto 3000...
    start "Backend Influencers (Puerto 3000)" cmd /k "cd /d C:\Users\elcha\Downloads\BACKEND_SP\SISTEMA_INFLUENCER_BACKEND && node dist/src/main.js"
    echo [OK] Backend lanzado.
)

:: 2. Verificar e iniciar Frontend (puerto 5174)
netstat -ano | findstr :5174 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend ya esta corriendo en el puerto 5174.
) else (
    echo [..] Iniciando Frontend en el puerto 5174...
    start "Frontend Influencers (Puerto 5174)" cmd /k "cd /d C:\Users\elcha\Downloads\FRONTED .SB\SISTEMAS_INFLUENCERS_FRONTEND && npm run dev"
    echo [OK] Frontend lanzado.
)

:: 3. Esperar y abrir navegador
timeout /t 2 /nobreak >nul
start http://localhost:5174/influencers/nuevo

echo.
echo ===================================================
echo  Sistema iniciado correctamente en http://localhost:5174
echo ===================================================
timeout /t 4
