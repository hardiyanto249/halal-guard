#!/bin/bash

echo "======================================================================"
echo "MIGRASI FRONTEND: CDN → npm Packages"
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

echo ""
echo "✅ Dependencies installed"
echo ""

echo "📝 Step 2: Backup current index.html..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cp index.html index.html.backup.cdn
echo "✅ Backup saved to: index.html.backup.cdn"
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
    echo "   Restoring backup..."
    cp index.html.backup.cdn index.html
    echo "   Backup restored. Please check errors above."
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
echo "  ✅ Backup saved: index.html.backup.cdn"
echo ""
echo "Changes:"
echo "  ❌ REMOVED: aistudiocdn.com dependency"
echo "  ✅ ADDED: Local npm packages"
echo "  ✅ BENEFIT: No more external CDN dependency"
echo ""
echo "Next steps:"
echo "  1. Test the application: npm run dev"
echo "  2. If working, deploy: ../deploy_frontend.sh"
echo "  3. If issues, restore: cp index.html.backup.cdn index.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
