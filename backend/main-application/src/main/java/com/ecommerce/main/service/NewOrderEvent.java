package com.ecommerce.main.service;

import org.springframework.context.ApplicationEvent;

public class NewOrderEvent extends ApplicationEvent {
    
    private final Long userId;
    private final String orderNumber;
    private final double totalAmount;
    
    public NewOrderEvent(Object source, Long userId, String orderNumber, double totalAmount) {
        super(source);
        this.userId = userId;
        this.orderNumber = orderNumber;
        this.totalAmount = totalAmount;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public double getTotalAmount() {
        return totalAmount;
    }
}