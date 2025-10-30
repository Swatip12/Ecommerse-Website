package com.ecommerce.main.service;

import org.springframework.context.ApplicationEvent;

public class InventoryChangeEvent extends ApplicationEvent {
    
    private final Long productId;
    private final String productName;
    private final int oldQuantity;
    private final int newQuantity;
    
    public InventoryChangeEvent(Object source, Long productId, String productName, int oldQuantity, int newQuantity) {
        super(source);
        this.productId = productId;
        this.productName = productName;
        this.oldQuantity = oldQuantity;
        this.newQuantity = newQuantity;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public int getOldQuantity() {
        return oldQuantity;
    }
    
    public int getNewQuantity() {
        return newQuantity;
    }
}