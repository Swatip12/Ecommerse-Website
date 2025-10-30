package com.ecommerce.main.service;

import org.springframework.context.ApplicationEvent;

public class OrderStatusChangeEvent extends ApplicationEvent {
    
    private final Long userId;
    private final String orderNumber;
    private final String oldStatus;
    private final String newStatus;
    
    public OrderStatusChangeEvent(Object source, Long userId, String orderNumber, String oldStatus, String newStatus) {
        super(source);
        this.userId = userId;
        this.orderNumber = orderNumber;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public String getOldStatus() {
        return oldStatus;
    }
    
    public String getNewStatus() {
        return newStatus;
    }
}