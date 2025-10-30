package com.ecommerce.product.dto;

import com.ecommerce.product.entity.ProductImage;

import java.time.LocalDateTime;

public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    
    // Default constructor
    public ProductImageResponse() {}
    
    // Constructor from ProductImage entity
    public ProductImageResponse(ProductImage image) {
        this.id = image.getId();
        this.imageUrl = image.getImageUrl();
        this.altText = image.getAltText();
        this.displayOrder = image.getDisplayOrder();
        this.isPrimary = image.getIsPrimary();
        this.createdAt = image.getCreatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getAltText() {
        return altText;
    }
    
    public void setAltText(String altText) {
        this.altText = altText;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    
    public Boolean getIsPrimary() {
        return isPrimary;
    }
    
    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}