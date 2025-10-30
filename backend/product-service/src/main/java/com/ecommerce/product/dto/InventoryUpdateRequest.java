package com.ecommerce.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InventoryUpdateRequest {
    
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;
    
    // Default constructor
    public InventoryUpdateRequest() {}
    
    // Constructor
    public InventoryUpdateRequest(Integer quantity) {
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}