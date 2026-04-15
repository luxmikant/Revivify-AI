@echo off
REM Flame Graph Visualizer - Quick Start Script for Windows

echo.
echo 🔥 Revivify AI - Flame Graph Visualizer
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    pause
    exit /b 1
)

echo ✅ Node.js detected
for /f "tokens=*" %%i in ('node --version') do echo    %%i
echo.

REM Navigate to profiler directory
cd /d "%~dp0apps\profiler" || exit /b 1

REM Install dependencies
echo 📦 Installing dependencies...
call npm install --quiet

echo.
echo 🚀 Starting Flame Graph Visualizer...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 Open your browser and go to:
echo    👉 http://localhost:3001
echo.
echo 📊 Features:
echo    • Click 'Generate Mock Data' to see example flame graph
echo    • Hover over blocks to see function details
echo    • Click to zoom in, double-click to reset
echo    • Download graph data for further analysis
echo.
echo ⏹️  Press Ctrl+C to stop the server
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call npm run dev

pause
