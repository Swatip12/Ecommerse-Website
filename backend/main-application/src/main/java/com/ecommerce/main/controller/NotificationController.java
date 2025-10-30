package com.ecommerce.main.controller;

import com.ecommerce.main.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Create SSE connection for authenticated user
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public SseEmitter streamNotifications(Authentication authentication) {
        // Extract user ID from authentication
        Long userId = extractUserIdFromAuth(authentication);
        return notificationService.createUserConnection(userId);
    }
    
    /**
     * Create SSE connection for admin users
     */
    @GetMapping(value = "/admin/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public SseEmitter streamAdminNotifications() {
        return notificationService.createAdminConnection();
    }
    
    /**
     * Send test notification to user (for testing purposes)
     */
    @PostMapping("/test/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> sendTestNotification(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        
        String message = request.getOrDefault("message", "Test notification");
        notificationService.sendSystemNotification(userId, message, "info");
        
        return ResponseEntity.ok("Test notification sent to user " + userId);
    }
    
    /**
     * Send test admin notification (for testing purposes)
     */
    @PostMapping("/test/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> sendTestAdminNotification(@RequestBody Map<String, String> request) {
        String message = request.getOrDefault("message", "Test admin notification");
        notificationService.sendAdminNotification("test", Map.of("message", message, "timestamp", System.currentTimeMillis()));
        
        return ResponseEntity.ok("Test admin notification sent");
    }
    
    /**
     * Broadcast notification to all users (admin only)
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> broadcastNotification(@RequestBody Map<String, Object> request) {
        String type = (String) request.getOrDefault("type", "system");
        Object data = request.getOrDefault("data", "Broadcast message");
        
        notificationService.broadcastToAllUsers(type, data);
        
        return ResponseEntity.ok("Broadcast notification sent");
    }
    
    /**
     * Get connection statistics (admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getConnectionStats() {
        return ResponseEntity.ok(notificationService.getConnectionStats());
    }
    
    /**
     * Send order status update notification
     */
    @PostMapping("/order-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> sendOrderStatusUpdate(@RequestBody OrderStatusNotificationRequest request) {
        notificationService.sendOrderStatusUpdate(
            request.getUserId(),
            request.getOrderNumber(),
            request.getStatus(),
            request.getMessage()
        );
        
        return ResponseEntity.ok("Order status notification sent");
    }
    
    /**
     * Send inventory update notification
     */
    @PostMapping("/inventory-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> sendInventoryUpdate(@RequestBody InventoryUpdateNotificationRequest request) {
        notificationService.sendInventoryUpdate(
            request.getUserId(),
            request.getProductId(),
            request.getProductName(),
            request.getAvailableQuantity()
        );
        
        return ResponseEntity.ok("Inventory update notification sent");
    }
    
    /**
     * Send promotional notification
     */
    @PostMapping("/promotional")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> sendPromotionalNotification(@RequestBody PromotionalNotificationRequest request) {
        if (request.getUserId() != null) {
            // Send to specific user
            notificationService.sendPromotionalNotification(
                request.getUserId(),
                request.getTitle(),
                request.getMessage(),
                request.getType()
            );
        } else {
            // Broadcast to all users
            notificationService.broadcastToAllUsers("promotional", Map.of(
                "title", request.getTitle(),
                "message", request.getMessage(),
                "type", request.getType(),
                "timestamp", System.currentTimeMillis()
            ));
        }
        
        return ResponseEntity.ok("Promotional notification sent");
    }
    
    private Long extractUserIdFromAuth(Authentication authentication) {
        // This is a simplified implementation
        // In a real application, you would extract the user ID from the JWT token or user details
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            // Fallback: return a default user ID or handle differently
            return 1L;
        }
    }
    
    // Request DTOs
    public static class OrderStatusNotificationRequest {
        private Long userId;
        private String orderNumber;
        private String status;
        private String message;
        
        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    public static class InventoryUpdateNotificationRequest {
        private Long userId;
        private Long productId;
        private String productName;
        private int availableQuantity;
        
        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public int getAvailableQuantity() { return availableQuantity; }
        public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }
    }
    
    public static class PromotionalNotificationRequest {
        private Long userId; // null for broadcast
        private String title;
        private String message;
        private String type;
        
        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}