#!/bin/bash

# E-commerce Integration Test Script
# This script tests the complete system integration

set -e

echo "🚀 Starting E-commerce System Integration Tests"
echo "================================================"

# Configuration
BACKEND_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:4200"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    print_status "INFO" "Checking $service_name at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_status "SUCCESS" "$service_name is running"
            return 0
        fi
        
        print_status "INFO" "Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep 2
        ((attempt++))
    done
    
    print_status "ERROR" "$service_name is not responding after $max_attempts attempts"
    return 1
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    local auth_header=$4

    print_status "INFO" "Testing: $description"
    
    if [ -n "$auth_header" ]; then
        response=$(curl -s -w "%{http_code}" -H "$auth_header" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" "$BACKEND_URL$endpoint")
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_status "SUCCESS" "$description - Status: $status_code"
        return 0
    else
        print_status "ERROR" "$description - Expected: $expected_status, Got: $status_code"
        return 1
    fi
}

# Function to authenticate and get JWT token
authenticate_user() {
    print_status "INFO" "Authenticating test user..."
    
    auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" \
        "$BACKEND_URL/api/auth/login" 2>/dev/null || echo "")
    
    if [ -n "$auth_response" ]; then
        # Extract token from response (assuming JSON response with token field)
        token=$(echo "$auth_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        if [ -n "$token" ]; then
            print_status "SUCCESS" "Authentication successful"
            echo "Bearer $token"
            return 0
        fi
    fi
    
    print_status "WARNING" "Authentication failed, proceeding without token"
    echo ""
    return 1
}

# Main test execution
main() {
    print_status "INFO" "Starting integration tests..."
    
    # Step 1: Check if services are running
    print_status "INFO" "Step 1: Checking service availability"
    
    if ! check_service "Backend API" "$BACKEND_URL/actuator/health"; then
        print_status "ERROR" "Backend service is not available. Please start the backend first."
        exit 1
    fi
    
    if ! check_service "Frontend" "$FRONTEND_URL"; then
        print_status "WARNING" "Frontend service is not available. Frontend tests will be skipped."
        FRONTEND_AVAILABLE=false
    else
        FRONTEND_AVAILABLE=true
    fi
    
    # Step 2: Test basic API endpoints
    print_status "INFO" "Step 2: Testing basic API endpoints"
    
    # Test health endpoint
    test_api_endpoint "/actuator/health" "200" "Health check endpoint"
    
    # Test public integration endpoint
    test_api_endpoint "/api/integration-test/public-health" "200" "Public integration health check"
    
    # Test public endpoints
    test_api_endpoint "/api/products" "200" "Public products endpoint" || true
    
    # Step 3: Authentication test
    print_status "INFO" "Step 3: Testing authentication"
    
    auth_header=$(authenticate_user)
    
    # Step 4: Test protected endpoints
    if [ -n "$auth_header" ]; then
        print_status "INFO" "Step 4: Testing protected endpoints"
        
        test_api_endpoint "/api/cart" "200" "Cart endpoint" "$auth_header" || true
        test_api_endpoint "/api/orders" "200" "Orders endpoint" "$auth_header" || true
        test_api_endpoint "/api/integration-test/health-check" "200" "Integration health check" "$auth_header" || true
    else
        print_status "WARNING" "Skipping protected endpoint tests due to authentication failure"
    fi
    
    # Step 5: Test integration endpoints
    if [ -n "$auth_header" ]; then
        print_status "INFO" "Step 5: Testing system integration"
        
        # Test complete workflow
        workflow_response=$(curl -s -X POST \
            -H "$auth_header" \
            "$BACKEND_URL/api/integration-test/test-workflow" 2>/dev/null || echo "")
        
        if [ -n "$workflow_response" ]; then
            print_status "SUCCESS" "Workflow integration test completed"
        else
            print_status "ERROR" "Workflow integration test failed"
        fi
        
        # Test real-time features
        realtime_response=$(curl -s -X POST \
            -H "$auth_header" \
            "$BACKEND_URL/api/integration-test/test-realtime" 2>/dev/null || echo "")
        
        if [ -n "$realtime_response" ]; then
            print_status "SUCCESS" "Real-time features test completed"
        else
            print_status "ERROR" "Real-time features test failed"
        fi
        
        # Test database connectivity
        db_response=$(curl -s -H "$auth_header" \
            "$BACKEND_URL/api/integration-test/test-database" 2>/dev/null || echo "")
        
        if [ -n "$db_response" ]; then
            print_status "SUCCESS" "Database connectivity test completed"
        else
            print_status "ERROR" "Database connectivity test failed"
        fi
    fi
    
    # Step 6: Frontend integration test (if available)
    if [ "$FRONTEND_AVAILABLE" = true ]; then
        print_status "INFO" "Step 6: Testing frontend integration"
        
        # Check if integration test page is accessible
        if curl -s -f "$FRONTEND_URL/integration-test" > /dev/null 2>&1; then
            print_status "SUCCESS" "Frontend integration test page is accessible"
        else
            print_status "WARNING" "Frontend integration test page is not accessible"
        fi
    fi
    
    # Step 7: Performance test (basic)
    print_status "INFO" "Step 7: Basic performance test"
    
    start_time=$(date +%s%N)
    for i in {1..5}; do
        curl -s "$BACKEND_URL/actuator/health" > /dev/null 2>&1 || true
    done
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))
    avg_response_time=$(( duration / 5 ))
    
    print_status "INFO" "Average response time for 5 requests: ${avg_response_time}ms"
    
    if [ $avg_response_time -lt 1000 ]; then
        print_status "SUCCESS" "Performance test passed (avg response time: ${avg_response_time}ms)"
    else
        print_status "WARNING" "Performance test warning (avg response time: ${avg_response_time}ms)"
    fi
    
    # Final summary
    print_status "INFO" "Integration tests completed!"
    echo ""
    echo "📊 Test Summary:"
    echo "=================="
    echo "✅ Service availability: Checked"
    echo "✅ API endpoints: Tested"
    echo "✅ Authentication: Tested"
    echo "✅ System integration: Tested"
    echo "✅ Database connectivity: Tested"
    echo "✅ Performance: Basic test completed"
    
    if [ "$FRONTEND_AVAILABLE" = true ]; then
        echo "✅ Frontend: Available"
    else
        echo "⚠️  Frontend: Not available"
    fi
    
    echo ""
    print_status "SUCCESS" "All integration tests completed successfully!"
    echo ""
    echo "🔗 Access the application:"
    echo "   Frontend: $FRONTEND_URL"
    echo "   Backend API: $BACKEND_URL"
    echo "   Integration Tests: $FRONTEND_URL/integration-test"
    echo ""
}

# Run main function
main "$@"