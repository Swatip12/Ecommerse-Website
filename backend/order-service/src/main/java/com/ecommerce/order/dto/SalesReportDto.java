package com.ecommerce.order.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class SalesReportDto {
    private String period;
    private BigDecimal totalSales;
    private long totalOrders;
    private BigDecimal averageOrderValue;
    private List<TopProductDto> topProducts;
    private Map<String, BigDecimal> salesByCategory;
    private List<SalesTrendDataDto> salesTrend;
    
    public SalesReportDto() {}
    
    public SalesReportDto(String period, BigDecimal totalSales, long totalOrders, 
                         BigDecimal averageOrderValue, List<TopProductDto> topProducts,
                         Map<String, BigDecimal> salesByCategory, List<SalesTrendDataDto> salesTrend) {
        this.period = period;
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.averageOrderValue = averageOrderValue;
        this.topProducts = topProducts;
        this.salesByCategory = salesByCategory;
        this.salesTrend = salesTrend;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public BigDecimal getTotalSales() {
        return totalSales;
    }
    
    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }
    
    public long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public List<TopProductDto> getTopProducts() {
        return topProducts;
    }
    
    public void setTopProducts(List<TopProductDto> topProducts) {
        this.topProducts = topProducts;
    }
    
    public Map<String, BigDecimal> getSalesByCategory() {
        return salesByCategory;
    }
    
    public void setSalesByCategory(Map<String, BigDecimal> salesByCategory) {
        this.salesByCategory = salesByCategory;
    }
    
    public List<SalesTrendDataDto> getSalesTrend() {
        return salesTrend;
    }
    
    public void setSalesTrend(List<SalesTrendDataDto> salesTrend) {
        this.salesTrend = salesTrend;
    }
    
    public static class TopProductDto {
        private Long productId;
        private String productName;
        private long quantitySold;
        private BigDecimal revenue;
        
        public TopProductDto() {}
        
        public TopProductDto(Long productId, String productName, long quantitySold, BigDecimal revenue) {
            this.productId = productId;
            this.productName = productName;
            this.quantitySold = quantitySold;
            this.revenue = revenue;
        }
        
        public Long getProductId() {
            return productId;
        }
        
        public void setProductId(Long productId) {
            this.productId = productId;
        }
        
        public String getProductName() {
            return productName;
        }
        
        public void setProductName(String productName) {
            this.productName = productName;
        }
        
        public long getQuantitySold() {
            return quantitySold;
        }
        
        public void setQuantitySold(long quantitySold) {
            this.quantitySold = quantitySold;
        }
        
        public BigDecimal getRevenue() {
            return revenue;
        }
        
        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
    
    public static class SalesTrendDataDto {
        private String date;
        private BigDecimal sales;
        private long orders;
        
        public SalesTrendDataDto() {}
        
        public SalesTrendDataDto(String date, BigDecimal sales, long orders) {
            this.date = date;
            this.sales = sales;
            this.orders = orders;
        }
        
        public String getDate() {
            return date;
        }
        
        public void setDate(String date) {
            this.date = date;
        }
        
        public BigDecimal getSales() {
            return sales;
        }
        
        public void setSales(BigDecimal sales) {
            this.sales = sales;
        }
        
        public long getOrders() {
            return orders;
        }
        
        public void setOrders(long orders) {
            this.orders = orders;
        }
    }
}