package com.ecommerce.product.service;

import com.ecommerce.product.dto.InventoryResponse;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductInventory;
import com.ecommerce.product.repository.ProductInventoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryService {
    
    @Autowired
    private ProductInventoryRepository inventoryRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Get inventory information for a specific product
     */
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        return new InventoryResponse(inventory);
    }
    
    /**
     * Update inventory quantity for a product
     */
    public InventoryResponse updateInventoryQuantity(Long productId, Integer newQuantity) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Inventory quantity cannot be negative");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        inventory.setQuantityAvailable(newQuantity);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Add stock to existing inventory
     */
    public InventoryResponse addStock(Long productId, Integer quantityToAdd) {
        if (quantityToAdd <= 0) {
            throw new IllegalArgumentException("Quantity to add must be positive");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        inventory.addStock(quantityToAdd);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Remove stock from existing inventory
     */
    public InventoryResponse removeStock(Long productId, Integer quantityToRemove) {
        if (quantityToRemove <= 0) {
            throw new IllegalArgumentException("Quantity to remove must be positive");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        inventory.removeStock(quantityToRemove);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Reserve quantity for order processing
     */
    public InventoryResponse reserveQuantity(Long productId, Integer quantityToReserve) {
        if (quantityToReserve <= 0) {
            throw new IllegalArgumentException("Quantity to reserve must be positive");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        if (!inventory.canReserve(quantityToReserve)) {
            throw new RuntimeException("Insufficient quantity available for reservation. Available: " + 
                    inventory.getQuantityAvailable() + ", Requested: " + quantityToReserve);
        }
        
        inventory.reserveQuantity(quantityToReserve);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Release reserved quantity back to available stock
     */
    public InventoryResponse releaseReservedQuantity(Long productId, Integer quantityToRelease) {
        if (quantityToRelease <= 0) {
            throw new IllegalArgumentException("Quantity to release must be positive");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        inventory.releaseReservedQuantity(quantityToRelease);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Confirm reserved quantity (remove from reserved, don't add back to available)
     */
    public InventoryResponse confirmReservedQuantity(Long productId, Integer quantityToConfirm) {
        if (quantityToConfirm <= 0) {
            throw new IllegalArgumentException("Quantity to confirm must be positive");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        inventory.confirmReservedQuantity(quantityToConfirm);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Update reorder level for a product
     */
    public InventoryResponse updateReorderLevel(Long productId, Integer newReorderLevel) {
        if (newReorderLevel < 0) {
            throw new IllegalArgumentException("Reorder level cannot be negative");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        inventory.setReorderLevel(newReorderLevel);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Check if product has sufficient quantity available
     */
    @Transactional(readOnly = true)
    public boolean isQuantityAvailable(Long productId, Integer requiredQuantity) {
        Boolean hasQuantity = inventoryRepository.hasAvailableQuantity(productId, requiredQuantity);
        return hasQuantity != null && hasQuantity;
    }
    
    /**
     * Validate product availability for purchase
     */
    @Transactional(readOnly = true)
    public void validateProductAvailability(Long productId, Integer requestedQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is not active and cannot be purchased");
        }
        
        ProductInventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product id: " + productId));
        
        if (!inventory.isInStock()) {
            throw new RuntimeException("Product is out of stock");
        }
        
        if (!inventory.canReserve(requestedQuantity)) {
            throw new RuntimeException("Insufficient quantity available. Available: " + 
                    inventory.getQuantityAvailable() + ", Requested: " + requestedQuantity);
        }
    }
    
    /**
     * Get all products with low stock
     */
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockProducts() {
        List<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProducts();
        return lowStockInventories.stream()
                .map(InventoryResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get low stock products with pagination
     */
    @Transactional(readOnly = true)
    public Page<InventoryResponse> getLowStockProducts(int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProducts(pageable);
        return lowStockInventories.map(InventoryResponse::new);
    }
    
    /**
     * Get all out of stock products
     */
    @Transactional(readOnly = true)
    public List<InventoryResponse> getOutOfStockProducts() {
        List<ProductInventory> outOfStockInventories = inventoryRepository.findOutOfStockProducts();
        return outOfStockInventories.stream()
                .map(InventoryResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get out of stock products with pagination
     */
    @Transactional(readOnly = true)
    public Page<InventoryResponse> getOutOfStockProducts(int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ProductInventory> outOfStockInventories = inventoryRepository.findOutOfStockProducts(pageable);
        return outOfStockInventories.map(InventoryResponse::new);
    }
    
    /**
     * Get low stock products by category
     */
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockProductsByCategory(Long categoryId) {
        List<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProductsByCategory(categoryId);
        return lowStockInventories.stream()
                .map(InventoryResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get low stock products by brand
     */
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockProductsByBrand(String brand) {
        List<ProductInventory> lowStockInventories = inventoryRepository.findLowStockProductsByBrand(brand);
        return lowStockInventories.stream()
                .map(InventoryResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get inventory statistics
     */
    @Transactional(readOnly = true)
    public InventoryStatistics getInventoryStatistics() {
        Long lowStockCount = inventoryRepository.countLowStockProducts();
        Long outOfStockCount = inventoryRepository.countOutOfStockProducts();
        Double totalInventoryValue = inventoryRepository.getTotalInventoryValue();
        
        return new InventoryStatistics(lowStockCount, outOfStockCount, totalInventoryValue);
    }
    
    /**
     * Create inventory for a new product
     */
    public InventoryResponse createInventory(Long productId, Integer initialQuantity, Integer reorderLevel) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Check if inventory already exists
        if (inventoryRepository.findByProductId(productId).isPresent()) {
            throw new RuntimeException("Inventory already exists for product id: " + productId);
        }
        
        ProductInventory inventory = new ProductInventory(product, initialQuantity, reorderLevel);
        ProductInventory savedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(savedInventory);
    }
    
    /**
     * Inner class for inventory statistics
     */
    public static class InventoryStatistics {
        private Long lowStockCount;
        private Long outOfStockCount;
        private Double totalInventoryValue;
        
        public InventoryStatistics(Long lowStockCount, Long outOfStockCount, Double totalInventoryValue) {
            this.lowStockCount = lowStockCount;
            this.outOfStockCount = outOfStockCount;
            this.totalInventoryValue = totalInventoryValue != null ? totalInventoryValue : 0.0;
        }
        
        // Getters
        public Long getLowStockCount() { return lowStockCount; }
        public Long getOutOfStockCount() { return outOfStockCount; }
        public Double getTotalInventoryValue() { return totalInventoryValue; }
    }
}