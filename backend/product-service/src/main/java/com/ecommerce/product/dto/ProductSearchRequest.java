package com.ecommerce.product.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductSearchRequest {
    private String searchTerm;
    private List<Long> categoryIds;
    private List<String> brands;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean inStockOnly = false;
    private String sortBy = "name"; // name, price, createdAt
    private String sortDirection = "asc"; // asc, desc
    private Integer page = 0;
    private Integer size = 20;
    
    // Default constructor
    public ProductSearchRequest() {}
    
    // Getters and Setters
    public String getSearchTerm() {
        return searchTerm;
    }
    
    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }
    
    public List<Long> getCategoryIds() {
        return categoryIds;
    }
    
    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }
    
    public List<String> getBrands() {
        return brands;
    }
    
    public void setBrands(List<String> brands) {
        this.brands = brands;
    }
    
    public BigDecimal getMinPrice() {
        return minPrice;
    }
    
    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }
    
    public BigDecimal getMaxPrice() {
        return maxPrice;
    }
    
    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }
    
    public Boolean getInStockOnly() {
        return inStockOnly;
    }
    
    public void setInStockOnly(Boolean inStockOnly) {
        this.inStockOnly = inStockOnly;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
    
    public String getSortDirection() {
        return sortDirection;
    }
    
    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page;
    }
    
    public Integer getSize() {
        return size;
    }
    
    public void setSize(Integer size) {
        this.size = size;
    }
    
    // Helper methods
    public boolean hasSearchTerm() {
        return searchTerm != null && !searchTerm.trim().isEmpty();
    }
    
    public boolean hasCategoryFilter() {
        return categoryIds != null && !categoryIds.isEmpty();
    }
    
    public boolean hasBrandFilter() {
        return brands != null && !brands.isEmpty();
    }
    
    public boolean hasPriceFilter() {
        return minPrice != null || maxPrice != null;
    }
}