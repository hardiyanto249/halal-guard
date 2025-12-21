#!/bin/bash

echo "🔄 ROLLBACK: Migration to npm → Back to CDN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will restore your application to use CDN instead of npm packages"
echo ""

cd /opt/halal-guard/frontend || exit 1

# Check if backup exists
if [ ! -f "index.html.backup.cdn" ]; then
    echo "❌ ERROR: Backup file not found!"
    echo "   Looking for: index.html.backup.cdn"
    echo ""
    echo "Cannot rollback without backup."
    exit 1
fi

echo "📋 Rollback Plan:"
echo "  1. Restore index.html from backup"
echo "  2. Restore package.json (if backup exists)"
echo "  3. Clean node_modules"
echo "  4. Reinstall dependencies"
echo "  5. Rebuild application"
echo "  6. Deploy to production"
echo ""
echo "⚠️  WARNING: This will undo the npm migration!"
echo ""
echo "Proceed with rollback? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting rollback..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Restore index.html
echo "📝 Step 1: Restoring index.html..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cp index.html index.html.before_rollback  # Backup current state
cp index.html.backup.cdn index.html
echo "✅ index.html restored from backup"
echo "   Current version backed up to: index.html.before_rollback"
echo ""

# Step 2: Restore package.json (if exists)
echo "📝 Step 2: Restoring package.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "package.json.backup.cdn" ]; then
    cp package.json package.json.before_rollback
    cp package.json.backup.cdn package.json
    echo "✅ package.json restored from backup"
    echo "   Current version backed up to: package.json.before_rollback"
else
    echo "⚠️  No package.json backup found, skipping..."
fi
echo ""

# Step 3: Restore package-lock.json (if exists)
echo "📝 Step 3: Restoring package-lock.json..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "package-lock.json.backup.cdn" ]; then
    cp package-lock.json package-lock.json.before_rollback
    cp package-lock.json.backup.cdn package-lock.json
    echo "✅ package-lock.json restored from backup"
    echo "   Current version backed up to: package-lock.json.before_rollback"
else
    echo "⚠️  No package-lock.json backup found, skipping..."
fi
echo ""

# Step 4: Clean node_modules
echo "🧹 Step 4: Cleaning node_modules..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "node_modules" ]; then
    echo "   Removing node_modules directory..."
    rm -rf node_modules
    echo "✅ node_modules cleaned"
else
    echo "   No node_modules directory found"
fi
echo ""

# Step 5: Reinstall dependencies
echo "📦 Step 5: Reinstalling dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies reinstalled"
else
    echo "❌ Failed to reinstall dependencies"
    echo "   Please check errors above and run manually: npm install"
    exit 1
fi
echo ""

# Step 6: Rebuild application
echo "🔨 Step 6: Rebuilding application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    echo "   Please check errors above"
    exit 1
fi
echo ""

# Step 7: Deploy
echo "🚀 Step 7: Deploying to production..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /opt/halal-guard || exit 1

if [ -f "deploy_frontend.sh" ]; then
    ./deploy_frontend.sh
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful"
    else
        echo "❌ Deployment failed"
        echo "   Please check errors above"
        exit 1
    fi
else
    echo "⚠️  deploy_frontend.sh not found"
    echo "   Please deploy manually"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ROLLBACK COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ index.html restored to CDN version"
echo "  ✅ Dependencies reinstalled"
echo "  ✅ Application rebuilt"
echo "  ✅ Deployed to production"
echo ""
echo "Your application is now back to using CDN:"
echo "  ✅ React from aistudiocdn.com"
echo "  ✅ Import map configuration restored"
echo ""
echo "Backups of npm version saved as:"
echo "  - index.html.before_rollback"
echo "  - package.json.before_rollback (if exists)"
echo "  - package-lock.json.before_rollback (if exists)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
