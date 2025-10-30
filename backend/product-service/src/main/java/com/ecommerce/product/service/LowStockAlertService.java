package com.ecommerce.product.service;

import com.ecommerce.product.dto.InventoryResponse;
import com.ecommerce.product.entity.ProductInventory;
import com.ecommerce.product.repository.ProductInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LowStockAlertService {
    
    private static final Logger logger = LoggerFactory.getLogger(LowStockAlertService.class);
    
    @Autowired
    private ProductInventoryRepository inventoryRepository;
    
    /**
     * Get current low stock alerts
     */
    @Transactional(readOnly = true)
    public List<LowStockAlert> getCurrentLowStockAlerts() {
        List<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProducts();
        
        return lowStockInventories.stream()
                .map(this::createLowStockAlert)
                .collect(Collectors.toList());
    }
    
    /**
     * Get current out of stock alerts
     */
    @Transactional(readOnly = true)
    public List<OutOfStockAlert> getCurrentOutOfStockAlerts() {
        List<ProductInventory> outOfStockInventories = inventoryRepository.findOutOfStockProducts();
        
        return outOfStockInventories.stream()
                .map(this::createOutOfStockAlert)
                .collect(Collectors.toList());
    }
    
    /**
     * Check for low stock alerts and log them
     * This method runs every hour to check for low stock products
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 ms)
    @Async
    public void checkLowStockAlerts() {
        logger.info("Starting low stock alert check...");
        
        try {
            List<LowStockAlert> lowStockAlerts = getCurrentLowStockAlerts();
            List<OutOfStockAlert> outOfStockAlerts = getCurrentOutOfStockAlerts();
            
            if (!lowStockAlerts.isEmpty()) {
                logger.warn("Found {} products with low stock:", lowStockAlerts.size());
                for (LowStockAlert alert : lowStockAlerts) {
                    logger.warn("Low Stock Alert - Product ID: {}, SKU: {}, Name: {}, Available: {}, Reorder Level: {}",
                            alert.getProductId(), alert.getProductSku(), alert.getProductName(),
                            alert.getQuantityAvailable(), alert.getReorderLevel());
                }
            }
            
            if (!outOfStockAlerts.isEmpty()) {
                logger.error("Found {} products that are out of stock:", outOfStockAlerts.size());
                for (OutOfStockAlert alert : outOfStockAlerts) {
                    logger.error("Out of Stock Alert - Product ID: {}, SKU: {}, Name: {}",
                            alert.getProductId(), alert.getProductSku(), alert.getProductName());
                }
            }
            
            if (lowStockAlerts.isEmpty() && outOfStockAlerts.isEmpty()) {
                logger.info("No low stock or out of stock products found.");
            }
            
        } catch (Exception e) {
            logger.error("Error occurred while checking low stock alerts: {}", e.getMessage(), e);
        }
        
        logger.info("Low stock alert check completed.");
    }
    
    /**
     * Check for low stock alerts for a specific category
     */
    @Transactional(readOnly = true)
    public List<LowStockAlert> getLowStockAlertsByCategory(Long categoryId) {
        List<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProductsByCategory(categoryId);
        
        return lowStockInventories.stream()
                .map(this::createLowStockAlert)
                .collect(Collectors.toList());
    }
    
    /**
     * Check for low stock alerts for a specific brand
     */
    @Transactional(readOnly = true)
    public List<LowStockAlert> getLowStockAlertsByBrand(String brand) {
        List<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProductsByBrand(brand);
        
        return lowStockInventories.stream()
                .map(this::createLowStockAlert)
                .collect(Collectors.toList());
    }
    
    /**
     * Get alert summary statistics
     */
    @Transactional(readOnly = true)
    public AlertSummary getAlertSummary() {
        Long lowStockCount = inventoryRepository.countLowStockProducts();
        Long outOfStockCount = inventoryRepository.countOutOfStockProducts();
        
        return new AlertSummary(lowStockCount, outOfStockCount);
    }
    
    /**
     * Manually trigger low stock alert check
     */
    @Async
    public void triggerLowStockAlertCheck() {
        logger.info("Manually triggered low stock alert check");
        checkLowStockAlerts();
    }
    
    /**
     * Create a low stock alert from inventory
     */
    private LowStockAlert createLowStockAlert(ProductInventory inventory) {
        return new LowStockAlert(
                inventory.getProductId(),
                inventory.getProduct().getSku(),
                inventory.getProduct().getName(),
                inventory.getQuantityAvailable(),
                inventory.getReorderLevel(),
                inventory.getProduct().getCategory().getName(),
                inventory.getProduct().getBrand(),
                inventory.getLastUpdated()
        );
    }
    
    /**
     * Create an out of stock alert from inventory
     */
    private OutOfStockAlert createOutOfStockAlert(ProductInventory inventory) {
        return new OutOfStockAlert(
                inventory.getProductId(),
                inventory.getProduct().getSku(),
                inventory.getProduct().getName(),
                inventory.getProduct().getCategory().getName(),
                inventory.getProduct().getBrand(),
                inventory.getLastUpdated()
        );
    }
    
    /**
     * Low Stock Alert data class
     */
    public static class LowStockAlert {
        private Long productId;
        private String productSku;
        private String productName;
        private Integer quantityAvailable;
        private Integer reorderLevel;
        private String categoryName;
        private String brand;
        private java.time.LocalDateTime lastUpdated;
        
        public LowStockAlert(Long productId, String productSku, String productName, 
                           Integer quantityAvailable, Integer reorderLevel, String categoryName, 
                           String brand, java.time.LocalDateTime lastUpdated) {
            this.productId = productId;
            this.productSku = productSku;
            this.productName = productName;
            this.quantityAvailable = quantityAvailable;
            this.reorderLevel = reorderLevel;
            this.categoryName = categoryName;
            this.brand = brand;
            this.lastUpdated = lastUpdated;
        }
        
        // Getters
        public Long getProductId() { return productId; }
        public String getProductSku() { return productSku; }
        public String getProductName() { return productName; }
        public Integer getQuantityAvailable() { return quantityAvailable; }
        public Integer getReorderLevel() { return reorderLevel; }
        public String getCategoryName() { return categoryName; }
        public String getBrand() { return brand; }
        public java.time.LocalDateTime getLastUpdated() { return lastUpdated; }
        
        public String getAlertMessage() {
            return String.format("Product '%s' (SKU: %s) is low on stock. Available: %d, Reorder Level: %d",
                    productName, productSku, quantityAvailable, reorderLevel);
        }
    }
    
    /**
     * Out of Stock Alert data class
     */
    public static class OutOfStockAlert {
        private Long productId;
        private String productSku;
        private String productName;
        private String categoryName;
        private String brand;
        private java.time.LocalDateTime lastUpdated;
        
        public OutOfStockAlert(Long productId, String productSku, String productName, 
                             String categoryName, String brand, java.time.LocalDateTime lastUpdated) {
            this.productId = productId;
            this.productSku = productSku;
            this.productName = productName;
            this.categoryName = categoryName;
            this.brand = brand;
            this.lastUpdated = lastUpdated;
        }
        
        // Getters
        public Long getProductId() { return productId; }
        public String getProductSku() { return productSku; }
        public String getProductName() { return productName; }
        public String getCategoryName() { return categoryName; }
        public String getBrand() { return brand; }
        public java.time.LocalDateTime getLastUpdated() { return lastUpdated; }
        
        public String getAlertMessage() {
            return String.format("Product '%s' (SKU: %s) is out of stock", productName, productSku);
        }
    }
    
    /**
     * Alert Summary data class
     */
    public static class AlertSummary {
        private Long lowStockCount;
        private Long outOfStockCount;
        
        public AlertSummary(Long lowStockCount, Long outOfStockCount) {
            this.lowStockCount = lowStockCount;
            this.outOfStockCount = outOfStockCount;
        }
        
        // Getters
        public Long getLowStockCount() { return lowStockCount; }
        public Long getOutOfStockCount() { return outOfStockCount; }
        public Long getTotalAlerts() { return lowStockCount + outOfStockCount; }
    }
}