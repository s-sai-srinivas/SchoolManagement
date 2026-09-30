#!/bin/bash

# Script to run Playwright tests for Teacher Role
# Make sure backend is running on port 3001 and frontend on port 3000

echo "🧪 Running Playwright tests for Teacher Role..."
echo ""
echo "Prerequisites:"
echo "  - Backend server running on port 3001"
echo "  - Frontend dev server running on port 3000"
echo "  - Test data seeded in database"
echo ""

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend server not running on port 3000"
    echo "   Please start it with: npm run dev"
    exit 1
fi

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "⚠️  Backend server might not be running on port 3001"
    echo "   Tests may fail if backend is not accessible"
fi

echo "✅ Starting tests..."
echo ""

# Run tests
npx playwright test teacher-role.spec.ts "$@"

echo ""
echo "📊 Test report generated. View with: npx playwright show-report"

