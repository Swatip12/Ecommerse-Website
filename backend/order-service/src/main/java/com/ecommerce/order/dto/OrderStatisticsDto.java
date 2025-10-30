package com.ecommerce.order.dto;

import java.math.BigDecimal;
import java.util.Map;

public class OrderStatisticsDto {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long pendingOrders;
    private long processingOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long refundedOrders;
    private BigDecimal averageOrderValue;
    private Map<String, Long> ordersByStatus;
    private Map<String, BigDecimal> revenueByStatus;
    
    public OrderStatisticsDto() {}
    
    public long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public long getPendingOrders() {
        return pendingOrders;
    }
    
    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }
    
    public long getProcessingOrders() {
        return processingOrders;
    }
    
    public void setProcessingOrders(long processingOrders) {
        this.processingOrders = processingOrders;
    }
    
    public long getShippedOrders() {
        return shippedOrders;
    }
    
    public void setShippedOrders(long shippedOrders) {
        this.shippedOrders = shippedOrders;
    }
    
    public long getDeliveredOrders() {
        return deliveredOrders;
    }
    
    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }
    
    public long getCancelledOrders() {
        return cancelledOrders;
    }
    
    public void setCancelledOrders(long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
    
    public long getRefundedOrders() {
        return refundedOrders;
    }
    
    public void setRefundedOrders(long refundedOrders) {
        this.refundedOrders = refundedOrders;
    }
    
    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }
    
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }
    
    public Map<String, BigDecimal> getRevenueByStatus() {
        return revenueByStatus;
    }
    
    public void setRevenueByStatus(Map<String, BigDecimal> revenueByStatus) {
        this.revenueByStatus = revenueByStatus;
    }
}