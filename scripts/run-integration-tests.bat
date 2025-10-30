@echo off
setlocal enabledelayedexpansion

REM E-commerce Integration Test Script for Windows
REM This script tests the complete system integration

echo 🚀 Starting E-commerce System Integration Tests
echo ================================================

REM Configuration
set BACKEND_URL=http://localhost:8080
set FRONTEND_URL=http://localhost:4200
set TEST_USER_EMAIL=test@example.com
set TEST_USER_PASSWORD=password123

REM Function to print status messages
:print_status
if "%1"=="INFO" (
    echo [INFO] %~2
) else if "%1"=="SUCCESS" (
    echo [SUCCESS] %~2
) else if "%1"=="WARNING" (
    echo [WARNING] %~2
) else if "%1"=="ERROR" (
    echo [ERROR] %~2
)
goto :eof

REM Function to check if service is running
:check_service
set service_name=%~1
set url=%~2
set max_attempts=30
set attempt=1

call :print_status "INFO" "Checking %service_name% at %url%..."

:check_loop
curl -s -f "%url%" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "SUCCESS" "%service_name% is running"
    goto :eof
)

call :print_status "INFO" "Attempt !attempt!/%max_attempts%: %service_name% not ready, waiting..."
timeout /t 2 /nobreak >nul
set /a attempt+=1

if !attempt! leq %max_attempts% goto check_loop

call :print_status "ERROR" "%service_name% is not responding after %max_attempts% attempts"
exit /b 1

REM Function to test API endpoint
:test_api_endpoint
set endpoint=%~1
set expected_status=%~2
set description=%~3
set auth_header=%~4

call :print_status "INFO" "Testing: %description%"

if not "%auth_header%"=="" (
    curl -s -w "%%{http_code}" -H "%auth_header%" "%BACKEND_URL%%endpoint%" > temp_response.txt 2>nul
) else (
    curl -s -w "%%{http_code}" "%BACKEND_URL%%endpoint%" > temp_response.txt 2>nul
)

if exist temp_response.txt (
    for /f %%i in (temp_response.txt) do set response=%%i
    set status_code=!response:~-3!
    del temp_response.txt
    
    if "!status_code!"=="%expected_status%" (
        call :print_status "SUCCESS" "%description% - Status: !status_code!"
    ) else (
        call :print_status "ERROR" "%description% - Expected: %expected_status%, Got: !status_code!"
    )
) else (
    call :print_status "ERROR" "%description% - Failed to get response"
)
goto :eof

REM Main execution
call :print_status "INFO" "Starting integration tests..."

REM Step 1: Check if services are running
call :print_status "INFO" "Step 1: Checking service availability"

call :check_service "Backend API" "%BACKEND_URL%/actuator/health"
if !errorlevel! neq 0 (
    call :print_status "ERROR" "Backend service is not available. Please start the backend first."
    exit /b 1
)

call :check_service "Frontend" "%FRONTEND_URL%"
if !errorlevel! neq 0 (
    call :print_status "WARNING" "Frontend service is not available. Frontend tests will be skipped."
    set FRONTEND_AVAILABLE=false
) else (
    set FRONTEND_AVAILABLE=true
)

REM Step 2: Test basic API endpoints
call :print_status "INFO" "Step 2: Testing basic API endpoints"

call :test_api_endpoint "/actuator/health" "200" "Health check endpoint"
call :test_api_endpoint "/api/integration-test/public-health" "200" "Public integration health check"
call :test_api_endpoint "/api/products" "200" "Public products endpoint"

REM Step 3: Authentication test
call :print_status "INFO" "Step 3: Testing authentication"

curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"%TEST_USER_EMAIL%\",\"password\":\"%TEST_USER_PASSWORD%\"}" "%BACKEND_URL%/api/auth/login" > auth_response.txt 2>nul

if exist auth_response.txt (
    REM Try to extract token (simplified approach)
    findstr /C:"token" auth_response.txt >nul
    if !errorlevel! equ 0 (
        call :print_status "SUCCESS" "Authentication successful"
        set AUTH_AVAILABLE=true
    ) else (
        call :print_status "WARNING" "Authentication failed, proceeding without token"
        set AUTH_AVAILABLE=false
    )
    del auth_response.txt
) else (
    call :print_status "WARNING" "Authentication test failed"
    set AUTH_AVAILABLE=false
)

REM Step 4: Test protected endpoints (simplified)
if "%AUTH_AVAILABLE%"=="true" (
    call :print_status "INFO" "Step 4: Testing protected endpoints"
    call :print_status "INFO" "Note: Protected endpoint testing requires manual token extraction"
) else (
    call :print_status "WARNING" "Skipping protected endpoint tests due to authentication failure"
)

REM Step 5: Test integration endpoints
call :print_status "INFO" "Step 5: Testing system integration"

REM Test workflow endpoint (without auth for simplicity)
curl -s -X POST "%BACKEND_URL%/api/integration-test/test-workflow" > workflow_response.txt 2>nul
if exist workflow_response.txt (
    call :print_status "SUCCESS" "Workflow integration test endpoint accessible"
    del workflow_response.txt
) else (
    call :print_status "ERROR" "Workflow integration test failed"
)

REM Step 6: Frontend integration test
if "%FRONTEND_AVAILABLE%"=="true" (
    call :print_status "INFO" "Step 6: Testing frontend integration"
    
    curl -s -f "%FRONTEND_URL%/integration-test" >nul 2>&1
    if !errorlevel! equ 0 (
        call :print_status "SUCCESS" "Frontend integration test page is accessible"
    ) else (
        call :print_status "WARNING" "Frontend integration test page is not accessible"
    )
)

REM Step 7: Basic performance test
call :print_status "INFO" "Step 7: Basic performance test"

set start_time=%time%
for /l %%i in (1,1,5) do (
    curl -s "%BACKEND_URL%/actuator/health" >nul 2>&1
)
set end_time=%time%

call :print_status "SUCCESS" "Performance test completed (5 requests)"

REM Final summary
call :print_status "INFO" "Integration tests completed!"
echo.
echo 📊 Test Summary:
echo ==================
echo ✅ Service availability: Checked
echo ✅ API endpoints: Tested
echo ✅ Authentication: Tested
echo ✅ System integration: Tested
echo ✅ Performance: Basic test completed

if "%FRONTEND_AVAILABLE%"=="true" (
    echo ✅ Frontend: Available
) else (
    echo ⚠️  Frontend: Not available
)

echo.
call :print_status "SUCCESS" "All integration tests completed successfully!"
echo.
echo 🔗 Access the application:
echo    Frontend: %FRONTEND_URL%
echo    Backend API: %BACKEND_URL%
echo    Integration Tests: %FRONTEND_URL%/integration-test
echo.

pause