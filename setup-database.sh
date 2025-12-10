#!/bin/bash

echo "========================================"
echo "HalalGuard AI - Database Setup"
echo "========================================"
echo ""

echo "This script will:"
echo "1. Create database 'halalguard_db'"
echo "2. Create tables (transactions, analysis_results)"
echo "3. Create indexes and views"
echo "4. Insert sample data"
echo ""

read -p "Enter PostgreSQL username (default: postgres): " POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-postgres}

echo ""
echo "Running database setup..."
echo ""

psql -U $POSTGRES_USER -f database/setup.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ Database setup completed successfully!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "1. Configure backend/.env with your database credentials"
    echo "2. Run './start-dev.sh' to start the application"
    echo ""
else
    echo ""
    echo "========================================"
    echo "❌ Database setup failed!"
    echo "========================================"
    echo ""
    echo "Possible issues:"
    echo "- PostgreSQL is not running"
    echo "- Wrong username or password"
    echo "- Insufficient permissions"
    echo ""
    echo "Try:"
    echo "1. Check if PostgreSQL service is running"
    echo "   sudo systemctl status postgresql"
    echo "2. Verify your username and password"
    echo "3. Run with sudo if needed"
    echo ""
fi
