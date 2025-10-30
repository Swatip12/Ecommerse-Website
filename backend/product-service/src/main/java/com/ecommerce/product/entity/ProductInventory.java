package com.ecommerce.product.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_inventory", indexes = {
    @Index(name = "idx_low_stock", columnList = "quantityAvailable, reorderLevel"),
    @Index(name = "idx_available", columnList = "quantityAvailable")
})
public class ProductInventory {
    
    @Id
    @Column(name = "product_id")
    private Long productId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;
    
    @Column(name = "quantity_available", nullable = false)
    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Available quantity cannot be negative")
    private Integer quantityAvailable = 0;
    
    @Column(name = "quantity_reserved", nullable = false)
    @NotNull(message = "Reserved quantity is required")
    @Min(value = 0, message = "Reserved quantity cannot be negative")
    private Integer quantityReserved = 0;
    
    @Column(name = "reorder_level")
    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel = 10;
    
    @UpdateTimestamp
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;
    
    // Default constructor
    public ProductInventory() {}
    
    // Constructor for creating new inventory
    public ProductInventory(Product product, Integer quantityAvailable) {
        this.product = product;
        this.quantityAvailable = quantityAvailable;
    }
    
    // Constructor with reorder level
    public ProductInventory(Product product, Integer quantityAvailable, Integer reorderLevel) {
        this.product = product;
        this.quantityAvailable = quantityAvailable;
        this.reorderLevel = reorderLevel;
    }
    
    // Getters and Setters
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
        if (product != null) {
            this.productId = product.getId();
        }
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
    
    // Helper methods
    public Integer getTotalQuantity() {
        return quantityAvailable + quantityReserved;
    }
    
    public boolean isInStock() {
        return quantityAvailable > 0;
    }
    
    public boolean isLowStock() {
        return quantityAvailable <= reorderLevel;
    }
    
    public boolean canReserve(Integer quantity) {
        return quantityAvailable >= quantity;
    }
    
    public void reserveQuantity(Integer quantity) {
        if (!canReserve(quantity)) {
            throw new IllegalArgumentException("Insufficient quantity available for reservation");
        }
        quantityAvailable -= quantity;
        quantityReserved += quantity;
    }
    
    public void releaseReservedQuantity(Integer quantity) {
        if (quantityReserved < quantity) {
            throw new IllegalArgumentException("Cannot release more quantity than reserved");
        }
        quantityReserved -= quantity;
        quantityAvailable += quantity;
    }
    
    public void confirmReservedQuantity(Integer quantity) {
        if (quantityReserved < quantity) {
            throw new IllegalArgumentException("Cannot confirm more quantity than reserved");
        }
        quantityReserved -= quantity;
    }
    
    public void addStock(Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to add must be positive");
        }
        quantityAvailable += quantity;
    }
    
    public void removeStock(Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity to remove must be positive");
        }
        if (quantityAvailable < quantity) {
            throw new IllegalArgumentException("Cannot remove more quantity than available");
        }
        quantityAvailable -= quantity;
    }
    
    @Override
    public String toString() {
        return "ProductInventory{" +
                "productId=" + productId +
                ", quantityAvailable=" + quantityAvailable +
                ", quantityReserved=" + quantityReserved +
                ", reorderLevel=" + reorderLevel +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}