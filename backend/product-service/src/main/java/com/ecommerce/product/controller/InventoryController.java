package com.ecommerce.product.controller;

import com.ecommerce.product.dto.*;
import com.ecommerce.product.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    
    /**
     * Get inventory information for a specific product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse> getInventoryByProductId(@PathVariable Long productId) {
        try {
            InventoryResponse inventory = inventoryService.getInventoryByProductId(productId);
            return ResponseEntity.ok(inventory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update inventory quantity for a product (Admin only)
     */
    @PutMapping("/product/{productId}/quantity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> updateInventoryQuantity(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryUpdateRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.updateInventoryQuantity(productId, request.getQuantity());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Add stock to existing inventory (Admin only)
     */
    @PostMapping("/product/{productId}/add-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> addStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.addStock(productId, request.getQuantity());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Remove stock from existing inventory (Admin only)
     */
    @PostMapping("/product/{productId}/remove-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> removeStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.removeStock(productId, request.getQuantity());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Reserve quantity for order processing (Internal use)
     */
    @PostMapping("/product/{productId}/reserve")
    public ResponseEntity<InventoryResponse> reserveQuantity(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.reserveQuantity(productId, request.getQuantity());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Release reserved quantity back to available stock (Internal use)
     */
    @PostMapping("/product/{productId}/release")
    public ResponseEntity<InventoryResponse> releaseReservedQuantity(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.releaseReservedQuantity(productId, request.getQuantity());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Confirm reserved quantity (Internal use)
     */
    @PostMapping("/product/{productId}/confirm")
    public ResponseEntity<InventoryResponse> confirmReservedQuantity(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.confirmReservedQuantity(productId, request.getQuantity());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update reorder level for a product (Admin only)
     */
    @PutMapping("/product/{productId}/reorder-level")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> updateReorderLevel(
            @PathVariable Long productId,
            @Valid @RequestBody ReorderLevelRequest request) {
        try {
            InventoryResponse updatedInventory = inventoryService.updateReorderLevel(productId, request.getReorderLevel());
            return ResponseEntity.ok(updatedInventory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Check if product has sufficient quantity available
     */
    @GetMapping("/product/{productId}/availability")
    public ResponseEntity<Boolean> checkQuantityAvailability(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        boolean isAvailable = inventoryService.isQuantityAvailable(productId, quantity);
        return ResponseEntity.ok(isAvailable);
    }
    
    /**
     * Validate product availability for purchase
     */
    @PostMapping("/product/{productId}/validate")
    public ResponseEntity<String> validateProductAvailability(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        try {
            inventoryService.validateProductAvailability(productId, quantity);
            return ResponseEntity.ok("Product is available for purchase");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Get all products with low stock (Admin only)
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryResponse>> getLowStockProducts() {
        List<InventoryResponse> lowStockProducts = inventoryService.getLowStockProducts();
        return ResponseEntity.ok(lowStockProducts);
    }
    
    /**
     * Get low stock products with pagination (Admin only)
     */
    @GetMapping("/low-stock/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<InventoryResponse>> getLowStockProductsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "quantityAvailable") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        Page<InventoryResponse> lowStockProducts = inventoryService.getLowStockProducts(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(lowStockProducts);
    }
    
    /**
     * Get all out of stock products (Admin only)
     */
    @GetMapping("/out-of-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryResponse>> getOutOfStockProducts() {
        List<InventoryResponse> outOfStockProducts = inventoryService.getOutOfStockProducts();
        return ResponseEntity.ok(outOfStockProducts);
    }
    
    /**
     * Get out of stock products with pagination (Admin only)
     */
    @GetMapping("/out-of-stock/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<InventoryResponse>> getOutOfStockProductsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "lastUpdated") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Page<InventoryResponse> outOfStockProducts = inventoryService.getOutOfStockProducts(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(outOfStockProducts);
    }
    
    /**
     * Get low stock products by category (Admin only)
     */
    @GetMapping("/low-stock/category/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryResponse>> getLowStockProductsByCategory(@PathVariable Long categoryId) {
        List<InventoryResponse> lowStockProducts = inventoryService.getLowStockProductsByCategory(categoryId);
        return ResponseEntity.ok(lowStockProducts);
    }
    
    /**
     * Get low stock products by brand (Admin only)
     */
    @GetMapping("/low-stock/brand/{brand}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryResponse>> getLowStockProductsByBrand(@PathVariable String brand) {
        List<InventoryResponse> lowStockProducts = inventoryService.getLowStockProductsByBrand(brand);
        return ResponseEntity.ok(lowStockProducts);
    }
    
    /**
     * Get inventory statistics (Admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryService.InventoryStatistics> getInventoryStatistics() {
        InventoryService.InventoryStatistics statistics = inventoryService.getInventoryStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Create inventory for a new product (Admin only)
     */
    @PostMapping("/product/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> createInventory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") Integer initialQuantity,
            @RequestParam(defaultValue = "10") Integer reorderLevel) {
        try {
            InventoryResponse inventory = inventoryService.createInventory(productId, initialQuantity, reorderLevel);
            return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}