#!/bin/bash

echo "======================================================================"
echo "MIGRASI FRONTEND: CDN → npm Packages (ENHANCED VERSION)"
echo "======================================================================"
echo ""
echo "Tujuan: Menghilangkan dependency pada aistudiocdn.com"
echo "Benefit: Aplikasi lebih mandiri dan tidak bergantung pada external CDN"
echo ""
echo "======================================================================"
echo ""

cd /opt/halal-guard/frontend || exit 1

echo "📦 Step 1: Install npm packages..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install react@19.2.1 react-dom@19.2.1 lucide-react@0.556.0 recharts@3.5.1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install failed!"
    echo "   Please check your network connection and try again."
    exit 1
fi

echo ""
echo "✅ Dependencies installed"
echo ""

echo "📝 Step 2: Backup current files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backup with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup index.html
cp index.html "index.html.backup.cdn"
cp index.html "index.html.backup.${TIMESTAMP}"
echo "✅ index.html backed up:"
echo "   - index.html.backup.cdn (for rollback)"
echo "   - index.html.backup.${TIMESTAMP} (timestamped)"

# Backup package.json
if [ -f "package.json" ]; then
    cp package.json "package.json.backup.cdn"
    cp package.json "package.json.backup.${TIMESTAMP}"
    echo "✅ package.json backed up:"
    echo "   - package.json.backup.cdn (for rollback)"
    echo "   - package.json.backup.${TIMESTAMP} (timestamped)"
fi

# Backup package-lock.json
if [ -f "package-lock.json" ]; then
    cp package-lock.json "package-lock.json.backup.cdn"
    cp package-lock.json "package-lock.json.backup.${TIMESTAMP}"
    echo "✅ package-lock.json backed up:"
    echo "   - package-lock.json.backup.cdn (for rollback)"
    echo "   - package-lock.json.backup.${TIMESTAMP} (timestamped)"
fi

echo ""

echo "🔧 Step 3: Creating new index.html without CDN..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HalalGuard AI - Sharia Compliance Auditor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', sans-serif;
        background-color: #f8fafc;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
EOF

echo "✅ New index.html created (without import map)"
echo ""

echo "📝 Step 4: Checking index.tsx..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "import React" index.tsx; then
    echo "✅ index.tsx already has proper imports"
else
    echo "⚠️  index.tsx might need import updates"
    echo "   Please ensure it has: import React from 'react'"
fi

echo ""

echo "🔨 Step 5: Rebuild application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 AUTOMATIC ROLLBACK"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Restoring files from backup..."
    
    # Restore index.html
    cp index.html.backup.cdn index.html
    echo "✅ index.html restored"
    
    # Restore package.json if backup exists
    if [ -f "package.json.backup.cdn" ]; then
        cp package.json.backup.cdn package.json
        echo "✅ package.json restored"
    fi
    
    # Restore package-lock.json if backup exists
    if [ -f "package-lock.json.backup.cdn" ]; then
        cp package-lock.json.backup.cdn package-lock.json
        echo "✅ package-lock.json restored"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Rollback complete. Your application is back to CDN version."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please check the build errors above and fix them before retrying."
    echo ""
    echo "Timestamped backups are still available:"
    echo "  - index.html.backup.${TIMESTAMP}"
    echo "  - package.json.backup.${TIMESTAMP}"
    echo "  - package-lock.json.backup.${TIMESTAMP}"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MIGRATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ npm packages installed"
echo "  ✅ index.html updated (no more import map)"
echo "  ✅ Application rebuilt"
echo "  ✅ Backups saved with timestamp: ${TIMESTAMP}"
echo ""
echo "Backup files created:"
echo "  📁 index.html.backup.cdn (for quick rollback)"
echo "  📁 index.html.backup.${TIMESTAMP}"
echo "  📁 package.json.backup.cdn (for quick rollback)"
echo "  📁 package.json.backup.${TIMESTAMP}"
echo "  📁 package-lock.json.backup.cdn (for quick rollback)"
echo "  📁 package-lock.json.backup.${TIMESTAMP}"
echo ""
echo "Changes:"
echo "  ❌ REMOVED: aistudiocdn.com dependency"
echo "  ✅ ADDED: Local npm packages"
echo "  ✅ BENEFIT: No more external CDN dependency"
echo ""
echo "Next steps:"
echo "  1. Test the application: npm run dev"
echo "  2. If working, deploy: ../deploy_frontend.sh"
echo "  3. If issues, rollback: ../rollback_migration.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
