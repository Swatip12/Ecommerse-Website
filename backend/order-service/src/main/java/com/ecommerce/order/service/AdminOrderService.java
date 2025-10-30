package com.ecommerce.order.service;

import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.*;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminOrderService {
    
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderService orderService;
    
    @Autowired
    public AdminOrderService(OrderRepository orderRepository, 
                           OrderStatusHistoryRepository orderStatusHistoryRepository,
                           OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.orderService = orderService;
    }
    
    /**
     * Get all orders with filtering and pagination
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrdersWithFilters(int page, int size, OrderStatus status, 
                                                 String orderNumber, Long userId, 
                                                 String startDate, String endDate) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        LocalDateTime start = startDate != null ? 
                LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? 
                LocalDateTime.parse(endDate + "T23:59:59") : null;
        
        Page<Order> orders;
        
        if (status != null || orderNumber != null || userId != null || start != null || end != null) {
            orders = orderRepository.findOrdersWithFilters(status, orderNumber, userId, start, end, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }
        
        return orders.map(this::convertToDto);
    }
    
    /**
     * Update order status (admin version with additional validation)
     */
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        OrderStatus previousStatus = order.getStatus();
        
        // Admin can perform more status transitions than regular users
        if (!isValidAdminStatusTransition(previousStatus, request.getNewStatus())) {
            throw new RuntimeException("Invalid admin status transition from " + previousStatus + " to " + request.getNewStatus());
        }
        
        order.setStatus(request.getNewStatus());
        order = orderRepository.save(order);
        
        // Create status history entry
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, 
                previousStatus != null ? previousStatus.name() : null,
                request.getNewStatus().name(),
                null, // Admin user ID would be set from security context
                request.getNotes()
        );
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Fulfill order
     */
    public OrderDto fulfillOrder(Long orderId, FulfillOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order must be confirmed before fulfillment");
        }
        
        order.setStatus(OrderStatus.PROCESSING);
        order = orderRepository.save(order);
        
        // Create status history entry
        String notes = "Order fulfilled. " + 
                      (request.getWarehouseLocation() != null ? "Warehouse: " + request.getWarehouseLocation() + ". " : "") +
                      (request.getFulfillmentMethod() != null ? "Method: " + request.getFulfillmentMethod() + ". " : "") +
                      (request.getNotes() != null ? request.getNotes() : "");
        
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, OrderStatus.CONFIRMED.name(), OrderStatus.PROCESSING.name(),
                null, notes
        );
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Ship order
     */
    public OrderDto shipOrder(Long orderId, ShipOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new RuntimeException("Order must be processing before shipping");
        }
        
        order.setStatus(OrderStatus.SHIPPED);
        order = orderRepository.save(order);
        
        // Create status history entry
        String notes = "Order shipped. " +
                      (request.getCarrier() != null ? "Carrier: " + request.getCarrier() + ". " : "") +
                      (request.getTrackingNumber() != null ? "Tracking: " + request.getTrackingNumber() + ". " : "") +
                      (request.getShippingMethod() != null ? "Method: " + request.getShippingMethod() + ". " : "") +
                      (request.getNotes() != null ? request.getNotes() : "");
        
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, OrderStatus.PROCESSING.name(), OrderStatus.SHIPPED.name(),
                null, notes
        );
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Refund order
     */
    public OrderDto refundOrder(Long orderId, RefundOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.CANCELLED) {
            throw new RuntimeException("Order must be delivered or cancelled before refund");
        }
        
        if (request.getRefundAmount().compareTo(order.getTotalAmount()) > 0) {
            throw new RuntimeException("Refund amount cannot exceed order total");
        }
        
        order.setStatus(OrderStatus.REFUNDED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        order = orderRepository.save(order);
        
        // Create status history entry
        String notes = "Order refunded. Amount: $" + request.getRefundAmount() + ". " +
                      (request.getReason() != null ? "Reason: " + request.getReason() + ". " : "") +
                      (request.getRefundMethod() != null ? "Method: " + request.getRefundMethod() + ". " : "") +
                      (request.getNotes() != null ? request.getNotes() : "");
        
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, order.getStatus().name(), OrderStatus.REFUNDED.name(),
                null, notes
        );
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Cancel order (admin version)
     */
    public OrderDto cancelOrder(Long orderId, CancelOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.REFUNDED) {
            throw new RuntimeException("Cannot cancel delivered or refunded orders");
        }
        
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        
        if (request.isRefundPayment() && order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        order = orderRepository.save(order);
        
        // Create status history entry
        String notes = "Order cancelled by admin. " +
                      (request.getReason() != null ? "Reason: " + request.getReason() + ". " : "") +
                      (request.isRefundPayment() ? "Payment refunded. " : "") +
                      (request.getNotes() != null ? request.getNotes() : "");
        
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, previousStatus.name(), OrderStatus.CANCELLED.name(),
                null, notes
        );
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Get orders requiring attention
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersRequiringAttention() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        return orderRepository.findOrdersRequiringAttention(cutoffTime)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get order statistics
     */
    @Transactional(readOnly = true)
    public OrderStatisticsDto getOrderStatistics(String startDate, String endDate) {
        LocalDateTime start = startDate != null ? 
                LocalDateTime.parse(startDate + "T00:00:00") : LocalDateTime.now().minusDays(30);
        LocalDateTime end = endDate != null ? 
                LocalDateTime.parse(endDate + "T23:59:59") : LocalDateTime.now();
        
        OrderStatisticsDto statistics = new OrderStatisticsDto();
        
        // Get basic counts
        statistics.setTotalOrders(orderRepository.countOrdersInDateRange(start, end));
        statistics.setPendingOrders(orderRepository.countOrdersByStatusInDateRange(OrderStatus.PENDING, start, end));
        statistics.setProcessingOrders(orderRepository.countOrdersByStatusInDateRange(OrderStatus.PROCESSING, start, end));
        statistics.setShippedOrders(orderRepository.countOrdersByStatusInDateRange(OrderStatus.SHIPPED, start, end));
        statistics.setDeliveredOrders(orderRepository.countOrdersByStatusInDateRange(OrderStatus.DELIVERED, start, end));
        statistics.setCancelledOrders(orderRepository.countOrdersByStatusInDateRange(OrderStatus.CANCELLED, start, end));
        statistics.setRefundedOrders(orderRepository.countOrdersByStatusInDateRange(OrderStatus.REFUNDED, start, end));
        
        // Get revenue data
        BigDecimal totalRevenue = orderRepository.getTotalRevenueInDateRange(start, end);
        statistics.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        if (statistics.getTotalOrders() > 0) {
            statistics.setAverageOrderValue(statistics.getTotalRevenue()
                    .divide(BigDecimal.valueOf(statistics.getTotalOrders()), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            statistics.setAverageOrderValue(BigDecimal.ZERO);
        }
        
        // Get orders by status map
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("PENDING", statistics.getPendingOrders());
        ordersByStatus.put("PROCESSING", statistics.getProcessingOrders());
        ordersByStatus.put("SHIPPED", statistics.getShippedOrders());
        ordersByStatus.put("DELIVERED", statistics.getDeliveredOrders());
        ordersByStatus.put("CANCELLED", statistics.getCancelledOrders());
        ordersByStatus.put("REFUNDED", statistics.getRefundedOrders());
        statistics.setOrdersByStatus(ordersByStatus);
        
        return statistics;
    }
    
    /**
     * Export orders to CSV
     */
    @Transactional(readOnly = true)
    public byte[] exportOrdersToCSV(OrderStatus status, String startDate, String endDate) throws Exception {
        LocalDateTime start = startDate != null ? 
                LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? 
                LocalDateTime.parse(endDate + "T23:59:59") : null;
        
        List<Order> orders;
        if (status != null || start != null || end != null) {
            Pageable pageable = PageRequest.of(0, 10000); // Large page for export
            orders = orderRepository.findOrdersWithFilters(status, null, null, start, end, pageable).getContent();
        } else {
            orders = orderRepository.findAll();
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        // CSV Header
        writer.println("Order Number,User ID,Status,Payment Status,Subtotal,Tax,Shipping,Total,Currency,Created At,Updated At");
        
        // CSV Data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Order order : orders) {
            writer.printf("%s,%d,%s,%s,%.2f,%.2f,%.2f,%.2f,%s,%s,%s%n",
                    order.getOrderNumber(),
                    order.getUserId(),
                    order.getStatus(),
                    order.getPaymentStatus(),
                    order.getSubtotal(),
                    order.getTaxAmount(),
                    order.getShippingAmount(),
                    order.getTotalAmount(),
                    order.getCurrency(),
                    order.getCreatedAt().format(formatter),
                    order.getUpdatedAt().format(formatter)
            );
        }
        
        writer.flush();
        writer.close();
        
        return outputStream.toByteArray();
    }
    
    /**
     * Validate admin status transitions (more permissive than regular user transitions)
     */
    private boolean isValidAdminStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == null) return to == OrderStatus.PENDING;
        
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED || to == OrderStatus.CANCELLED;
            case DELIVERED -> to == OrderStatus.REFUNDED;
            case CANCELLED -> to == OrderStatus.REFUNDED; // Admin can refund cancelled orders
            case REFUNDED -> false; // Terminal state
        };
    }
    
    /**
     * Get sales report
     */
    @Transactional(readOnly = true)
    public SalesReportDto getSalesReport(String period, String startDate, String endDate) {
        LocalDateTime start = startDate != null ? 
                LocalDateTime.parse(startDate + "T00:00:00") : getDefaultStartDate(period);
        LocalDateTime end = endDate != null ? 
                LocalDateTime.parse(endDate + "T23:59:59") : LocalDateTime.now();
        
        SalesReportDto report = new SalesReportDto();
        report.setPeriod(period);
        
        // Get basic sales data
        BigDecimal totalSales = orderRepository.getTotalRevenueInDateRange(start, end);
        report.setTotalSales(totalSales != null ? totalSales : BigDecimal.ZERO);
        
        long totalOrders = orderRepository.countOrdersInDateRange(start, end);
        report.setTotalOrders(totalOrders);
        
        if (totalOrders > 0) {
            report.setAverageOrderValue(report.getTotalSales()
                    .divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            report.setAverageOrderValue(BigDecimal.ZERO);
        }
        
        // Get top products (mock data for now - would need product service integration)
        List<SalesReportDto.TopProductDto> topProducts = getTopProductsForPeriod(start, end);
        report.setTopProducts(topProducts);
        
        // Get sales by category (mock data for now)
        Map<String, BigDecimal> salesByCategory = getSalesByCategoryForPeriod(start, end);
        report.setSalesByCategory(salesByCategory);
        
        // Get sales trend data
        List<SalesReportDto.SalesTrendDataDto> salesTrend = getSalesTrendForPeriod(period, start, end);
        report.setSalesTrend(salesTrend);
        
        return report;
    }
    
    /**
     * Export dashboard data
     */
    @Transactional(readOnly = true)
    public byte[] exportDashboardData(String format, String startDate, String endDate) throws Exception {
        LocalDateTime start = startDate != null ? 
                LocalDateTime.parse(startDate + "T00:00:00") : LocalDateTime.now().minusDays(30);
        LocalDateTime end = endDate != null ? 
                LocalDateTime.parse(endDate + "T23:59:59") : LocalDateTime.now();
        
        OrderStatisticsDto statistics = getOrderStatistics(startDate, endDate);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        if (format.equals("csv")) {
            // CSV format
            writer.println("Metric,Value");
            writer.println("Total Orders," + statistics.getTotalOrders());
            writer.println("Total Revenue," + statistics.getTotalRevenue());
            writer.println("Average Order Value," + statistics.getAverageOrderValue());
            writer.println("Pending Orders," + statistics.getPendingOrders());
            writer.println("Processing Orders," + statistics.getProcessingOrders());
            writer.println("Shipped Orders," + statistics.getShippedOrders());
            writer.println("Delivered Orders," + statistics.getDeliveredOrders());
            writer.println("Cancelled Orders," + statistics.getCancelledOrders());
            writer.println("Refunded Orders," + statistics.getRefundedOrders());
        } else {
            // For Excel format, we'd need Apache POI library
            // For now, return CSV format
            writer.println("Metric,Value");
            writer.println("Total Orders," + statistics.getTotalOrders());
            writer.println("Total Revenue," + statistics.getTotalRevenue());
            writer.println("Average Order Value," + statistics.getAverageOrderValue());
        }
        
        writer.flush();
        writer.close();
        
        return outputStream.toByteArray();
    }
    
    private LocalDateTime getDefaultStartDate(String period) {
        return switch (period.toLowerCase()) {
            case "daily" -> LocalDateTime.now().minusDays(1);
            case "weekly" -> LocalDateTime.now().minusDays(7);
            case "monthly" -> LocalDateTime.now().minusDays(30);
            case "yearly" -> LocalDateTime.now().minusDays(365);
            default -> LocalDateTime.now().minusDays(30);
        };
    }
    
    private List<SalesReportDto.TopProductDto> getTopProductsForPeriod(LocalDateTime start, LocalDateTime end) {
        // This would require integration with product service
        // For now, return mock data
        List<SalesReportDto.TopProductDto> topProducts = new ArrayList<>();
        topProducts.add(new SalesReportDto.TopProductDto(1L, "Sample Product 1", 50, new BigDecimal("1250.00")));
        topProducts.add(new SalesReportDto.TopProductDto(2L, "Sample Product 2", 35, new BigDecimal("875.00")));
        topProducts.add(new SalesReportDto.TopProductDto(3L, "Sample Product 3", 28, new BigDecimal("700.00")));
        return topProducts;
    }
    
    private Map<String, BigDecimal> getSalesByCategoryForPeriod(LocalDateTime start, LocalDateTime end) {
        // This would require integration with product service
        // For now, return mock data
        Map<String, BigDecimal> salesByCategory = new HashMap<>();
        salesByCategory.put("Electronics", new BigDecimal("5000.00"));
        salesByCategory.put("Clothing", new BigDecimal("3500.00"));
        salesByCategory.put("Books", new BigDecimal("1200.00"));
        salesByCategory.put("Home & Garden", new BigDecimal("2800.00"));
        return salesByCategory;
    }
    
    private List<SalesReportDto.SalesTrendDataDto> getSalesTrendForPeriod(String period, LocalDateTime start, LocalDateTime end) {
        // This would require more complex queries based on the period
        // For now, return mock data
        List<SalesReportDto.SalesTrendDataDto> trendData = new ArrayList<>();
        
        if (period.equals("daily")) {
            for (int i = 7; i >= 0; i--) {
                LocalDateTime date = LocalDateTime.now().minusDays(i);
                String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                trendData.add(new SalesReportDto.SalesTrendDataDto(dateStr, 
                    new BigDecimal(String.valueOf(500 + (i * 100))), 15 + i));
            }
        } else if (period.equals("monthly")) {
            for (int i = 12; i >= 0; i--) {
                LocalDateTime date = LocalDateTime.now().minusMonths(i);
                String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                trendData.add(new SalesReportDto.SalesTrendDataDto(dateStr, 
                    new BigDecimal(String.valueOf(15000 + (i * 2000))), 450 + (i * 50)));
            }
        }
        
        return trendData;
    }
    
    /**
     * Convert Order entity to DTO (reuse from OrderService)
     */
    private OrderDto convertToDto(Order order) {
        // This would ideally be extracted to a common converter class
        // For now, we'll create a basic conversion
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setStatus(order.getStatus());
        dto.setSubtotal(order.getSubtotal());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setShippingAmount(order.getShippingAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCurrency(order.getCurrency());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setShippingAddressId(order.getShippingAddressId());
        dto.setBillingAddressId(order.getBillingAddressId());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setTotalItemCount(order.getTotalItemCount());
        dto.setCanBeCancelled(order.canBeCancelled());
        dto.setCanBeRefunded(order.canBeRefunded());
        
        return dto;
    }
}