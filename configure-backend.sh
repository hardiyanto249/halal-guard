#!/bin/bash

echo "========================================"
echo "HalalGuard AI - Backend Configuration"
echo "========================================"
echo ""

cd backend

if [ -f .env ]; then
    echo "File .env sudah ada!"
    echo ""
    read -p "Apakah Anda ingin overwrite? (y/n): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo ""
        echo "Setup dibatalkan."
        echo "Anda bisa edit manual: backend/.env"
        exit 0
    fi
fi

echo ""
echo "Membuat file .env dari template..."
cp .env.example .env

echo "✅ File .env berhasil dibuat!"
echo ""
echo "========================================"
echo "PENTING: Isi konfigurasi berikut!"
echo "========================================"
echo ""

echo "📝 File: backend/.env"
echo ""
echo "Yang perlu diisi:"
echo ""
echo "1. GEMINI_API_KEY"
echo "   - Buka: https://aistudio.google.com/app/apikey"
echo "   - Klik 'Create API Key'"
echo "   - Copy API key"
echo "   - Paste di file .env"
echo ""
echo "2. DB_PASSWORD"
echo "   - Isi dengan password PostgreSQL Anda"
echo ""
echo "========================================"
echo ""

read -p "Buka file .env sekarang untuk edit? (y/n): " open_file
if [ "$open_file" = "y" ] || [ "$open_file" = "Y" ]; then
    # Try different editors
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    elif command -v vi &> /dev/null; then
        vi .env
    else
        echo "Editor tidak ditemukan. Edit manual dengan:"
        echo "  nano backend/.env"
        echo "  atau"
        echo "  vim backend/.env"
    fi
fi

echo ""
echo "========================================"
echo "Checklist Konfigurasi:"
echo "========================================"
echo ""
echo "[ ] GEMINI_API_KEY sudah diisi"
echo "[ ] DB_PASSWORD sudah diisi"
echo "[ ] DB_USER sesuai (default: postgres)"
echo "[ ] DB_NAME sesuai (default: halalguard_db)"
echo ""
echo "Setelah semua terisi, jalankan:"
echo "  ./start-dev.sh"
echo ""
