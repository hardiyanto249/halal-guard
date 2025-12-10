@echo off
echo ========================================
echo Starting HalalGuard AI Development Servers
echo ========================================
echo.

echo Starting Backend Server...
start "HalalGuard Backend" cmd /k "cd backend && go run main.go"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "HalalGuard Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo ✅ Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8087
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause > nul

taskkill /FI "WindowTitle eq HalalGuard Backend*" /T /F
taskkill /FI "WindowTitle eq HalalGuard Frontend*" /T /F

echo.
echo Servers stopped.
pause
