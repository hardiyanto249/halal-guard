@echo off
echo ========================================
echo HalalGuard AI - Development Setup
echo ========================================
echo.

echo [1/3] Setting up Backend...
cd backend
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit backend/.env and add your GEMINI_API_KEY and database credentials!
    echo.
    pause
)

echo Installing Go dependencies...
go mod download
if %errorlevel% neq 0 (
    echo ❌ Failed to install Go dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo [2/3] Setting up Frontend...
cd frontend

echo Installing Node dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo [3/3] Database Setup
echo.
echo Please run the following commands to setup your database:
echo   1. createdb halalguard_db
echo   2. psql -d halalguard_db -f database/schema.sql
echo.

echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit backend/.env with your credentials
echo   2. Setup PostgreSQL database (see above)
echo   3. Run 'start-dev.bat' to start both servers
echo.
pause
