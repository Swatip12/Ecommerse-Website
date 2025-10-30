# Inventory Management System

This document describes the inventory management system implemented for the ecommerce product service.

## Overview

The inventory management system provides comprehensive stock management capabilities including:
- Real-time inventory tracking
- Stock reservation for order processing
- Low stock alerts for administrators
- Inventory validation for product availability

## Components

### 1. ProductInventory Entity
- Tracks available and reserved quantities for each product
- Maintains reorder levels for low stock alerts
- Provides helper methods for stock operations

### 2. InventoryService
Core service providing inventory management operations:
- **Stock Management**: Add, remove, and update inventory quantities
- **Reservation System**: Reserve quantities for order processing
- **Validation**: Check product availability before purchase
- **Statistics**: Get inventory metrics and summaries

### 3. LowStockAlertService
Automated alert system for inventory monitoring:
- **Scheduled Checks**: Runs hourly to identify low stock products
- **Alert Generation**: Creates alerts for products below reorder levels
- **Categorized Alerts**: Filter alerts by category or brand
- **Statistics**: Provides alert summary metrics

### 4. REST API Endpoints

#### Inventory Management (`/api/inventory`)
- `GET /product/{productId}` - Get inventory information
- `PUT /product/{productId}/quantity` - Update inventory quantity (Admin)
- `POST /product/{productId}/add-stock` - Add stock (Admin)
- `POST /product/{productId}/remove-stock` - Remove stock (Admin)
- `POST /product/{productId}/reserve` - Reserve quantity for orders
- `POST /product/{productId}/release` - Release reserved quantity
- `POST /product/{productId}/confirm` - Confirm reserved quantity
- `PUT /product/{productId}/reorder-level` - Update reorder level (Admin)
- `GET /product/{productId}/availability` - Check quantity availability
- `POST /product/{productId}/validate` - Validate product availability

#### Low Stock Management
- `GET /low-stock` - Get all low stock products (Admin)
- `GET /low-stock/paginated` - Get paginated low stock products (Admin)
- `GET /out-of-stock` - Get all out of stock products (Admin)
- `GET /low-stock/category/{categoryId}` - Get low stock by category (Admin)
- `GET /low-stock/brand/{brand}` - Get low stock by brand (Admin)
- `GET /statistics` - Get inventory statistics (Admin)

#### Alert System (`/api/alerts`)
- `GET /low-stock` - Get current low stock alerts (Admin)
- `GET /out-of-stock` - Get current out of stock alerts (Admin)
- `GET /low-stock/category/{categoryId}` - Get alerts by category (Admin)
- `GET /low-stock/brand/{brand}` - Get alerts by brand (Admin)
- `GET /summary` - Get alert summary statistics (Admin)
- `POST /check` - Manually trigger alert check (Admin)

## Key Features

### 1. Stock Reservation System
The system supports a three-phase stock management process:
1. **Reserve**: Lock quantity for pending orders
2. **Release**: Return reserved quantity to available stock (order cancelled)
3. **Confirm**: Remove reserved quantity permanently (order completed)

### 2. Automated Low Stock Alerts
- Runs every hour using Spring's `@Scheduled` annotation
- Compares available quantity against configurable reorder levels
- Logs alerts and provides API endpoints for admin dashboard integration

### 3. Inventory Validation
- Validates product availability before allowing purchases
- Checks product active status and stock levels
- Prevents overselling by validating requested quantities

### 4. Real-time Inventory Updates
- All inventory changes are immediately reflected in the database
- Supports concurrent access with proper transaction management
- Provides real-time availability checking for frontend integration

## Usage Examples

### Check Product Availability
```http
GET /api/inventory/product/123/availability?quantity=5
```

### Reserve Stock for Order
```http
POST /api/inventory/product/123/reserve
Content-Type: application/json

{
  "quantity": 3,
  "reason": "Order #ORD-001"
}
```

### Get Low Stock Alerts
```http
GET /api/alerts/low-stock
```

### Update Inventory (Admin)
```http
PUT /api/inventory/product/123/quantity
Content-Type: application/json

{
  "quantity": 100
}
```

## Integration Points

### With Order Service
- Reserve quantities when orders are created
- Confirm reservations when orders are completed
- Release reservations when orders are cancelled

### With Product Service
- Validate availability during product searches
- Display stock status in product listings
- Integrate inventory data in product responses

### With Admin Dashboard
- Display low stock alerts
- Provide inventory management interface
- Show inventory statistics and reports

## Configuration

### Scheduling
The low stock alert system uses Spring's scheduling capabilities:
- `@EnableScheduling` in main application class
- `@Scheduled(fixedRate = 3600000)` for hourly checks
- `@Async` for non-blocking alert processing

### Security
- Admin-only endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
- Public endpoints for availability checking
- Internal endpoints for order service integration

## Error Handling

The system provides comprehensive error handling:
- Validation errors for negative quantities
- Not found errors for missing products/inventory
- Business logic errors for insufficient stock
- Detailed error messages for API consumers

## Testing

Unit tests are provided for core inventory operations:
- Stock management operations
- Reservation system functionality
- Validation logic
- Error handling scenarios

The test suite uses Mockito for dependency mocking and JUnit 5 for test execution.