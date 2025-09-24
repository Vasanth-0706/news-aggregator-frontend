@echo off
REM Integration Test Runner for News Aggregator Frontend (Windows)
REM This script runs all integration tests and generates a report

echo Starting News Aggregator Frontend Integration Tests...
echo =====================================================

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)

REM Run integration tests
echo Running integration tests...
npm run test:run src/test/integration/

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo ✅ All integration tests passed!
) else (
    echo ❌ Some integration tests failed!
    exit /b 1
)

echo Integration test execution completed.
pause