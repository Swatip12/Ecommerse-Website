package com.ecommerce.order.controller;

import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.order.service.AdminOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminOrderController {
    
    private final OrderService orderService;
    private final AdminOrderService adminOrderService;
    
    @Autowired
    public AdminOrderController(OrderService orderService, AdminOrderService adminOrderService) {
        this.orderService = orderService;
        this.adminOrderService = adminOrderService;
    }
    
    /**
     * Get all orders with filtering and pagination
     */
    @GetMapping
    public ResponseEntity<Page<OrderDto>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Page<OrderDto> orders = adminOrderService.getAllOrdersWithFilters(
                page, size, status, orderNumber, userId, startDate, endDate);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order by ID (admin view with full details)
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        Optional<OrderDto> order = orderService.getOrderById(orderId);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update order status
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        
        try {
            OrderDto updatedOrder = adminOrderService.updateOrderStatus(orderId, request);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Process order fulfillment
     */
    @PutMapping("/{orderId}/fulfill")
    public ResponseEntity<OrderDto> fulfillOrder(
            @PathVariable Long orderId,
            @RequestBody FulfillOrderRequest request) {
        
        try {
            OrderDto fulfilledOrder = adminOrderService.fulfillOrder(orderId, request);
            return ResponseEntity.ok(fulfilledOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Process order shipment
     */
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<OrderDto> shipOrder(
            @PathVariable Long orderId,
            @RequestBody ShipOrderRequest request) {
        
        try {
            OrderDto shippedOrder = adminOrderService.shipOrder(orderId, request);
            return ResponseEntity.ok(shippedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Process order refund
     */
    @PutMapping("/{orderId}/refund")
    public ResponseEntity<OrderDto> refundOrder(
            @PathVariable Long orderId,
            @RequestBody RefundOrderRequest request) {
        
        try {
            OrderDto refundedOrder = adminOrderService.refundOrder(orderId, request);
            return ResponseEntity.ok(refundedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Cancel order
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody CancelOrderRequest request) {
        
        try {
            OrderDto cancelledOrder = adminOrderService.cancelOrder(orderId, request);
            return ResponseEntity.ok(cancelledOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get orders requiring attention
     */
    @GetMapping("/requiring-attention")
    public ResponseEntity<List<OrderDto>> getOrdersRequiringAttention() {
        List<OrderDto> orders = adminOrderService.getOrdersRequiringAttention();
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get orders by status
     */
    @GetMapping("/by-status")
    public ResponseEntity<Page<OrderDto>> getOrdersByStatus(
            @RequestParam OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<OrderDto> orders = orderService.getOrdersByStatus(status, page, size);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<OrderStatisticsDto> getOrderStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        OrderStatisticsDto statistics = adminOrderService.getOrderStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get sales report
     */
    @GetMapping("/sales-report")
    public ResponseEntity<SalesReportDto> getSalesReport(
            @RequestParam String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        SalesReportDto salesReport = adminOrderService.getSalesReport(period, startDate, endDate);
        return ResponseEntity.ok(salesReport);
    }
    
    /**
     * Export dashboard data
     */
    @GetMapping("/export-dashboard")
    public ResponseEntity<byte[]> exportDashboardData(
            @RequestParam String format,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            byte[] data = adminOrderService.exportDashboardData(format, startDate, endDate);
            String contentType = format.equals("excel") ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv";
            String filename = "dashboard-report." + (format.equals("excel") ? "xlsx" : "csv");
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Export orders to CSV
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            byte[] csvData = adminOrderService.exportOrdersToCSV(status, startDate, endDate);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=orders.csv")
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}