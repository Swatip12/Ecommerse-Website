package com.ecommerce.product.dto;

import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductImage;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private CategoryResponse category;
    private String brand;
    private BigDecimal weight;
    private String dimensions;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private InventoryResponse inventory;
    private List<ProductImageResponse> images;
    
    // Default constructor
    public ProductResponse() {}
    
    // Constructor from Product entity
    public ProductResponse(Product product) {
        this.id = product.getId();
        this.sku = product.getSku();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.category = product.getCategory() != null ? new CategoryResponse(product.getCategory()) : null;
        this.brand = product.getBrand();
        this.weight = product.getWeight();
        this.dimensions = product.getDimensions();
        this.isActive = product.getIsActive();
        this.createdAt = product.getCreatedAt();
        this.updatedAt = product.getUpdatedAt();
        this.inventory = product.getInventory() != null ? new InventoryResponse(product.getInventory()) : null;
        this.images = product.getImages().stream()
                .map(ProductImageResponse::new)
                .collect(Collectors.toList());
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSku() {
        return sku;
    }
    
    public void setSku(String sku) {
        this.sku = sku;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public CategoryResponse getCategory() {
        return category;
    }
    
    public void setCategory(CategoryResponse category) {
        this.category = category;
    }
    
    public String getBrand() {
        return brand;
    }
    
    public void setBrand(String brand) {
        this.brand = brand;
    }
    
    public BigDecimal getWeight() {
        return weight;
    }
    
    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
    
    public String getDimensions() {
        return dimensions;
    }
    
    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public InventoryResponse getInventory() {
        return inventory;
    }
    
    public void setInventory(InventoryResponse inventory) {
        this.inventory = inventory;
    }
    
    public List<ProductImageResponse> getImages() {
        return images;
    }
    
    public void setImages(List<ProductImageResponse> images) {
        this.images = images;
    }
    
    // Helper methods
    public String getPrimaryImageUrl() {
        return images.stream()
                .filter(ProductImageResponse::getIsPrimary)
                .map(ProductImageResponse::getImageUrl)
                .findFirst()
                .orElse(null);
    }
    
    public boolean isAvailable() {
        return isActive && inventory != null && inventory.getQuantityAvailable() > 0;
    }
    
    public boolean isInStock() {
        return inventory != null && inventory.getQuantityAvailable() > 0;
    }
    
    public int getAvailableQuantity() {
        return inventory != null ? inventory.getQuantityAvailable() : 0;
    }
}