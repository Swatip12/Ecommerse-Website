package com.ecommerce.product.controller;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.dto.ProductSearchRequest;
import com.ecommerce.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        try {
            ProductResponse product = productService.getProductBySku(sku);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.updateProduct(id, request);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Page<ProductResponse> products = productService.getAllProducts(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(@RequestBody ProductSearchRequest searchRequest) {
        Page<ProductResponse> products = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProductsGet(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<String> brands,
            @RequestParam(required = false) String minPrice,
            @RequestParam(required = false) String maxPrice,
            @RequestParam(defaultValue = "false") Boolean inStockOnly,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        
        ProductSearchRequest searchRequest = new ProductSearchRequest();
        searchRequest.setSearchTerm(searchTerm);
        searchRequest.setCategoryIds(categoryIds);
        searchRequest.setBrands(brands);
        
        if (minPrice != null && !minPrice.isEmpty()) {
            searchRequest.setMinPrice(new java.math.BigDecimal(minPrice));
        }
        if (maxPrice != null && !maxPrice.isEmpty()) {
            searchRequest.setMaxPrice(new java.math.BigDecimal(maxPrice));
        }
        
        searchRequest.setInStockOnly(inStockOnly);
        searchRequest.setSortBy(sortBy);
        searchRequest.setSortDirection(sortDirection);
        searchRequest.setPage(page);
        searchRequest.setSize(size);
        
        Page<ProductResponse> products = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/category/{categoryId}/hierarchy")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategoryHierarchy(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Page<ProductResponse> products = productService.getProductsByCategoryHierarchy(categoryId, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/featured")
    public ResponseEntity<Page<ProductResponse>> getFeaturedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<ProductResponse> products = productService.getFeaturedProducts(page, size);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getAvailableBrands() {
        List<String> brands = productService.getAvailableBrands();
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/price-range")
    public ResponseEntity<Map<String, Object>> getPriceRange() {
        Object[] priceRange = productService.getPriceRange();
        Map<String, Object> response = new HashMap<>();
        response.put("minPrice", priceRange[0]);
        response.put("maxPrice", priceRange[1]);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/category/{categoryId}/count")
    public ResponseEntity<Map<String, Long>> getProductCountByCategory(@PathVariable Long categoryId) {
        Long count = productService.getProductCountByCategory(categoryId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Validate product availability for purchase
     */
    @PostMapping("/{id}/validate-availability")
    public ResponseEntity<Map<String, Object>> validateProductAvailability(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            productService.validateProductAvailability(id, quantity);
            Map<String, Object> response = new HashMap<>();
            response.put("available", true);
            response.put("message", "Product is available for purchase");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("available", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Check if product has sufficient quantity available
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkProductAvailability(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        boolean isAvailable = productService.isProductAvailable(id, quantity);
        Map<String, Object> response = new HashMap<>();
        response.put("available", isAvailable);
        response.put("productId", id);
        response.put("requestedQuantity", quantity);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Bulk delete products
     */
    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkDeleteProducts(@RequestBody List<Long> productIds) {
        try {
            int deletedCount = productService.bulkDeleteProducts(productIds);
            Map<String, Object> response = new HashMap<>();
            response.put("deletedCount", deletedCount);
            response.put("message", "Successfully deleted " + deletedCount + " products");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Bulk update product status (active/inactive)
     */
    @PutMapping("/bulk/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkUpdateProductStatus(
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> productIds = (List<Long>) request.get("productIds");
            Boolean isActive = (Boolean) request.get("isActive");
            
            int updatedCount = productService.bulkUpdateProductStatus(productIds, isActive);
            Map<String, Object> response = new HashMap<>();
            response.put("updatedCount", updatedCount);
            response.put("message", "Successfully updated " + updatedCount + " products");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Admin search - includes inactive products
     */
    @PostMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ProductResponse>> adminSearchProducts(@RequestBody ProductSearchRequest searchRequest) {
        Page<ProductResponse> products = productService.adminSearchProducts(searchRequest);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Export products to CSV
     */
    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportProductsToCSV(
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) Boolean isActive) {
        try {
            String csvData = productService.exportProductsToCSV(categoryIds, isActive);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=products.csv")
                    .body(csvData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}