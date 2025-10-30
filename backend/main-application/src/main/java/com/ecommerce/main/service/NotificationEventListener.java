package com.ecommerce.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Component
public class NotificationEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationEventListener.class);
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Handle order status change events
     */
    @EventListener
    @Async
    public void handleOrderStatusChange(OrderStatusChangeEvent event) {
        logger.info("Handling order status change: {} -> {} for order {}", 
            event.getOldStatus(), event.getNewStatus(), event.getOrderNumber());
        
        String message = generateOrderStatusMessage(event.getNewStatus(), event.getOrderNumber());
        
        // Send notification to the customer
        notificationService.sendOrderStatusUpdate(
            event.getUserId(),
            event.getOrderNumber(),
            event.getNewStatus(),
            message
        );
        
        // Send notification to admins for important status changes
        if (isImportantStatusChange(event.getNewStatus())) {
            notificationService.sendAdminNotification("order_status_change", Map.of(
                "userId", event.getUserId(),
                "orderNumber", event.getOrderNumber(),
                "oldStatus", event.getOldStatus(),
                "newStatus", event.getNewStatus(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
    
    /**
     * Handle inventory change events
     */
    @EventListener
    @Async
    public void handleInventoryChange(InventoryChangeEvent event) {
        logger.info("Handling inventory change for product {}: {} -> {}", 
            event.getProductName(), event.getOldQuantity(), event.getNewQuantity());
        
        // Notify admins about inventory changes
        notificationService.sendAdminNotification("inventory_change", Map.of(
            "productId", event.getProductId(),
            "productName", event.getProductName(),
            "oldQuantity", event.getOldQuantity(),
            "newQuantity", event.getNewQuantity(),
            "timestamp", System.currentTimeMillis()
        ));
        
        // If inventory decreased significantly, broadcast to all users
        if (event.getNewQuantity() < event.getOldQuantity() && event.getNewQuantity() <= 5) {
            notificationService.broadcastToAllUsers("low_inventory", Map.of(
                "productId", event.getProductId(),
                "productName", event.getProductName(),
                "availableQuantity", event.getNewQuantity(),
                "message", "Limited stock available for " + event.getProductName(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }
    
    /**
     * Handle low stock alert events
     */
    @EventListener
    @Async
    public void handleLowStockAlert(LowStockAlertEvent event) {
        logger.info("Handling low stock alert for product {}: {} units (reorder level: {})", 
            event.getProductName(), event.getCurrentQuantity(), event.getReorderLevel());
        
        // Send alert to admins
        notificationService.sendAdminNotification("low_stock_alert", Map.of(
            "productId", event.getProductId(),
            "productName", event.getProductName(),
            "currentQuantity", event.getCurrentQuantity(),
            "reorderLevel", event.getReorderLevel(),
            "message", "Low stock alert: " + event.getProductName() + " has only " + event.getCurrentQuantity() + " units left",
            "priority", "high",
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    /**
     * Handle new order events
     */
    @EventListener
    @Async
    public void handleNewOrder(NewOrderEvent event) {
        logger.info("Handling new order: {} for user {} (${:.2f})", 
            event.getOrderNumber(), event.getUserId(), event.getTotalAmount());
        
        // Send confirmation to customer
        notificationService.sendOrderStatusUpdate(
            event.getUserId(),
            event.getOrderNumber(),
            "CONFIRMED",
            "Your order has been confirmed and is being processed."
        );
        
        // Notify admins about new order
        notificationService.sendAdminNotification("new_order", Map.of(
            "userId", event.getUserId(),
            "orderNumber", event.getOrderNumber(),
            "totalAmount", event.getTotalAmount(),
            "message", "New order received: " + event.getOrderNumber(),
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    private String generateOrderStatusMessage(String status, String orderNumber) {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "Your order " + orderNumber + " has been confirmed and is being processed.";
            case "processing":
                return "Your order " + orderNumber + " is currently being prepared for shipment.";
            case "shipped":
                return "Great news! Your order " + orderNumber + " has been shipped and is on its way.";
            case "delivered":
                return "Your order " + orderNumber + " has been delivered. Thank you for your purchase!";
            case "cancelled":
                return "Your order " + orderNumber + " has been cancelled. If you have any questions, please contact support.";
            case "refunded":
                return "Your order " + orderNumber + " has been refunded. The refund will appear in your account within 3-5 business days.";
            default:
                return "Your order " + orderNumber + " status has been updated to: " + status;
        }
    }
    
    private boolean isImportantStatusChange(String status) {
        // Define which status changes should notify admins
        return status.equalsIgnoreCase("cancelled") || 
               status.equalsIgnoreCase("refunded") ||
               status.equalsIgnoreCase("shipped");
    }
}