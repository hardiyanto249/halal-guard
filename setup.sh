#!/bin/bash

echo "========================================"
echo "HalalGuard AI - Development Setup"
echo "========================================"
echo ""

echo "[1/3] Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your GEMINI_API_KEY and database credentials!"
    echo ""
    read -p "Press enter to continue..."
fi

echo "Installing Go dependencies..."
go mod download
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Go dependencies"
    exit 1
fi

cd ..

echo ""
echo "[2/3] Setting up Frontend..."
cd frontend

echo "Installing Node dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node dependencies"
    exit 1
fi

cd ..

echo ""
echo "[3/3] Database Setup"
echo ""
echo "Please run the following commands to setup your database:"
echo "  1. createdb halalguard_db"
echo "  2. psql -d halalguard_db -f database/schema.sql"
echo ""

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env with your credentials"
echo "  2. Setup PostgreSQL database (see above)"
echo "  3. Run './start-dev.sh' to start both servers"
echo ""
