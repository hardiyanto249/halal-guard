#!/bin/bash

echo "🔍 Pre-Flight Checks for migrate_to_npm.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

WARNINGS=0
ERRORS=0

# 1. Check available memory
echo "1️⃣  Checking Memory..."
AVAILABLE_MEM=$(free -m | awk 'NR==2 {print $7}')
TOTAL_MEM=$(free -m | awk 'NR==2 {print $2}')
echo "   Total Memory: ${TOTAL_MEM}MB"
echo "   Available Memory: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 500 ]; then
    echo -e "   ${RED}❌ CRITICAL: Very low memory! (< 500MB)${NC}"
    echo "   Migration will likely fail or kill other processes"
    ERRORS=$((ERRORS + 1))
elif [ "$AVAILABLE_MEM" -lt 1000 ]; then
    echo -e "   ${YELLOW}⚠️  WARNING: Low memory! (< 1GB)${NC}"
    echo "   Consider adding swap or running during low traffic"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ Memory OK${NC}"
fi
echo ""

# 2. Check swap
echo "2️⃣  Checking Swap..."
SWAP_TOTAL=$(free -m | awk 'NR==3 {print $2}')
SWAP_USED=$(free -m | awk 'NR==3 {print $3}')
SWAP_FREE=$(free -m | awk 'NR==3 {print $4}')
echo "   Total Swap: ${SWAP_TOTAL}MB"
echo "   Used Swap: ${SWAP_USED}MB"
echo "   Free Swap: ${SWAP_FREE}MB"

if [ "$SWAP_TOTAL" -eq 0 ]; then
    echo -e "   ${YELLOW}⚠️  WARNING: No swap configured${NC}"
    echo "   Recommended: Add at least 1GB swap"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ Swap configured${NC}"
fi
echo ""

# 3. Check disk space
echo "3️⃣  Checking Disk Space..."
AVAILABLE_DISK=$(df -h /opt/halal-guard | awk 'NR==2 {print $4}')
AVAILABLE_DISK_MB=$(df -m /opt/halal-guard | awk 'NR==2 {print $4}')
USED_PERCENT=$(df -h /opt/halal-guard | awk 'NR==2 {print $5}')
echo "   Available Disk: ${AVAILABLE_DISK}"
echo "   Used: ${USED_PERCENT}"

if [ "$AVAILABLE_DISK_MB" -lt 200 ]; then
    echo -e "   ${RED}❌ CRITICAL: Very low disk space! (< 200MB)${NC}"
    echo "   Migration will likely fail"
    ERRORS=$((ERRORS + 1))
elif [ "$AVAILABLE_DISK_MB" -lt 500 ]; then
    echo -e "   ${YELLOW}⚠️  WARNING: Low disk space! (< 500MB)${NC}"
    echo "   Recommended: Free up some space"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ Disk space OK${NC}"
fi
echo ""

# 4. Check CPU load
echo "4️⃣  Checking CPU Load..."
CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
CPU_CORES=$(nproc)
echo "   CPU Cores: ${CPU_CORES}"
echo "   Load Average (1min): ${CPU_LOAD}"

# Convert to integer for comparison (multiply by 100)
CPU_LOAD_INT=$(echo "$CPU_LOAD * 100" | bc | cut -d'.' -f1)
CPU_THRESHOLD=$((CPU_CORES * 200)) # 2.0 per core

if [ "$CPU_LOAD_INT" -gt "$CPU_THRESHOLD" ]; then
    echo -e "   ${YELLOW}⚠️  WARNING: High CPU load${NC}"
    echo "   Consider running during low traffic"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ CPU load OK${NC}"
fi
echo ""

# 5. Check if critical processes running
echo "5️⃣  Checking Critical Processes..."
echo "   Running processes:"

# PostgreSQL
if pgrep -x postgres > /dev/null; then
    echo -e "   ${GREEN}✅ PostgreSQL running${NC}"
else
    echo "   ℹ️  PostgreSQL not detected"
fi

# MySQL
if pgrep -x mysqld > /dev/null; then
    echo -e "   ${GREEN}✅ MySQL running${NC}"
else
    echo "   ℹ️  MySQL not detected"
fi

# Nginx
if pgrep -x nginx > /dev/null; then
    echo -e "   ${GREEN}✅ Nginx running${NC}"
else
    echo "   ℹ️  Nginx not detected"
fi

# Node.js processes
NODE_COUNT=$(pgrep -x node | wc -l)
if [ "$NODE_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Node.js processes: ${NODE_COUNT}${NC}"
else
    echo "   ℹ️  No Node.js processes detected"
fi
echo ""

# 6. Check network connectivity
echo "6️⃣  Checking Network Connectivity..."
if ping -c 1 registry.npmjs.org > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Can reach npm registry${NC}"
else
    echo -e "   ${RED}❌ CRITICAL: Cannot reach npm registry${NC}"
    echo "   Migration will fail at npm install"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 7. Check if backup exists
echo "7️⃣  Checking Existing Backups..."
if [ -f "/opt/halal-guard/frontend/index.html.backup.cdn" ]; then
    BACKUP_DATE=$(stat -c %y /opt/halal-guard/frontend/index.html.backup.cdn | cut -d' ' -f1)
    echo -e "   ${YELLOW}⚠️  Backup already exists from: ${BACKUP_DATE}${NC}"
    echo "   Will be overwritten if you proceed"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ No existing backup (clean state)${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ ERRORS: ${ERRORS}${NC}"
    echo -e "${RED}   Migration is NOT recommended!${NC}"
    echo ""
    exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: ${WARNINGS}${NC}"
    echo -e "${YELLOW}   Migration can proceed, but with caution${NC}"
    echo ""
else
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${GREEN}   Safe to proceed with migration${NC}"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Proceed with migration? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Starting migration in 3 seconds..."
sleep 1
echo "2..."
sleep 1
echo "1..."
sleep 1
echo ""
echo "🚀 Launching migrate_to_npm.sh..."
echo ""

# Run the migration script
cd /opt/halal-guard || exit 1
./migrate_to_npm.sh
