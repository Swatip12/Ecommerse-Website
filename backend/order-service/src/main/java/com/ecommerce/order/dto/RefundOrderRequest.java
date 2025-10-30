package com.ecommerce.order.dto;

import java.math.BigDecimal;

public class RefundOrderRequest {
    private BigDecimal refundAmount;
    private String reason;
    private String refundMethod;
    private String notes;
    
    public RefundOrderRequest() {}
    
    public RefundOrderRequest(BigDecimal refundAmount, String reason, String refundMethod, String notes) {
        this.refundAmount = refundAmount;
        this.reason = reason;
        this.refundMethod = refundMethod;
        this.notes = notes;
    }
    
    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
    
    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getRefundMethod() {
        return refundMethod;
    }
    
    public void setRefundMethod(String refundMethod) {
        this.refundMethod = refundMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}