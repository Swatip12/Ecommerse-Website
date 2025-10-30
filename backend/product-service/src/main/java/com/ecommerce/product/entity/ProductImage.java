package com.ecommerce.product.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_images", indexes = {
    @Index(name = "idx_product_order", columnList = "product_id, displayOrder"),
    @Index(name = "idx_product_primary", columnList = "product_id, isPrimary")
})
public class ProductImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "image_url", nullable = false, length = 500)
    @NotBlank(message = "Image URL is required")
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    @Column(name = "alt_text")
    @Size(max = 255, message = "Alt text must not exceed 255 characters")
    private String altText;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Default constructor
    public ProductImage() {}
    
    // Constructor for creating new product images
    public ProductImage(Product product, String imageUrl, String altText) {
        this.product = product;
        this.imageUrl = imageUrl;
        this.altText = altText;
    }
    
    // Constructor with display order
    public ProductImage(Product product, String imageUrl, String altText, Integer displayOrder) {
        this.product = product;
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.displayOrder = displayOrder;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
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
    
    // Helper methods
    public String getFileName() {
        if (imageUrl == null) return null;
        int lastSlash = imageUrl.lastIndexOf('/');
        return lastSlash >= 0 ? imageUrl.substring(lastSlash + 1) : imageUrl;
    }
    
    public String getFileExtension() {
        String fileName = getFileName();
        if (fileName == null) return null;
        int lastDot = fileName.lastIndexOf('.');
        return lastDot >= 0 ? fileName.substring(lastDot + 1).toLowerCase() : null;
    }
    
    public boolean isImageFile() {
        String extension = getFileExtension();
        return extension != null && 
               (extension.equals("jpg") || extension.equals("jpeg") || 
                extension.equals("png") || extension.equals("gif") || 
                extension.equals("webp") || extension.equals("svg"));
    }
    
    @Override
    public String toString() {
        return "ProductImage{" +
                "id=" + id +
                ", imageUrl='" + imageUrl + '\'' +
                ", altText='" + altText + '\'' +
                ", displayOrder=" + displayOrder +
                ", isPrimary=" + isPrimary +
                ", productId=" + (product != null ? product.getId() : null) +
                '}';
    }
}