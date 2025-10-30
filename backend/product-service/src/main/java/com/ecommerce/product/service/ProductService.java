package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.dto.ProductSearchRequest;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductInventory;
import com.ecommerce.product.repository.CategoryRepository;
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
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
        
        // Check if SKU already exists
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }
        
        Product product = new Product();
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setIsActive(request.getIsActive());
        
        // Create default inventory
        ProductInventory inventory = new ProductInventory(product, 0);
        product.setInventory(inventory);
        
        Product savedProduct = productRepository.save(product);
        return new ProductResponse(savedProduct);
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return new ProductResponse(product);
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return new ProductResponse(product);
    }
    
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Check if SKU is being changed and if new SKU already exists
        if (!product.getSku().equals(request.getSku())) {
            if (productRepository.findBySku(request.getSku()).isPresent()) {
                throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
            }
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
        
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setIsActive(request.getIsActive());
        
        Product updatedProduct = productRepository.save(product);
        return new ProductResponse(updatedProduct);
    }
    
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Soft delete by setting isActive to false
        product.setIsActive(false);
        productRepository.save(product);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByIsActiveTrue(pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(ProductSearchRequest searchRequest) {
        Sort sort = Sort.by(Sort.Direction.fromString(searchRequest.getSortDirection()), searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Product> products;
        
        if (hasComplexFilters(searchRequest)) {
            // Use complex search with all filters
            products = productRepository.findWithFilters(
                    searchRequest.getSearchTerm(),
                    searchRequest.getCategoryIds(),
                    searchRequest.getBrands(),
                    searchRequest.getMinPrice(),
                    searchRequest.getMaxPrice(),
                    searchRequest.getInStockOnly(),
                    pageable
            );
        } else if (searchRequest.hasSearchTerm()) {
            // Simple text search
            products = productRepository.findBySearchTermAndIsActiveTrue(searchRequest.getSearchTerm(), pageable);
        } else if (searchRequest.hasCategoryFilter() && searchRequest.getCategoryIds().size() == 1) {
            // Single category filter
            products = productRepository.findByCategoryIdAndIsActiveTrue(searchRequest.getCategoryIds().get(0), pageable);
        } else {
            // No filters, return all active products
            products = productRepository.findByIsActiveTrue(pageable);
        }
        
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategoryHierarchy(Long categoryId, int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByCategoryHierarchy(categoryId, pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAvailableBrands() {
        return productRepository.findDistinctBrands();
    }
    
    @Transactional(readOnly = true)
    public Object[] getPriceRange() {
        return productRepository.findPriceRange();
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findFeaturedProducts(pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Long getProductCountByCategory(Long categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }
    
    /**
     * Validate product availability for purchase
     */
    @Transactional(readOnly = true)
    public void validateProductAvailability(Long productId, Integer requestedQuantity) {
        inventoryService.validateProductAvailability(productId, requestedQuantity);
    }
    
    /**
     * Check if product has sufficient quantity available
     */
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer requestedQuantity) {
        return inventoryService.isQuantityAvailable(productId, requestedQuantity);
    }
    
    private boolean hasComplexFilters(ProductSearchRequest searchRequest) {
        return searchRequest.hasSearchTerm() || 
               searchRequest.hasCategoryFilter() || 
               searchRequest.hasBrandFilter() || 
               searchRequest.hasPriceFilter() || 
               searchRequest.getInStockOnly();
    }
}