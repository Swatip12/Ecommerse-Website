package com.ecommerce.product.dto;

import com.ecommerce.product.entity.ProductInventory;

import java.time.LocalDateTime;

public class InventoryResponse {
    private Long productId;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer reorderLevel;
    private LocalDateTime lastUpdated;
    private boolean isInStock;
    private boolean isLowStock;
    
    // Default constructor
    public InventoryResponse() {}
    
    // Constructor from ProductInventory entity
    public InventoryResponse(ProductInventory inventory) {
        this.productId = inventory.getProductId();
        this.quantityAvailable = inventory.getQuantityAvailable();
        this.quantityReserved = inventory.getQuantityReserved();
        this.reorderLevel = inventory.getReorderLevel();
        this.lastUpdated = inventory.getLastUpdated();
        this.isInStock = inventory.isInStock();
        this.isLowStock = inventory.isLowStock();
    }
    
    // Getters and Setters
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public Integer getQuantityAvailable() {
        return quantityAvailable;
    }
    
    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }
    
    public Integer getQuantityReserved() {
        return quantityReserved;
    }
    
    public void setQuantityReserved(Integer quantityReserved) {
        this.quantityReserved = quantityReserved;
    }
    
    public Integer getReorderLevel() {
        return reorderLevel;
    }
    
    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public boolean isInStock() {
        return isInStock;
    }
    
    public void setInStock(boolean inStock) {
        isInStock = inStock;
    }
    
    public boolean isLowStock() {
        return isLowStock;
    }
    
    public void setLowStock(boolean lowStock) {
        isLowStock = lowStock;
    }
    
    public Integer getTotalQuantity() {
        return quantityAvailable + quantityReserved;
    }
}