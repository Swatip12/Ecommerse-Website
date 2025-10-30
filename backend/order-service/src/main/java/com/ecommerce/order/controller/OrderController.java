package com.ecommerce.order.controller;

import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.user.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class OrderController {
    
    private final OrderService orderService;
    
    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    /**
     * Create a new order
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            OrderDto order = orderService.createOrder(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get order by ID (customer can only access their own orders)
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            return orderService.getOrderById(orderId)
                    .map(order -> {
                        // Check if user can access this order
                        if (hasRole(authentication, "ADMIN") || 
                            order.getUserId().equals(getUserIdFromAuthentication(authentication))) {
                            return ResponseEntity.ok(order);
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<OrderDto>build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get order by order number (customer can only access their own orders)
     */
    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderByOrderNumber(
            @PathVariable String orderNumber,
            Authentication authentication) {
        try {
            return orderService.getOrderByOrderNumber(orderNumber)
                    .map(order -> {
                        // Check if user can access this order
                        if (hasRole(authentication, "ADMIN") || 
                            order.getUserId().equals(getUserIdFromAuthentication(authentication))) {
                            return ResponseEntity.ok(order);
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<OrderDto>build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get orders for current user
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getMyOrders(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(required = false) OrderStatus status,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            Page<OrderDto> orders;
            
            if (status != null) {
                orders = orderService.getOrdersByUserIdAndStatus(userId, status, page, size);
            } else {
                orders = orderService.getOrdersByUserId(userId, page, size);
            }
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get recent orders for current user
     */
    @GetMapping("/my-orders/recent")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getMyRecentOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<OrderDto> orders = orderService.getRecentOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get cancellable orders for current user
     */
    @GetMapping("/my-orders/cancellable")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getMyCancellableOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<OrderDto> orders = orderService.getCancellableOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get refundable orders for current user
     */
    @GetMapping("/my-orders/refundable")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getMyRefundableOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<OrderDto> orders = orderService.getRefundableOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update order status (customers can only cancel their own orders)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            
            // Check if user can update this order
            return orderService.getOrderById(orderId)
                    .map(order -> {
                        boolean canUpdate = hasRole(authentication, "ADMIN") || 
                                          (order.getUserId().equals(userId) && request.getNewStatus() == OrderStatus.CANCELLED);
                        
                        if (!canUpdate) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<OrderDto>build();
                        }
                        
                        OrderDto updatedOrder = orderService.updateOrderStatus(orderId, request, userId);
                        return ResponseEntity.ok(updatedOrder);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Cancel order
     */
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> requestBody,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            String reason = requestBody != null ? requestBody.get("reason") : "Cancelled by customer";
            
            // Check if user can cancel this order
            return orderService.getOrderById(orderId)
                    .map(order -> {
                        if (!hasRole(authentication, "ADMIN") && !order.getUserId().equals(userId)) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<OrderDto>build();
                        }
                        
                        OrderDto cancelledOrder = orderService.cancelOrder(orderId, reason, userId);
                        return ResponseEntity.ok(cancelledOrder);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get order status history
     */
    @GetMapping("/{orderId}/status-history")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderStatusHistoryDto>> getOrderStatusHistory(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            // Check if user can access this order
            return orderService.getOrderById(orderId)
                    .map(order -> {
                        if (!hasRole(authentication, "ADMIN") && 
                            !order.getUserId().equals(getUserIdFromAuthentication(authentication))) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).<List<OrderStatusHistoryDto>>build();
                        }
                        
                        List<OrderStatusHistoryDto> history = orderService.getOrderStatusHistory(orderId);
                        return ResponseEntity.ok(history);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Admin-only endpoints
    
    /**
     * Get all orders by status (Admin only)
     */
    @GetMapping("/admin/by-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDto>> getOrdersByStatus(
            @RequestParam OrderStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) int size) {
        try {
            Page<OrderDto> orders = orderService.getOrdersByStatus(status, page, size);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get orders requiring attention (Admin only)
     */
    @GetMapping("/admin/requiring-attention")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getOrdersRequiringAttention() {
        try {
            List<OrderDto> orders = orderService.getOrdersRequiringAttention();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update order status (Admin only - can update any order to any status)
     */
    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> adminUpdateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {
        try {
            Long adminId = getUserIdFromAuthentication(authentication);
            OrderDto updatedOrder = orderService.updateOrderStatus(orderId, request, adminId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper methods
    
    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetailsService.CustomUserPrincipal) {
            CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            return userPrincipal.getUserId();
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }
    
    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}