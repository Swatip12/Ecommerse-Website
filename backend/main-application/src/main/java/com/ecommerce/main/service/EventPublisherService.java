package com.ecommerce.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class EventPublisherService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    /**
     * Publish order status change event
     */
    public void publishOrderStatusChange(Long userId, String orderNumber, String oldStatus, String newStatus) {
        OrderStatusChangeEvent event = new OrderStatusChangeEvent(this, userId, orderNumber, oldStatus, newStatus);
        eventPublisher.publishEvent(event);
    }
    
    /**
     * Publish inventory change event
     */
    public void publishInventoryChange(Long productId, String productName, int oldQuantity, int newQuantity) {
        InventoryChangeEvent event = new InventoryChangeEvent(this, productId, productName, oldQuantity, newQuantity);
        eventPublisher.publishEvent(event);
    }
    
    /**
     * Publish low stock alert event
     */
    public void publishLowStockAlert(Long productId, String productName, int currentQuantity, int reorderLevel) {
        LowStockAlertEvent event = new LowStockAlertEvent(this, productId, productName, currentQuantity, reorderLevel);
        eventPublisher.publishEvent(event);
    }
    
    /**
     * Publish new order event
     */
    public void publishNewOrder(Long userId, String orderNumber, double totalAmount) {
        NewOrderEvent event = new NewOrderEvent(this, userId, orderNumber, totalAmount);
        eventPublisher.publishEvent(event);
    }
}