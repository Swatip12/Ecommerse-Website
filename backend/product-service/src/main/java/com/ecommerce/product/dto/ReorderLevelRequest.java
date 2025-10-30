package com.ecommerce.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReorderLevelRequest {
    
    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;
    
    // Default constructor
    public ReorderLevelRequest() {}
    
    // Constructor
    public ReorderLevelRequest(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
    
    // Getters and Setters
    public Integer getReorderLevel() {
        return reorderLevel;
    }
    
    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
}