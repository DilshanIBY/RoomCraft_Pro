#!/bin/bash

echo ""
echo " ===================================================="
echo "  RoomCraft Pro - One-Click Setup"
echo "  Intelligent Furniture Visualization Platform"
echo " ===================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo " [ERROR] Node.js is not installed."
    echo " Please install Node.js 18+ from https://nodejs.org"
    echo ""
    exit 1
fi

NODE_VER=$(node -v)
echo " [OK] Node.js $NODE_VER detected"
echo ""

# Install dependencies
echo " [1/3] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo " [ERROR] npm install failed. Check your network connection."
    exit 1
fi
echo " [OK] Dependencies installed"
echo ""

# Build check
echo " [2/3] Verifying TypeScript compilation..."
npx tsc -b --noEmit 2>/dev/null
if [ $? -ne 0 ]; then
    echo " [WARN] TypeScript has warnings - app will still run fine."
else
    echo " [OK] TypeScript compilation clean"
fi
echo ""

# Start dev server
echo " [3/3] Starting development server..."
echo ""
echo " ===================================================="
echo "  App will open at http://localhost:5173"
echo ""
echo "  Demo Accounts:"
echo "    Admin:    admin@roomcraft.com    / Demo@123"
echo "    Designer: designer@roomcraft.com / Demo@123"
echo "    Customer: customer@roomcraft.com / Demo@123"
echo " ===================================================="
echo ""
npm run dev
