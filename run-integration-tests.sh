#!/bin/bash

# Integration Test Runner for News Aggregator Frontend
# This script runs all integration tests and generates a report

echo "Starting News Aggregator Frontend Integration Tests..."
echo "====================================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Run integration tests
echo "Running integration tests..."
npm run test:run src/test/integration/

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All integration tests passed!"
else
    echo "❌ Some integration tests failed!"
    exit 1
fi

echo "Integration test execution completed."