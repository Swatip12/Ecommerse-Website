package com.ecommerce.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateOrderRequest {
    
    @NotNull(message = "Shipping address ID is required")
    private Long shippingAddressId;
    
    private Long billingAddressId; // Optional, can use shipping address
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    @Valid
    @NotNull(message = "Order items are required")
    @Size(min = 1, message = "At least one order item is required")
    private List<CreateOrderItemRequest> items;
    
    // Default constructor
    public CreateOrderRequest() {}
    
    // Constructor
    public CreateOrderRequest(Long shippingAddressId, Long billingAddressId, String notes, List<CreateOrderItemRequest> items) {
        this.shippingAddressId = shippingAddressId;
        this.billingAddressId = billingAddressId;
        this.notes = notes;
        this.items = items;
    }
    
    // Getters and Setters
    public Long getShippingAddressId() {
        return shippingAddressId;
    }
    
    public void setShippingAddressId(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }
    
    public Long getBillingAddressId() {
        return billingAddressId;
    }
    
    public void setBillingAddressId(Long billingAddressId) {
        this.billingAddressId = billingAddressId;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<CreateOrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<CreateOrderItemRequest> items) {
        this.items = items;
    }
    
    @Override
    public String toString() {
        return "CreateOrderRequest{" +
                "shippingAddressId=" + shippingAddressId +
                ", billingAddressId=" + billingAddressId +
                ", notes='" + notes + '\'' +
                ", items=" + items +
                '}';
    }
}