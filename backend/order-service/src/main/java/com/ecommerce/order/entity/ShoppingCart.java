package com.ecommerce.order.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shopping_cart", 
       uniqueConstraints = {
           @UniqueConstraint(name = "unique_user_product", columnNames = {"user_id", "product_id"}),
           @UniqueConstraint(name = "unique_session_product", columnNames = {"session_id", "product_id"})
       },
       indexes = {
           @Index(name = "idx_user", columnList = "userId"),
           @Index(name = "idx_session", columnList = "sessionId"),
           @Index(name = "idx_product", columnList = "productId")
       })
public class ShoppingCart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "session_id")
    private String sessionId;
    
    @Column(name = "product_id", nullable = false)
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    @Column(nullable = false)
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Default constructor
    public ShoppingCart() {}
    
    // Constructor for registered user cart
    public ShoppingCart(Long userId, Long productId, Integer quantity) {
        this.userId = userId;
        this.productId = productId;
        this.quantity = quantity;
    }
    
    // Constructor for guest user cart
    public ShoppingCart(String sessionId, Long productId, Integer quantity) {
        this.sessionId = sessionId;
        this.productId = productId;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper methods
    public boolean isUserCart() {
        return userId != null;
    }
    
    public boolean isGuestCart() {
        return sessionId != null && userId == null;
    }
    
    public String getCartIdentifier() {
        return userId != null ? "user:" + userId : "session:" + sessionId;
    }
    
    public void incrementQuantity(Integer amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount to increment must be positive");
        }
        this.quantity += amount;
    }
    
    public void decrementQuantity(Integer amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount to decrement must be positive");
        }
        if (this.quantity <= amount) {
            throw new IllegalArgumentException("Cannot decrement quantity below 1");
        }
        this.quantity -= amount;
    }
    
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.quantity = newQuantity;
    }
    
    @Override
    public String toString() {
        return "ShoppingCart{" +
                "id=" + id +
                ", userId=" + userId +
                ", sessionId='" + sessionId + '\'' +
                ", productId=" + productId +
                ", quantity=" + quantity +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}