package com.ecommerce.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Principal;
import java.util.Map;

@Controller
public class WebSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle cart synchronization messages
     */
    @MessageMapping("/cart/sync")
    public void syncCart(@Payload CartSyncMessage message, Principal principal) {
        logger.info("Received cart sync from user: {}", principal.getName());
        
        // Broadcast cart update to all sessions of the same user
        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/cart-updates",
            new CartUpdateMessage(
                message.getCartItems(),
                message.getTotalItems(),
                message.getTotalPrice(),
                System.currentTimeMillis(),
                "sync"
            )
        );
    }
    
    /**
     * Handle cart item addition
     */
    @MessageMapping("/cart/add")
    public void addToCart(@Payload CartItemMessage message, Principal principal) {
        logger.info("User {} adding item {} to cart", principal.getName(), message.getProductId());
        
        // Send update to all user sessions
        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/cart-updates",
            new CartUpdateMessage(
                null, // Will be populated by the client
                message.getQuantity(),
                0.0, // Will be calculated by the client
                System.currentTimeMillis(),
                "item_added",
                Map.of(
                    "productId", message.getProductId(),
                    "quantity", message.getQuantity(),
                    "productName", message.getProductName()
                )
            )
        );
    }
    
    /**
     * Handle cart item removal
     */
    @MessageMapping("/cart/remove")
    public void removeFromCart(@Payload CartItemMessage message, Principal principal) {
        logger.info("User {} removing item {} from cart", principal.getName(), message.getProductId());
        
        // Send update to all user sessions
        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/cart-updates",
            new CartUpdateMessage(
                null,
                -message.getQuantity(),
                0.0,
                System.currentTimeMillis(),
                "item_removed",
                Map.of(
                    "productId", message.getProductId(),
                    "quantity", message.getQuantity(),
                    "productName", message.getProductName()
                )
            )
        );
    }
    
    /**
     * Handle cart clear
     */
    @MessageMapping("/cart/clear")
    public void clearCart(Principal principal) {
        logger.info("User {} clearing cart", principal.getName());
        
        // Send clear update to all user sessions
        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/cart-updates",
            new CartUpdateMessage(
                null,
                0,
                0.0,
                System.currentTimeMillis(),
                "cart_cleared"
            )
        );
    }
    
    /**
     * Handle admin dashboard updates
     */
    @MessageMapping("/admin/dashboard")
    public void updateAdminDashboard(@Payload AdminDashboardMessage message, Principal principal) {
        logger.info("Admin {} requesting dashboard update", principal.getName());
        
        // Send to admin topic
        messagingTemplate.convertAndSend(
            "/topic/admin/dashboard",
            new AdminUpdateMessage(
                message.getType(),
                message.getData(),
                System.currentTimeMillis()
            )
        );
    }
    
    /**
     * Handle user connection events
     */
    @MessageMapping("/connect")
    @SendToUser("/queue/connection")
    public ConnectionMessage handleConnect(Principal principal) {
        logger.info("User {} connected to WebSocket", principal.getName());
        return new ConnectionMessage("connected", principal.getName(), System.currentTimeMillis());
    }
    
    /**
     * Handle ping/pong for connection health
     */
    @MessageMapping("/ping")
    @SendToUser("/queue/pong")
    public PongMessage handlePing(Principal principal) {
        return new PongMessage(System.currentTimeMillis());
    }
    
    // Message classes
    public static class CartSyncMessage {
        private Map<String, Object> cartItems;
        private int totalItems;
        private double totalPrice;
        
        // Constructors
        public CartSyncMessage() {}
        
        public CartSyncMessage(Map<String, Object> cartItems, int totalItems, double totalPrice) {
            this.cartItems = cartItems;
            this.totalItems = totalItems;
            this.totalPrice = totalPrice;
        }
        
        // Getters and setters
        public Map<String, Object> getCartItems() { return cartItems; }
        public void setCartItems(Map<String, Object> cartItems) { this.cartItems = cartItems; }
        
        public int getTotalItems() { return totalItems; }
        public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
        
        public double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    }
    
    public static class CartItemMessage {
        private Long productId;
        private String productName;
        private int quantity;
        private double price;
        
        // Constructors
        public CartItemMessage() {}
        
        public CartItemMessage(Long productId, String productName, int quantity, double price) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.price = price;
        }
        
        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
    }
    
    public static class CartUpdateMessage {
        private Map<String, Object> cartItems;
        private int totalItems;
        private double totalPrice;
        private long timestamp;
        private String action;
        private Map<String, Object> metadata;
        
        // Constructors
        public CartUpdateMessage() {}
        
        public CartUpdateMessage(Map<String, Object> cartItems, int totalItems, double totalPrice, 
                               long timestamp, String action) {
            this.cartItems = cartItems;
            this.totalItems = totalItems;
            this.totalPrice = totalPrice;
            this.timestamp = timestamp;
            this.action = action;
        }
        
        public CartUpdateMessage(Map<String, Object> cartItems, int totalItems, double totalPrice, 
                               long timestamp, String action, Map<String, Object> metadata) {
            this.cartItems = cartItems;
            this.totalItems = totalItems;
            this.totalPrice = totalPrice;
            this.timestamp = timestamp;
            this.action = action;
            this.metadata = metadata;
        }
        
        // Getters and setters
        public Map<String, Object> getCartItems() { return cartItems; }
        public void setCartItems(Map<String, Object> cartItems) { this.cartItems = cartItems; }
        
        public int getTotalItems() { return totalItems; }
        public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
        
        public double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }
    
    public static class AdminDashboardMessage {
        private String type;
        private Map<String, Object> data;
        
        // Constructors
        public AdminDashboardMessage() {}
        
        public AdminDashboardMessage(String type, Map<String, Object> data) {
            this.type = type;
            this.data = data;
        }
        
        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }
    }
    
    public static class AdminUpdateMessage {
        private String type;
        private Map<String, Object> data;
        private long timestamp;
        
        // Constructors
        public AdminUpdateMessage() {}
        
        public AdminUpdateMessage(String type, Map<String, Object> data, long timestamp) {
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
    
    public static class ConnectionMessage {
        private String status;
        private String userId;
        private long timestamp;
        
        // Constructors
        public ConnectionMessage() {}
        
        public ConnectionMessage(String status, String userId, long timestamp) {
            this.status = status;
            this.userId = userId;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    public static class PongMessage {
        private long timestamp;
        
        // Constructors
        public PongMessage() {}
        
        public PongMessage(long timestamp) {
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}