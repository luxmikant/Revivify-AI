#!/bin/bash
# Flame Graph Visualizer - Quick Start Script

echo "🔥 Revivify AI - Flame Graph Visualizer"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Navigate to profiler directory
cd "$(dirname "$0")/apps/profiler" || exit

# Install dependencies
echo "📦 Installing dependencies..."
npm install --quiet

echo ""
echo "🚀 Starting Flame Graph Visualizer..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open your browser and go to:"
echo "   👉 http://localhost:3001"
echo ""
echo "📊 Features:"
echo "   • Click 'Generate Mock Data' to see example flame graph"
echo "   • Hover over blocks to see function details"
echo "   • Click to zoom in, double-click to reset"
echo "   • Download graph data for further analysis"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
