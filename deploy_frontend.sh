#!/bin/bash

echo "======================================================================"
echo "DEPLOYING FRONTEND UPDATE"
echo "======================================================================"
echo ""

# Check if dist directory exists
if [ ! -d "frontend/dist" ]; then
    echo "❌ Error: frontend/dist directory not found!"
    echo "   Please run 'cd frontend && npm run build' first"
    exit 1
fi

echo "📦 Copying new build to production..."
cp -r frontend/dist/* /var/www/halal-guard/ 2>/dev/null || {
    echo "⚠️  Could not copy to /var/www/halal-guard/"
    echo "   Trying alternative locations..."
    
    # Try other common locations
    if [ -d "/usr/share/nginx/html/halal-guard" ]; then
        cp -r frontend/dist/* /usr/share/nginx/html/halal-guard/
        echo "✅ Copied to /usr/share/nginx/html/halal-guard/"
    elif [ -d "/var/www/html/halal-guard" ]; then
        cp -r frontend/dist/* /var/www/html/halal-guard/
        echo "✅ Copied to /var/www/html/halal-guard/"
    else
        echo "❌ Could not find web root directory"
        echo "   Please manually copy frontend/dist/* to your web server root"
        exit 1
    fi
}

echo ""
echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo nginx -s reload || {
    echo "⚠️  Could not reload Nginx automatically"
    echo "   Please run: sudo nginx -s reload"
}

echo ""
echo "======================================================================"
echo "DEPLOYMENT COMPLETE"
echo "======================================================================"
echo ""
echo "✅ Frontend has been updated with:"
echo "   - Debug console logs for data loading"
echo "   - Visual loading indicator"
echo "   - Better error handling"
echo ""
echo "📝 Next steps:"
echo "   1. Open https://halal-guard.centonk.my.id/ in your browser"
echo "   2. Open browser console (F12)"
echo "   3. Look for these messages:"
echo "      - '🔄 Loading transactions from API...'"
echo "      - '✅ Loaded X transactions:'"
echo "      - '✅ Loading complete, setting isLoading to false'"
echo ""
echo "   If you see errors in console, that will help us identify the issue!"
echo ""
