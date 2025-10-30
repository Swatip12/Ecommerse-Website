package com.ecommerce.order.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_status_history", indexes = {
    @Index(name = "idx_order", columnList = "order_id"),
    @Index(name = "idx_status", columnList = "newStatus"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
public class OrderStatusHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(name = "previous_status", length = 50)
    @Size(max = 50, message = "Previous status must not exceed 50 characters")
    private String previousStatus;
    
    @Column(name = "new_status", nullable = false, length = 50)
    @NotBlank(message = "New status is required")
    @Size(max = 50, message = "New status must not exceed 50 characters")
    private String newStatus;
    
    @Column(name = "changed_by")
    private Long changedBy;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Default constructor
    public OrderStatusHistory() {}
    
    // Constructor for status change
    public OrderStatusHistory(Order order, String previousStatus, String newStatus, Long changedBy) {
        this.order = order;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
    }
    
    // Constructor with notes
    public OrderStatusHistory(Order order, String previousStatus, String newStatus, Long changedBy, String notes) {
        this.order = order;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public String getPreviousStatus() {
        return previousStatus;
    }
    
    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }
    
    public String getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }
    
    public Long getChangedBy() {
        return changedBy;
    }
    
    public void setChangedBy(Long changedBy) {
        this.changedBy = changedBy;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // Helper methods
    public boolean isStatusUpgrade() {
        if (previousStatus == null) return true;
        
        try {
            OrderStatus prev = OrderStatus.valueOf(previousStatus);
            OrderStatus current = OrderStatus.valueOf(newStatus);
            
            // Define status progression order
            int prevOrder = getStatusOrder(prev);
            int currentOrder = getStatusOrder(current);
            
            return currentOrder > prevOrder;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    private int getStatusOrder(OrderStatus status) {
        return switch (status) {
            case PENDING -> 0;
            case CONFIRMED -> 1;
            case PROCESSING -> 2;
            case SHIPPED -> 3;
            case DELIVERED -> 4;
            case CANCELLED, REFUNDED -> -1; // Special cases
        };
    }
    
    public boolean isSystemChange() {
        return changedBy == null;
    }
    
    public boolean isUserChange() {
        return changedBy != null;
    }
    
    @Override
    public String toString() {
        return "OrderStatusHistory{" +
                "id=" + id +
                ", previousStatus='" + previousStatus + '\'' +
                ", newStatus='" + newStatus + '\'' +
                ", changedBy=" + changedBy +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                ", orderId=" + (order != null ? order.getId() : null) +
                '}';
    }
}