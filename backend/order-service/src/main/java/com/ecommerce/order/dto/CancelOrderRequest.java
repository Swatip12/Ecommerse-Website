package com.ecommerce.order.dto;

public class CancelOrderRequest {
    private String reason;
    private boolean refundPayment;
    private String notes;
    
    public CancelOrderRequest() {}
    
    public CancelOrderRequest(String reason, boolean refundPayment, String notes) {
        this.reason = reason;
        this.refundPayment = refundPayment;
        this.notes = notes;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public boolean isRefundPayment() {
        return refundPayment;
    }
    
    public void setRefundPayment(boolean refundPayment) {
        this.refundPayment = refundPayment;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}