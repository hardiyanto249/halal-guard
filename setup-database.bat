@echo off
echo ========================================
echo HalalGuard AI - Database Quick Setup
echo ========================================
echo.
echo PILIH METODE SETUP:
echo.
echo 1. Setup Otomatis (dengan password prompt)
echo 2. Lihat Panduan Manual
echo 3. Test Koneksi Database
echo 4. Exit
echo.
set /p choice="Pilih (1-4): "

if "%choice%"=="1" goto auto_setup
if "%choice%"=="2" goto manual_guide
if "%choice%"=="3" goto test_connection
if "%choice%"=="4" goto end

:auto_setup
echo.
echo ========================================
echo Setup Otomatis
echo ========================================
echo.
echo Anda akan diminta:
echo 1. Username PostgreSQL (tekan Enter untuk 'postgres')
echo 2. Password PostgreSQL
echo.
pause

set /p POSTGRES_USER="Username PostgreSQL (default: postgres): "
if "%POSTGRES_USER%"=="" set POSTGRES_USER=postgres

echo.
echo Menjalankan setup dengan user: %POSTGRES_USER%
echo.

psql -U %POSTGRES_USER% -f database\setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ DATABASE SETUP BERHASIL!
    echo ========================================
    echo.
    echo Database: halalguard_db
    echo Tables: transactions, analysis_results
    echo Sample data: 3 transaksi
    echo.
    echo NEXT STEPS:
    echo 1. Edit backend\.env dan isi:
    echo    DB_PASSWORD=your_password_here
    echo    GEMINI_API_KEY=your_api_key_here
    echo.
    echo 2. Jalankan: start-dev.bat
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ SETUP GAGAL
    echo ========================================
    echo.
    echo Kemungkinan masalah:
    echo - Password salah
    echo - PostgreSQL tidak berjalan
    echo - User tidak punya permission
    echo.
    echo Coba metode manual (pilih 2)
    echo.
)
pause
goto menu

:manual_guide
echo.
echo ========================================
echo Panduan Manual Setup
echo ========================================
echo.
echo LANGKAH 1: Buka Command Prompt baru
echo.
echo LANGKAH 2: Jalankan psql
echo    psql -U postgres
echo.
echo LANGKAH 3: Buat database
echo    CREATE DATABASE halalguard_db;
echo    \c halalguard_db
echo.
echo LANGKAH 4: Jalankan setup script
echo    \i database/setup.sql
echo.
echo ATAU dari Command Prompt:
echo    psql -U postgres -d halalguard_db -f database\setup.sql
echo.
echo LANGKAH 5: Verifikasi
echo    psql -U postgres -d halalguard_db
echo    \dt
echo    SELECT * FROM transactions;
echo.
echo Dokumentasi lengkap ada di: DATABASE_SETUP.md
echo.
pause
goto menu

:test_connection
echo.
echo ========================================
echo Test Koneksi Database
echo ========================================
echo.

set /p TEST_USER="Username PostgreSQL (default: postgres): "
if "%TEST_USER%"=="" set TEST_USER=postgres

echo.
echo Testing koneksi ke PostgreSQL...
echo.

psql -U %TEST_USER% -c "SELECT version();"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Koneksi berhasil!
    echo.
    echo Cek apakah database halalguard_db sudah ada:
    echo.
    psql -U %TEST_USER% -c "\l" | findstr halalguard_db
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Database halalguard_db sudah ada!
        echo.
        echo Cek tables:
        psql -U %TEST_USER% -d halalguard_db -c "\dt"
    ) else (
        echo.
        echo ⚠️  Database halalguard_db belum ada
        echo    Jalankan setup (pilih 1)
    )
) else (
    echo.
    echo ❌ Koneksi gagal!
    echo.
    echo Cek:
    echo 1. PostgreSQL service berjalan?
    echo    sc query postgresql-x64-15
    echo.
    echo 2. Username dan password benar?
    echo.
    echo 3. Coba start service:
    echo    net start postgresql-x64-15
    echo.
)
pause
goto menu

:menu
cls
goto :eof

:end
echo.
echo Terima kasih!
exit /b 0
