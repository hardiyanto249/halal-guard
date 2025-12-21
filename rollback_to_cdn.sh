#!/bin/bash

echo "======================================================================"
echo "ROLLBACK: Kembali ke CDN (aistudiocdn.com)"
echo "======================================================================"
echo ""
echo "Script ini akan mengembalikan aplikasi ke konfigurasi CDN semula"
echo ""

cd /opt/halal-guard/frontend || exit 1

# Check if backup exists
if [ ! -f "index.html.backup.cdn" ]; then
    echo "❌ ERROR: Backup file tidak ditemukan!"
    echo "   File: index.html.backup.cdn"
    echo ""
    echo "Kemungkinan penyebab:"
    echo "  1. Migrasi belum pernah dijalankan"
    echo "  2. Backup file sudah dihapus"
    echo "  3. Anda berada di directory yang salah"
    echo ""
    echo "Solusi:"
    echo "  Jika Anda yakin perlu rollback, restore manual dari git:"
    echo "  git checkout frontend/index.html"
    echo ""
    exit 1
fi

echo "📋 Informasi Backup:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "File backup: index.html.backup.cdn"
echo "Size: $(du -h index.html.backup.cdn | cut -f1)"
echo "Modified: $(stat -c %y index.html.backup.cdn 2>/dev/null || stat -f %Sm index.html.backup.cdn 2>/dev/null)"
echo ""

# Show preview
echo "Preview backup (first 10 lines):"
head -10 index.html.backup.cdn
echo "..."
echo ""

read -p "Lanjutkan rollback? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback dibatalkan"
    exit 0
fi

echo ""
echo "🔄 Step 1: Backup current index.html (just in case)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cp index.html index.html.backup.npm
echo "✅ Current version backed up to: index.html.backup.npm"
echo ""

echo "🔄 Step 2: Restore CDN version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cp index.html.backup.cdn index.html
echo "✅ index.html restored from backup"
echo ""

echo "🔨 Step 3: Rebuild application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "   This is unexpected. Checking if we need to restore npm version..."
    
    read -p "Restore npm version instead? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp index.html.backup.npm index.html
        echo "✅ Restored to npm version"
    fi
    
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ROLLBACK COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ index.html restored to CDN version"
echo "  ✅ Application rebuilt"
echo "  ✅ Backup of npm version saved: index.html.backup.npm"
echo ""
echo "Current configuration:"
echo "  ✅ Using aistudiocdn.com CDN"
echo "  ✅ Import map enabled"
echo "  ⚠️  Dependent on external CDN"
echo ""
echo "Backups available:"
echo "  - index.html.backup.cdn (CDN version - currently active)"
echo "  - index.html.backup.npm (npm version - previous)"
echo ""
echo "Next steps:"
echo "  1. Test the application: npm run dev"
echo "  2. If working, deploy: ../deploy_frontend.sh"
echo "  3. If you want to try npm again: ./migrate_to_npm.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
