package com.ecommerce.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class WebSocketCartService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketCartService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Notify user about cart changes across all their sessions
     */
    public void notifyCartUpdate(String userId, Map<String, Object> cartData, String action) {
        try {
            CartUpdateMessage message = new CartUpdateMessage(
                cartData,
                (Integer) cartData.getOrDefault("totalItems", 0),
                (Double) cartData.getOrDefault("totalPrice", 0.0),
                System.currentTimeMillis(),
                action
            );
            
            messagingTemplate.convertAndSendToUser(userId, "/queue/cart-updates", message);
            logger.info("Sent cart update to user {}: {}", userId, action);
            
        } catch (Exception e) {
            logger.error("Failed to send cart update to user {}: {}", userId, e.getMessage());
        }
    }
    
    /**
     * Notify user about inventory changes affecting their cart
     */
    public void notifyInventoryChange(String userId, Long productId, String productName, int availableQuantity) {
        try {
            InventoryUpdateMessage message = new InventoryUpdateMessage(
                productId,
                productName,
                availableQuantity,
                System.currentTimeMillis()
            );
            
            messagingTemplate.convertAndSendToUser(userId, "/queue/inventory-updates", message);
            logger.info("Sent inventory update to user {}: {} - {} available", userId, productName, availableQuantity);
            
        } catch (Exception e) {
            logger.error("Failed to send inventory update to user {}: {}", userId, e.getMessage());
        }
    }
    
    /**
     * Send admin dashboard updates
     */
    public void sendAdminDashboardUpdate(String type, Map<String, Object> data) {
        try {
            AdminDashboardUpdateMessage message = new AdminDashboardUpdateMessage(
                type,
                data,
                System.currentTimeMillis()
            );
            
            messagingTemplate.convertAndSend("/topic/admin/dashboard", message);
            logger.info("Sent admin dashboard update: {}", type);
            
        } catch (Exception e) {
            logger.error("Failed to send admin dashboard update: {}", e.getMessage());
        }
    }
    
    /**
     * Send real-time order updates to admin
     */
    public void sendOrderUpdateToAdmin(Map<String, Object> orderData) {
        try {
            messagingTemplate.convertAndSend("/topic/admin/orders", orderData);
            logger.info("Sent order update to admin dashboard");
            
        } catch (Exception e) {
            logger.error("Failed to send order update to admin: {}", e.getMessage());
        }
    }
    
    /**
     * Send real-time inventory updates to admin
     */
    public void sendInventoryUpdateToAdmin(Map<String, Object> inventoryData) {
        try {
            messagingTemplate.convertAndSend("/topic/admin/inventory", inventoryData);
            logger.info("Sent inventory update to admin dashboard");
            
        } catch (Exception e) {
            logger.error("Failed to send inventory update to admin: {}", e.getMessage());
        }
    }
    
    /**
     * Broadcast system-wide notifications
     */
    public void broadcastSystemNotification(String message, String level) {
        try {
            SystemNotificationMessage notification = new SystemNotificationMessage(
                message,
                level,
                System.currentTimeMillis()
            );
            
            messagingTemplate.convertAndSend("/topic/system-notifications", notification);
            logger.info("Broadcast system notification: {} [{}]", message, level);
            
        } catch (Exception e) {
            logger.error("Failed to broadcast system notification: {}", e.getMessage());
        }
    }
    
    // Message classes
    public static class CartUpdateMessage {
        private Map<String, Object> cartData;
        private int totalItems;
        private double totalPrice;
        private long timestamp;
        private String action;
        
        public CartUpdateMessage() {}
        
        public CartUpdateMessage(Map<String, Object> cartData, int totalItems, double totalPrice, 
                               long timestamp, String action) {
            this.cartData = cartData;
            this.totalItems = totalItems;
            this.totalPrice = totalPrice;
            this.timestamp = timestamp;
            this.action = action;
        }
        
        // Getters and setters
        public Map<String, Object> getCartData() { return cartData; }
        public void setCartData(Map<String, Object> cartData) { this.cartData = cartData; }
        
        public int getTotalItems() { return totalItems; }
        public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
        
        public double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
    }
    
    public static class InventoryUpdateMessage {
        private Long productId;
        private String productName;
        private int availableQuantity;
        private long timestamp;
        
        public InventoryUpdateMessage() {}
        
        public InventoryUpdateMessage(Long productId, String productName, int availableQuantity, long timestamp) {
            this.productId = productId;
            this.productName = productName;
            this.availableQuantity = availableQuantity;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public int getAvailableQuantity() { return availableQuantity; }
        public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    public static class AdminDashboardUpdateMessage {
        private String type;
        private Map<String, Object> data;
        private long timestamp;
        
        public AdminDashboardUpdateMessage() {}
        
        public AdminDashboardUpdateMessage(String type, Map<String, Object> data, long timestamp) {
            this.type = type;
            this.data = data;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    public static class SystemNotificationMessage {
        private String message;
        private String level;
        private long timestamp;
        
        public SystemNotificationMessage() {}
        
        public SystemNotificationMessage(String message, String level, long timestamp) {
            this.message = message;
            this.level = level;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}