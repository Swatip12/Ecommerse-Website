package com.ecommerce.order.dto;

import java.time.LocalDateTime;

public class OrderStatusHistoryDto {
    
    private Long id;
    private Long orderId;
    private String previousStatus;
    private String newStatus;
    private Long changedBy;
    private String notes;
    private LocalDateTime createdAt;
    private boolean isStatusUpgrade;
    private boolean isSystemChange;
    
    // Default constructor
    public OrderStatusHistoryDto() {}
    
    // Constructor
    public OrderStatusHistoryDto(Long id, Long orderId, String previousStatus, String newStatus,
                                Long changedBy, String notes, LocalDateTime createdAt,
                                boolean isStatusUpgrade, boolean isSystemChange) {
        this.id = id;
        this.orderId = orderId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.notes = notes;
        this.createdAt = createdAt;
        this.isStatusUpgrade = isStatusUpgrade;
        this.isSystemChange = isSystemChange;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
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
    
    public boolean isStatusUpgrade() {
        return isStatusUpgrade;
    }
    
    public void setStatusUpgrade(boolean statusUpgrade) {
        isStatusUpgrade = statusUpgrade;
    }
    
    public boolean isSystemChange() {
        return isSystemChange;
    }
    
    public void setSystemChange(boolean systemChange) {
        isSystemChange = systemChange;
    }
    
    @Override
    public String toString() {
        return "OrderStatusHistoryDto{" +
                "id=" + id +
                ", orderId=" + orderId +
                ", previousStatus='" + previousStatus + '\'' +
                ", newStatus='" + newStatus + '\'' +
                ", changedBy=" + changedBy +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                ", isStatusUpgrade=" + isStatusUpgrade +
                ", isSystemChange=" + isSystemChange +
                '}';
    }
}