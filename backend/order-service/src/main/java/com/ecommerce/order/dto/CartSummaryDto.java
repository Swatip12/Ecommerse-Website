package com.ecommerce.order.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartSummaryDto {
    
    private List<CartItemDto> items;
    private int totalItems;
    private int totalQuantity;
    private BigDecimal subtotal;
    private BigDecimal estimatedTax;
    private BigDecimal estimatedShipping;
    private BigDecimal estimatedTotal;
    private String currency;
    
    // Default constructor
    public CartSummaryDto() {
        this.currency = "USD";
        this.subtotal = BigDecimal.ZERO;
        this.estimatedTax = BigDecimal.ZERO;
        this.estimatedShipping = BigDecimal.ZERO;
        this.estimatedTotal = BigDecimal.ZERO;
    }
    
    // Constructor with items
    public CartSummaryDto(List<CartItemDto> items) {
        this();
        this.items = items;
        calculateTotals();
    }
    
    // Getters and Setters
    public List<CartItemDto> getItems() {
        return items;
    }
    
    public void setItems(List<CartItemDto> items) {
        this.items = items;
        calculateTotals();
    }
    
    public int getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
    
    public int getTotalQuantity() {
        return totalQuantity;
    }
    
    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
        calculateEstimatedTotal();
    }
    
    public BigDecimal getEstimatedTax() {
        return estimatedTax;
    }
    
    public void setEstimatedTax(BigDecimal estimatedTax) {
        this.estimatedTax = estimatedTax;
        calculateEstimatedTotal();
    }
    
    public BigDecimal getEstimatedShipping() {
        return estimatedShipping;
    }
    
    public void setEstimatedShipping(BigDecimal estimatedShipping) {
        this.estimatedShipping = estimatedShipping;
        calculateEstimatedTotal();
    }
    
    public BigDecimal getEstimatedTotal() {
        return estimatedTotal;
    }
    
    public void setEstimatedTotal(BigDecimal estimatedTotal) {
        this.estimatedTotal = estimatedTotal;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    // Helper methods
    private void calculateTotals() {
        if (items == null || items.isEmpty()) {
            this.totalItems = 0;
            this.totalQuantity = 0;
            this.subtotal = BigDecimal.ZERO;
        } else {
            this.totalItems = items.size();
            this.totalQuantity = items.stream()
                    .mapToInt(CartItemDto::getQuantity)
                    .sum();
            this.subtotal = items.stream()
                    .map(item -> item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        calculateEstimatedTotal();
    }
    
    private void calculateEstimatedTotal() {
        this.estimatedTotal = subtotal.add(estimatedTax).add(estimatedShipping);
    }
    
    public boolean isEmpty() {
        return items == null || items.isEmpty();
    }
    
    public boolean hasItems() {
        return !isEmpty();
    }
    
    @Override
    public String toString() {
        return "CartSummaryDto{" +
                "totalItems=" + totalItems +
                ", totalQuantity=" + totalQuantity +
                ", subtotal=" + subtotal +
                ", estimatedTax=" + estimatedTax +
                ", estimatedShipping=" + estimatedShipping +
                ", estimatedTotal=" + estimatedTotal +
                ", currency='" + currency + '\'' +
                '}';
    }
}