package com.ecommerce.order.dto;

public class FulfillOrderRequest {
    private String warehouseLocation;
    private String fulfillmentMethod;
    private String notes;
    
    public FulfillOrderRequest() {}
    
    public FulfillOrderRequest(String warehouseLocation, String fulfillmentMethod, String notes) {
        this.warehouseLocation = warehouseLocation;
        this.fulfillmentMethod = fulfillmentMethod;
        this.notes = notes;
    }
    
    public String getWarehouseLocation() {
        return warehouseLocation;
    }
    
    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }
    
    public String getFulfillmentMethod() {
        return fulfillmentMethod;
    }
    
    public void setFulfillmentMethod(String fulfillmentMethod) {
        this.fulfillmentMethod = fulfillmentMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}