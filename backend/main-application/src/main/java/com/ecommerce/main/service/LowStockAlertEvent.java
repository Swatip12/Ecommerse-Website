package com.ecommerce.main.service;

import org.springframework.context.ApplicationEvent;

public class LowStockAlertEvent extends ApplicationEvent {
    
    private final Long productId;
    private final String productName;
    private final int currentQuantity;
    private final int reorderLevel;
    
    public LowStockAlertEvent(Object source, Long productId, String productName, int currentQuantity, int reorderLevel) {
        super(source);
        this.productId = productId;
        this.productName = productName;
        this.currentQuantity = currentQuantity;
        this.reorderLevel = reorderLevel;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public int getCurrentQuantity() {
        return currentQuantity;
    }
    
    public int getReorderLevel() {
        return reorderLevel;
    }
}