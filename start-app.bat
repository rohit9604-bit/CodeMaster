@echo off
cd /d "%~dp0"

echo Starting CodeMaster...

:: Start Backend
start "CodeMaster Backend" cmd /k "cd Backend && npm install && node server.js"

:: Start Frontend
start "CodeMaster Frontend" cmd /k "cd Frontend && npm install && npm run dev"

echo Servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
