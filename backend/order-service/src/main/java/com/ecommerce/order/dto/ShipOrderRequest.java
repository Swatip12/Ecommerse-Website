package com.ecommerce.order.dto;

public class ShipOrderRequest {
    private String trackingNumber;
    private String carrier;
    private String shippingMethod;
    private String notes;
    
    public ShipOrderRequest() {}
    
    public ShipOrderRequest(String trackingNumber, String carrier, String shippingMethod, String notes) {
        this.trackingNumber = trackingNumber;
        this.carrier = carrier;
        this.shippingMethod = shippingMethod;
        this.notes = notes;
    }
    
    public String getTrackingNumber() {
        return trackingNumber;
    }
    
    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }
    
    public String getCarrier() {
        return carrier;
    }
    
    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }
    
    public String getShippingMethod() {
        return shippingMethod;
    }
    
    public void setShippingMethod(String shippingMethod) {
        this.shippingMethod = shippingMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}