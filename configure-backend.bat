@echo off
echo ========================================
echo HalalGuard AI - Backend Configuration
echo ========================================
echo.

cd backend

if exist .env (
    echo File .env sudah ada!
    echo.
    set /p overwrite="Apakah Anda ingin overwrite? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo.
        echo Setup dibatalkan.
        echo Anda bisa edit manual: backend\.env
        pause
        exit /b 0
    )
)

echo.
echo Membuat file .env dari template...
copy .env.example .env >nul

echo ✅ File .env berhasil dibuat!
echo.
echo ========================================
echo PENTING: Isi konfigurasi berikut!
echo ========================================
echo.

echo 📝 File: backend\.env
echo.
echo Yang perlu diisi:
echo.
echo 1. GEMINI_API_KEY
echo    - Buka: https://aistudio.google.com/app/apikey
echo    - Klik "Create API Key"
echo    - Copy API key
echo    - Paste di file .env
echo.
echo 2. DB_PASSWORD
echo    - Isi dengan password PostgreSQL Anda
echo.
echo ========================================
echo.

set /p open_file="Buka file .env sekarang untuk edit? (y/n): "
if /i "%open_file%"=="y" (
    notepad .env
)

echo.
echo ========================================
echo Checklist Konfigurasi:
echo ========================================
echo.
echo [ ] GEMINI_API_KEY sudah diisi
echo [ ] DB_PASSWORD sudah diisi
echo [ ] DB_USER sesuai (default: postgres)
echo [ ] DB_NAME sesuai (default: halalguard_db)
echo.
echo Setelah semua terisi, jalankan:
echo   start-dev.bat
echo.
pause
