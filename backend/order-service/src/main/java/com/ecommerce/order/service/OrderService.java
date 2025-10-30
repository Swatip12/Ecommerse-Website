package com.ecommerce.order.service;

import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.*;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderItemRepository;
import com.ecommerce.order.repository.OrderStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    
    @Autowired
    public OrderService(OrderRepository orderRepository, 
                       OrderItemRepository orderItemRepository,
                       OrderStatusHistoryRepository orderStatusHistoryRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    }
    
    /**
     * Create a new order from cart items
     */
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        // Generate unique order number
        String orderNumber = generateOrderNumber();
        
        // Calculate totals
        BigDecimal subtotal = request.getItems().stream()
                .map(CreateOrderItemRequest::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // For now, simple tax and shipping calculation
        BigDecimal taxAmount = subtotal.multiply(BigDecimal.valueOf(0.08)); // 8% tax
        BigDecimal shippingAmount = subtotal.compareTo(BigDecimal.valueOf(50)) >= 0 ? 
                BigDecimal.ZERO : BigDecimal.valueOf(9.99); // Free shipping over $50
        BigDecimal totalAmount = subtotal.add(taxAmount).add(shippingAmount);
        
        // Create order entity
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setShippingAmount(shippingAmount);
        order.setTotalAmount(totalAmount);
        order.setShippingAddressId(request.getShippingAddressId());
        order.setBillingAddressId(request.getBillingAddressId() != null ? 
                request.getBillingAddressId() : request.getShippingAddressId());
        order.setNotes(request.getNotes());
        
        // Save order
        order = orderRepository.save(order);
        
        // Create order items
        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(itemRequest.getProductId());
            orderItem.setProductSku(itemRequest.getProductSku());
            orderItem.setProductName(itemRequest.getProductName());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(itemRequest.getUnitPrice());
            orderItem.setTotalPrice(itemRequest.getTotalPrice());
            
            order.addOrderItem(orderItem);
        }
        
        // Save order items
        orderItemRepository.saveAll(order.getOrderItems());
        
        // Create initial status history
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, null, OrderStatus.PENDING.name(), userId, "Order created");
        order.addStatusHistory(statusHistory);
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public Optional<OrderDto> getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .map(this::convertToDto);
    }
    
    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public Optional<OrderDto> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(this::convertToDto);
    }
    
    /**
     * Get orders for a specific user with pagination
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Get orders by user ID and status
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByUserIdAndStatus(Long userId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Get recent orders for a user (last 30 days)
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getRecentOrdersByUserId(Long userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return orderRepository.findRecentOrdersByUserId(userId, thirtyDaysAgo)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Update order status
     */
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, Long changedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        OrderStatus previousStatus = order.getStatus();
        
        // Validate status transition
        if (!isValidStatusTransition(previousStatus, request.getNewStatus())) {
            throw new RuntimeException("Invalid status transition from " + previousStatus + " to " + request.getNewStatus());
        }
        
        // Update order status
        order.setStatus(request.getNewStatus());
        order = orderRepository.save(order);
        
        // Create status history entry
        OrderStatusHistory statusHistory = new OrderStatusHistory(
                order, 
                previousStatus != null ? previousStatus.name() : null,
                request.getNewStatus().name(),
                changedBy,
                request.getNotes()
        );
        orderStatusHistoryRepository.save(statusHistory);
        
        return convertToDto(order);
    }
    
    /**
     * Cancel order (if possible)
     */
    public OrderDto cancelOrder(Long orderId, String reason, Long cancelledBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (!order.canBeCancelled()) {
            throw new RuntimeException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(OrderStatus.CANCELLED, reason);
        return updateOrderStatus(orderId, request, cancelledBy);
    }
    
    /**
     * Get cancellable orders for a user
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getCancellableOrdersByUserId(Long userId) {
        return orderRepository.findCancellableOrdersByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get refundable orders for a user
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getRefundableOrdersByUserId(Long userId) {
        return orderRepository.findRefundableOrdersByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get order status history
     */
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryDto> getOrderStatusHistory(Long orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(orderId)
                .stream()
                .map(this::convertToStatusHistoryDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get orders by status (for admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByStatus(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Get orders requiring attention
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersRequiringAttention() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24); // Orders processing for more than 24 hours
        return orderRepository.findOrdersRequiringAttention(cutoffTime)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = String.valueOf((int) (Math.random() * 1000));
        String orderNumber = "ORD-" + timestamp + "-" + String.format("%03d", Integer.parseInt(randomSuffix));
        
        // Ensure uniqueness
        while (orderRepository.existsByOrderNumber(orderNumber)) {
            randomSuffix = String.valueOf((int) (Math.random() * 1000));
            orderNumber = "ORD-" + timestamp + "-" + String.format("%03d", Integer.parseInt(randomSuffix));
        }
        
        return orderNumber;
    }
    
    /**
     * Validate status transition
     */
    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == null) return to == OrderStatus.PENDING;
        
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED;
            case DELIVERED -> to == OrderStatus.REFUNDED;
            case CANCELLED, REFUNDED -> false; // Terminal states
        };
    }
    
    /**
     * Convert Order entity to DTO
     */
    private OrderDto convertToDto(Order order) {
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
        
        // Convert order items
        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                    .map(this::convertToOrderItemDto)
                    .collect(Collectors.toList()));
        }
        
        // Convert status history
        if (order.getStatusHistory() != null) {
            dto.setStatusHistory(order.getStatusHistory().stream()
                    .map(this::convertToStatusHistoryDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    /**
     * Convert OrderItem entity to DTO
     */
    private OrderItemDto convertToOrderItemDto(OrderItem orderItem) {
        return new OrderItemDto(
                orderItem.getId(),
                orderItem.getOrder().getId(),
                orderItem.getProductId(),
                orderItem.getProductSku(),
                orderItem.getProductName(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                orderItem.getTotalPrice(),
                orderItem.getCreatedAt()
        );
    }
    
    /**
     * Convert OrderStatusHistory entity to DTO
     */
    private OrderStatusHistoryDto convertToStatusHistoryDto(OrderStatusHistory history) {
        return new OrderStatusHistoryDto(
                history.getId(),
                history.getOrder().getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getChangedBy(),
                history.getNotes(),
                history.getCreatedAt(),
                history.isStatusUpgrade(),
                history.isSystemChange()
        );
    }
}