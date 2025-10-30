# E-commerce System Integration Testing Guide

This document provides comprehensive guidance for testing the complete integration of all system components in the e-commerce platform.

## Overview

The integration testing suite verifies that all components work together seamlessly:
- Frontend Angular application
- Backend Spring Boot services
- Database connectivity
- Real-time features (WebSocket/SSE)
- Authentication and authorization
- Complete user workflows

## Quick Start

### Automated Testing

#### Using Shell Script (Linux/macOS)
```bash
# Make script executable
chmod +x scripts/run-integration-tests.sh

# Run integration tests
./scripts/run-integration-tests.sh
```

#### Using Batch Script (Windows)
```cmd
# Run integration tests
scripts\run-integration-tests.bat
```

### Manual Testing

#### 1. Start All Services
```bash
# Start backend services
cd backend
mvn spring-boot:run

# Start frontend (in another terminal)
cd frontend
npm start

# Start database (if using Docker)
docker-compose up mysql redis
```

#### 2. Access Integration Test Page
Navigate to: `http://localhost:4200/integration-test`

## Test Categories

### 1. Service Availability Tests
- ✅ Backend API health check
- ✅ Frontend application accessibility
- ✅ Database connectivity
- ✅ Redis cache connectivity

### 2. Authentication & Authorization Tests
- ✅ User login/logout functionality
- ✅ JWT token generation and validation
- ✅ Role-based access control
- ✅ Protected route access

### 3. Core Functionality Tests
- ✅ Product catalog loading
- ✅ Product search and filtering
- ✅ Shopping cart operations
- ✅ Order creation and management
- ✅ User profile management

### 4. Real-time Features Tests
- ✅ WebSocket connection establishment
- ✅ Server-Sent Events (SSE) functionality
- ✅ Real-time cart synchronization
- ✅ Live notifications
- ✅ Inventory updates

### 5. Admin Features Tests
- ✅ Admin dashboard access
- ✅ Product management
- ✅ Order management
- ✅ User management
- ✅ System configuration

### 6. End-to-End Workflow Tests
- ✅ Complete customer journey (browse → cart → checkout → order)
- ✅ Admin workflow (manage products → process orders)
- ✅ Real-time updates during workflows
- ✅ Error handling and recovery

## Integration Test Endpoints

### Backend Test Endpoints

#### Health Check
```http
GET /api/integration-test/health-check
Authorization: Bearer <token>
```

#### Complete Workflow Test
```http
POST /api/integration-test/test-workflow
Authorization: Bearer <token>
```

#### Real-time Features Test
```http
POST /api/integration-test/test-realtime
Authorization: Bearer <token>
```

#### Database Connectivity Test
```http
GET /api/integration-test/test-database
Authorization: Bearer <token>
```

#### Performance Test
```http
POST /api/integration-test/test-performance
Authorization: Bearer <token>
```

### Frontend Test Components

#### Integration Test Component
- Location: `/integration-test`
- Features: Automated test execution, real-time results, progress tracking

## Test Scenarios

### Scenario 1: New Customer Journey
1. **Registration**: Create new customer account
2. **Browse Products**: View product catalog
3. **Search**: Find specific products
4. **Add to Cart**: Select products and quantities
5. **Checkout**: Complete order process
6. **Track Order**: Monitor order status
7. **Real-time Updates**: Receive notifications

### Scenario 2: Returning Customer Journey
1. **Login**: Authenticate existing user
2. **Restore Cart**: Load saved cart items
3. **Update Cart**: Modify quantities/items
4. **Quick Checkout**: Use saved payment/shipping info
5. **Order History**: View previous orders
6. **Reorder**: Repeat previous purchases

### Scenario 3: Admin Management Workflow
1. **Admin Login**: Access admin dashboard
2. **Product Management**: Add/edit/remove products
3. **Inventory Management**: Update stock levels
4. **Order Processing**: Manage customer orders
5. **User Management**: Handle customer accounts
6. **System Monitoring**: View analytics and reports

### Scenario 4: Real-time Features
1. **Multi-device Cart Sync**: Cart updates across devices
2. **Inventory Alerts**: Low stock notifications
3. **Order Updates**: Status change notifications
4. **System Notifications**: Maintenance/promotional messages

## Performance Benchmarks

### Response Time Targets
- API endpoints: < 500ms
- Page load times: < 2s
- Real-time updates: < 100ms
- Database queries: < 200ms

### Concurrent User Targets
- Simultaneous users: 100+
- Cart operations: 50+ concurrent
- Real-time connections: 200+

## Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check Java version
java -version

# Check Maven dependencies
mvn dependency:resolve

# Check database connection
mysql -u root -p -h localhost
```

#### Frontend Not Loading
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
```bash
# Check MySQL service
systemctl status mysql

# Check Redis service
redis-cli ping

# Verify database schemas
mysql -u root -p -e "SHOW DATABASES;"
```

#### Real-time Features Not Working
```bash
# Check WebSocket connection
# Browser DevTools → Network → WS tab

# Check SSE connection
# Browser DevTools → Network → EventSource

# Verify CORS settings
curl -H "Origin: http://localhost:4200" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8080/api/notifications/stream
```

### Debug Mode

#### Enable Debug Logging
```yaml
# application.yml
logging:
  level:
    com.ecommerce: DEBUG
    org.springframework.web: DEBUG
    org.springframework.security: DEBUG
```

#### Frontend Debug Mode
```typescript
// environment.ts
export const environment = {
  production: false,
  debug: true,
  apiUrl: 'http://localhost:8080/api'
};
```

## Test Data Setup

### Sample Users
```sql
-- Customer user
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('customer@test.com', '$2a$10$...', 'Test', 'Customer', 'CUSTOMER');

-- Admin user
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@test.com', '$2a$10$...', 'Test', 'Admin', 'ADMIN');
```

### Sample Products
```sql
-- Sample category
INSERT INTO categories (name, description) 
VALUES ('Electronics', 'Electronic devices and accessories');

-- Sample products
INSERT INTO products (sku, name, description, price, category_id) 
VALUES 
('LAPTOP001', 'Test Laptop', 'High-performance laptop', 999.99, 1),
('PHONE001', 'Test Phone', 'Latest smartphone', 699.99, 1);

-- Sample inventory
INSERT INTO product_inventory (product_id, quantity_available) 
VALUES (1, 50), (2, 100);
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Integration Tests
on: [push, pull_request]
jobs:
  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Start services
        run: docker-compose up -d
      - name: Run integration tests
        run: ./scripts/run-integration-tests.sh
```

## Monitoring and Alerts

### Health Check Endpoints
- Backend: `http://localhost:8080/actuator/health`
- Database: Connection pool metrics
- Cache: Redis info command
- Real-time: Connection count metrics

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Resource utilization
- User session analytics

## Best Practices

### Test Environment
1. Use dedicated test database
2. Reset data between test runs
3. Mock external services
4. Use test-specific configuration

### Test Execution
1. Run tests in isolated environment
2. Execute tests in parallel when possible
3. Implement proper cleanup
4. Log detailed test results

### Maintenance
1. Update tests with new features
2. Review and optimize slow tests
3. Monitor test reliability
4. Document test changes

## Support

For issues with integration testing:
1. Check the troubleshooting section
2. Review application logs
3. Verify service configurations
4. Test individual components first

## End-to-End Workflow Testing

### Complete User Journey Testing

The integration test suite now includes comprehensive end-to-end workflow testing that covers:

#### Customer Journey Workflow
1. **Product Browsing**: Test product catalog loading and navigation
2. **Product Search**: Verify search functionality and filtering
3. **Shopping Cart**: Test cart operations (add, remove, update)
4. **Real-time Updates**: Verify live cart synchronization and notifications
5. **Order Process**: Test checkout flow and order creation
6. **Order Tracking**: Verify order status updates and history

#### Admin Management Workflow
1. **Dashboard Access**: Test admin dashboard functionality
2. **Product Management**: Verify CRUD operations for products
3. **Order Management**: Test order processing and status updates
4. **Inventory Monitoring**: Verify stock level tracking and alerts
5. **User Management**: Test user account administration
6. **System Configuration**: Verify system settings management

#### System Integration Workflow
1. **Backend Connectivity**: Test API endpoint availability
2. **Database Operations**: Verify data persistence and retrieval
3. **Real-time Communication**: Test WebSocket and SSE functionality
4. **Cross-Component Integration**: Verify component interaction
5. **Performance Validation**: Test system performance under load

### Integration Test Components

#### Backend Integration Controller
- **Location**: `backend/main-application/src/main/java/com/ecommerce/main/controller/IntegrationTestController.java`
- **Features**:
  - Comprehensive health checks for all services
  - Complete workflow testing endpoints
  - Customer journey simulation
  - Admin workflow validation
  - Real-time feature testing
  - Performance benchmarking
  - Public health check endpoint (no authentication required)

#### Frontend Integration Components
- **Main Component**: `frontend/src/app/integration-test.component.ts`
- **Simple Component**: `frontend/src/app/integration-test-simple.component.ts`
- **Workflow Service**: `frontend/src/app/shared/services/e2e-workflow.service.ts`
- **Test Runner**: `frontend/src/app/shared/components/workflow-test-runner/workflow-test-runner.component.ts`

#### Features
- **Tabbed Interface**: Separate tabs for workflow tests, component tests, and results
- **Real-time Progress**: Live progress tracking during test execution
- **Detailed Results**: Comprehensive test results with timing and error details
- **Export Functionality**: Export test results for analysis
- **Visual Indicators**: Color-coded status indicators for test results

### Test Execution Methods

#### Automated Scripts
- **Linux/macOS**: `./scripts/run-integration-tests.sh`
- **Windows**: `scripts\run-integration-tests.bat`

#### Manual Testing
- **Frontend Interface**: Navigate to `http://localhost:4200/integration-test`
- **API Endpoints**: Direct API calls to integration test endpoints

#### Continuous Integration
- GitHub Actions workflow for automated testing
- Docker-based test environment setup
- Automated test result reporting

### Test Coverage

#### Core Functionality
- ✅ User authentication and authorization
- ✅ Product catalog management
- ✅ Shopping cart operations
- ✅ Order processing workflow
- ✅ Real-time notifications
- ✅ Admin dashboard functionality

#### System Integration
- ✅ Frontend-backend communication
- ✅ Database connectivity and operations
- ✅ Real-time features (WebSocket/SSE)
- ✅ Cross-component data flow
- ✅ Error handling and recovery

#### Performance Testing
- ✅ Response time validation
- ✅ Concurrent user simulation
- ✅ Database query optimization
- ✅ Real-time connection stability

### Monitoring and Alerts

#### Health Check Endpoints
- **Authenticated**: `/api/integration-test/health-check`
- **Public**: `/api/integration-test/public-health`
- **Actuator**: `/actuator/health`

#### Key Metrics
- API response times
- Database query performance
- Real-time connection stability
- Error rates and patterns
- User workflow completion rates

## Conclusion

This comprehensive integration testing suite ensures that all components of the e-commerce system work together seamlessly. The end-to-end workflow testing validates complete user journeys from browsing to purchase, while the system integration tests verify that all technical components interact correctly.

Key benefits:
- **Early Issue Detection**: Catch integration problems before production
- **Workflow Validation**: Ensure complete user journeys work end-to-end
- **Performance Monitoring**: Track system performance under various loads
- **Automated Testing**: Continuous validation through automated test execution
- **Comprehensive Coverage**: Test all critical system components and interactions

Regular execution of these tests helps maintain system reliability, ensures feature completeness, and provides confidence in system deployments.