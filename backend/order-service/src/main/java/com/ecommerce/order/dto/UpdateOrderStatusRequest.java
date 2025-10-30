package com.ecommerce.order.dto;

import com.ecommerce.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateOrderStatusRequest {
    
    @NotNull(message = "New status is required")
    private OrderStatus newStatus;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    // Default constructor
    public UpdateOrderStatusRequest() {}
    
    // Constructor
    public UpdateOrderStatusRequest(OrderStatus newStatus, String notes) {
        this.newStatus = newStatus;
        this.notes = notes;
    }
    
    // Getters and Setters
    public OrderStatus getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "UpdateOrderStatusRequest{" +
                "newStatus=" + newStatus +
                ", notes='" + notes + '\'' +
                '}';
    }
}