package com.ecommerce.product.dto;

import java.math.BigDecimal;
import java.util.Map;

public class InventoryStatisticsDto {
    private long totalProducts;
    private long activeProducts;
    private long inactiveProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private BigDecimal totalInventoryValue;
    private Map<String, Long> productsByCategory;
    private Map<String, BigDecimal> inventoryValueByCategory;
    
    public InventoryStatisticsDto() {}
    
    public long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public long getActiveProducts() {
        return activeProducts;
    }
    
    public void setActiveProducts(long activeProducts) {
        this.activeProducts = activeProducts;
    }
    
    public long getInactiveProducts() {
        return inactiveProducts;
    }
    
    public void setInactiveProducts(long inactiveProducts) {
        this.inactiveProducts = inactiveProducts;
    }
    
    public long getLowStockProducts() {
        return lowStockProducts;
    }
    
    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
    
    public long getOutOfStockProducts() {
        return outOfStockProducts;
    }
    
    public void setOutOfStockProducts(long outOfStockProducts) {
        this.outOfStockProducts = outOfStockProducts;
    }
    
    public BigDecimal getTotalInventoryValue() {
        return totalInventoryValue;
    }
    
    public void setTotalInventoryValue(BigDecimal totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }
    
    public Map<String, Long> getProductsByCategory() {
        return productsByCategory;
    }
    
    public void setProductsByCategory(Map<String, Long> productsByCategory) {
        this.productsByCategory = productsByCategory;
    }
    
    public Map<String, BigDecimal> getInventoryValueByCategory() {
        return inventoryValueByCategory;
    }
    
    public void setInventoryValueByCategory(Map<String, BigDecimal> inventoryValueByCategory) {
        this.inventoryValueByCategory = inventoryValueByCategory;
    }
}