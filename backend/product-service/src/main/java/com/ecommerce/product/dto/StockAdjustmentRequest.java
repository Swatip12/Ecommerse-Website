package com.ecommerce.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be positive")
    private Integer quantity;
    
    private String reason;
    
    // Default constructor
    public StockAdjustmentRequest() {}
    
    // Constructor
    public StockAdjustmentRequest(Integer quantity, String reason) {
        this.quantity = quantity;
        this.reason = reason;
    }
    
    // Getters and Setters
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}