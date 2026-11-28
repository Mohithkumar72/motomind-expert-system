@echo off
title MotoMind Python Backend
echo ========================================================
echo Starting MotoMind Python Backend Server...
echo ========================================================
echo.

cd /d "%~dp0backend"

if exist "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" app.py
    goto end
)

if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" app.py
    goto end
)

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" app.py
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py app.py
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python app.py
    goto end
)

echo [ERROR] Python was not found on your system!
echo Please make sure Python is installed.
echo.
pause

:end
