package com.ecommerce.main.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.Map;
import java.util.List;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes
    
    // Store SSE emitters by user ID
    private final Map<Long, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();
    
    // Store admin emitters separately
    private final List<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();
    
    /**
     * Create SSE connection for a specific user
     */
    public SseEmitter createUserConnection(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        // Add emitter to user's list
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        // Handle completion and timeout
        emitter.onCompletion(() -> removeUserEmitter(userId, emitter));
        emitter.onTimeout(() -> removeUserEmitter(userId, emitter));
        emitter.onError((ex) -> {
            logger.error("SSE error for user {}: {}", userId, ex.getMessage());
            removeUserEmitter(userId, emitter);
        });
        
        // Send initial connection message
        try {
            emitter.send(SseEmitter.event()
                .name("connection")
                .data("Connected to notifications"));
        } catch (IOException e) {
            logger.error("Failed to send initial message to user {}: {}", userId, e.getMessage());
            removeUserEmitter(userId, emitter);
        }
        
        logger.info("Created SSE connection for user: {}", userId);
        return emitter;
    }
    
    /**
     * Create SSE connection for admin users
     */
    public SseEmitter createAdminConnection() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        adminEmitters.add(emitter);
        
        // Handle completion and timeout
        emitter.onCompletion(() -> adminEmitters.remove(emitter));
        emitter.onTimeout(() -> adminEmitters.remove(emitter));
        emitter.onError((ex) -> {
            logger.error("SSE error for admin: {}", ex.getMessage());
            adminEmitters.remove(emitter);
        });
        
        // Send initial connection message
        try {
            emitter.send(SseEmitter.event()
                .name("connection")
                .data("Connected to admin notifications"));
        } catch (IOException e) {
            logger.error("Failed to send initial message to admin: {}", e.getMessage());
            adminEmitters.remove(emitter);
        }
        
        logger.info("Created SSE connection for admin");
        return emitter;
    }
    
    /**
     * Send order status update to specific user
     */
    public void sendOrderStatusUpdate(Long userId, String orderNumber, String status, String message) {
        NotificationMessage notification = new NotificationMessage(
            "order_status_update",
            Map.of(
                "orderNumber", orderNumber,
                "status", status,
                "message", message,
                "timestamp", System.currentTimeMillis()
            )
        );
        
        sendToUser(userId, notification);
        logger.info("Sent order status update to user {}: {} - {}", userId, orderNumber, status);
    }
    
    /**
     * Send inventory change notification to specific user
     */
    public void sendInventoryUpdate(Long userId, Long productId, String productName, int availableQuantity) {
        NotificationMessage notification = new NotificationMessage(
            "inventory_update",
            Map.of(
                "productId", productId,
                "productName", productName,
                "availableQuantity", availableQuantity,
                "timestamp", System.currentTimeMillis()
            )
        );
        
        sendToUser(userId, notification);
        logger.info("Sent inventory update to user {}: {} - {} available", userId, productName, availableQuantity);
    }
    
    /**
     * Send promotional notification to specific user
     */
    public void sendPromotionalNotification(Long userId, String title, String message, String type) {
        NotificationMessage notification = new NotificationMessage(
            "promotional",
            Map.of(
                "title", title,
                "message", message,
                "type", type,
                "timestamp", System.currentTimeMillis()
            )
        );
        
        sendToUser(userId, notification);
        logger.info("Sent promotional notification to user {}: {}", userId, title);
    }
    
    /**
     * Send system notification to specific user
     */
    public void sendSystemNotification(Long userId, String message, String level) {
        NotificationMessage notification = new NotificationMessage(
            "system",
            Map.of(
                "message", message,
                "level", level, // info, warning, error
                "timestamp", System.currentTimeMillis()
            )
        );
        
        sendToUser(userId, notification);
        logger.info("Sent system notification to user {}: {} [{}]", userId, message, level);
    }
    
    /**
     * Send notification to all admin users
     */
    public void sendAdminNotification(String type, Object data) {
        NotificationMessage notification = new NotificationMessage(type, data);
        
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : adminEmitters) {
            try {
                emitter.send(SseEmitter.event()
                    .name(notification.getType())
                    .data(notification.getData()));
            } catch (IOException e) {
                logger.error("Failed to send admin notification: {}", e.getMessage());
                deadEmitters.add(emitter);
            }
        }
        
        // Remove dead emitters
        adminEmitters.removeAll(deadEmitters);
        
        logger.info("Sent admin notification: {} to {} admins", type, adminEmitters.size());
    }
    
    /**
     * Broadcast notification to all connected users
     */
    public void broadcastToAllUsers(String type, Object data) {
        NotificationMessage notification = new NotificationMessage(type, data);
        
        userEmitters.forEach((userId, emitters) -> {
            List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
            
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                        .name(notification.getType())
                        .data(notification.getData()));
                } catch (IOException e) {
                    logger.error("Failed to send broadcast to user {}: {}", userId, e.getMessage());
                    deadEmitters.add(emitter);
                }
            }
            
            // Remove dead emitters
            emitters.removeAll(deadEmitters);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        });
        
        logger.info("Broadcast notification: {} to {} users", type, userEmitters.size());
    }
    
    private void sendToUser(Long userId, NotificationMessage notification) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            logger.debug("No active connections for user: {}", userId);
            return;
        }
        
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                    .name(notification.getType())
                    .data(notification.getData()));
            } catch (IOException e) {
                logger.error("Failed to send notification to user {}: {}", userId, e.getMessage());
                deadEmitters.add(emitter);
            }
        }
        
        // Remove dead emitters
        emitters.removeAll(deadEmitters);
        if (emitters.isEmpty()) {
            userEmitters.remove(userId);
        }
    }
    
    private void removeUserEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
        logger.debug("Removed SSE emitter for user: {}", userId);
    }
    
    /**
     * Send a test notification for integration testing
     */
    public void sendTestNotification(String message) {
        try {
            NotificationMessage notification = new NotificationMessage(
                "test_notification",
                Map.of(
                    "message", message,
                    "timestamp", System.currentTimeMillis(),
                    "type", "integration_test"
                )
            );

            // Broadcast to all connected users
            broadcastToAllUsers("test_notification", notification.getData());
            
            logger.info("Test notification sent: {}", message);
        } catch (Exception e) {
            logger.error("Failed to send test notification", e);
        }
    }

    /**
     * Send order status update for integration testing
     */
    public void sendOrderStatusUpdate(Long orderId, String status) {
        try {
            NotificationMessage notification = new NotificationMessage(
                "order_status_update",
                Map.of(
                    "orderId", orderId,
                    "status", status,
                    "message", "Order status updated to " + status,
                    "timestamp", System.currentTimeMillis()
                )
            );

            // Broadcast to all users for testing
            broadcastToAllUsers("order_status_update", notification.getData());
            
            logger.info("Order status update sent for order {}: {}", orderId, status);
        } catch (Exception e) {
            logger.error("Failed to send order status update for order {}", orderId, e);
        }
    }

    /**
     * Send inventory alert for integration testing
     */
    public void sendInventoryAlert(Long productId, String message) {
        try {
            NotificationMessage notification = new NotificationMessage(
                "inventory_alert",
                Map.of(
                    "productId", productId,
                    "message", message,
                    "timestamp", System.currentTimeMillis(),
                    "type", "low_stock"
                )
            );

            // Send to all admin users
            sendAdminNotification("inventory_alert", notification.getData());
            
            logger.info("Inventory alert sent for product {}: {}", productId, message);
        } catch (Exception e) {
            logger.error("Failed to send inventory alert for product {}", productId, e);
        }
    }

    /**
     * Get connection statistics
     */
    public Map<String, Object> getConnectionStats() {
        int totalUserConnections = userEmitters.values().stream()
            .mapToInt(List::size)
            .sum();
        
        return Map.of(
            "connectedUsers", userEmitters.size(),
            "totalUserConnections", totalUserConnections,
            "adminConnections", adminEmitters.size()
        );
    }
    
    // Inner class for notification messages
    public static class NotificationMessage {
        private final String type;
        private final Object data;
        
        public NotificationMessage(String type, Object data) {
            this.type = type;
            this.data = data;
        }
        
        public String getType() {
            return type;
        }
        
        public Object getData() {
            return data;
        }
    }
}